import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { WritableStreamBuffer } from 'stream-buffers';
import * as crypto from 'crypto';
import { Quittance } from 'src/modele_cible/entities/quittance.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { AuditLog } from 'src/modele_cible/entities/audit_log.entity';
import { Redevance } from 'src/modele_cible/entities/redevance.entity';

/**
 * Vérification d'authenticité : HMAC-SHA256 tronqué, re-calculé à partir de
 * (numero, paiementReference, montant, dateEmission) et du secret désormais
 * stocké dans audit/parametre. Le secret reste non diffusé : les clients
 * ne reçoivent que le jeton déjà inscrit sur la quittance.
 */
const TOKEN_SECRET_ENV = 'QUITTANCE_TOKEN_SECRET';

export function calculerJetonQuittance(q: {
  numero: string;
  paiementId: string;
  montant: number | string;
  dateEmission: Date | string;
}): string {
  const secret = process.env[TOKEN_SECRET_ENV] ?? 'non-configure';
  const base = `${q.numero}|${q.paiementId}|${Number(q.montant).toFixed(2)}|${new Date(q.dateEmission).toISOString()}`;
  return crypto.createHmac('sha256', secret).update(base).digest('hex').substring(0, 32);
}

@Injectable()
export class QuittanceService {
  constructor(
    @InjectRepository(Quittance)
    private readonly quittanceRepository: Repository<Quittance>,
    @InjectRepository(Paiement)
    private readonly paiementRepository: Repository<Paiement>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Redevance)
    private readonly redevanceRepository: Repository<Redevance>,
  ) {}

  private async audit(
    quittanceId: string,
    action: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION',
    operation: string,
    acteurId?: string | null,
    ancien?: any,
    nouveau?: any,
  ): Promise<void> {
    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        tableName: 'quittance',
        recordId: quittanceId,
        action,
        operation,
        acteurId: acteurId ?? null,
        ancienEtat: ancien ?? null,
        nouvelEtat: nouveau ?? null,
      } as any),
    );
  }

  async findAll(): Promise<Quittance[]> {
    return this.quittanceRepository.find({
      relations: ['paiement', 'agent'],
      order: { dateEmission: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Quittance> {
    const q = await this.quittanceRepository.findOne({
      where: { id },
      relations: ['paiement', 'paiement.modePaiement', 'paiement.agent', 'paiement.commercant', 'agent'],
    });
    if (!q) throw new NotFoundException(`Quittance ${id} introuvable.`);
    return q;
  }

  /** Enregistrement de l'audit + token d'authenticité à l'émission. */
  async tracerEmission(quittanceId: string, acteurId?: string | null): Promise<Quittance> {
    const q = await this.findOne(quittanceId);
    if (!q.qrToken) {
      q.qrToken = calculerJetonQuittance({
        numero: q.numero,
        paiementId: q.paiementId,
        montant: Number(q.montant),
        dateEmission: q.dateEmission,
      });
      await this.quittanceRepository.save(q);
    }
    await this.audit(quittanceId, 'CREATION', 'CREATION', acteurId, null, {
      numero: q.numero,
      montant: q.montant,
    });
    return q;
  }

  async historique(quittanceId: string): Promise<AuditLog[]> {
    await this.findOne(quittanceId);
    return this.auditLogRepository.find({
      where: { tableName: 'quittance', recordId: quittanceId },
      order: { createdAt: 'DESC' },
    });
  }

  async verifierAuthenticite(numero: string, token?: string) {
    const q = await this.quittanceRepository.findOne({ where: { numero } });
    if (!q) throw new NotFoundException(`Quittance ${numero} introuvable.`);
    const attendu = calculerJetonQuittance({
      numero: q.numero,
      paiementId: q.paiementId,
      montant: Number(q.montant),
      dateEmission: q.dateEmission,
    });
    const valide = q.statut === 'EMISE' && (!token || token === attendu);
    return {
      numero: q.numero,
      statut: q.statut,
      jetonPresent: !!q.qrToken,
      jetonValide: q.qrToken === attendu,
      tokenTransmisValide: token === undefined ? null : token === attendu,
      authentique: valide && q.qrToken === attendu,
    };
  }

  async annuler(id: string, motif?: string, acteurId?: string | null): Promise<Quittance> {
    const q = await this.findOne(id);
    if (q.statut === 'ANNULEE') {
      throw new BadRequestException('Quittance déjà annulée.');
    }
    const ancien = { statut: q.statut };
    q.statut = 'ANNULEE';
    if (motif) q.documentUrl = null;
    await this.quittanceRepository.save(q);
    await this.audit(id, 'MODIFICATION', 'ANNULATION', acteurId, ancien, { statut: q.statut, motif });
    return q;
  }

  async corriger(id: string, doc?: { documentUrl?: string; qrToken?: string }, acteurId?: string | null): Promise<Quittance> {
    const q = await this.findOne(id);
    if (q.statut === 'ANNULEE') {
      throw new ForbiddenException('Correction refusée sur une quittance annulée.');
    }
    const ancien = { documentUrl: q.documentUrl, qrToken: q.qrToken };
    if (doc?.documentUrl !== undefined) q.documentUrl = doc.documentUrl;
    if (doc?.qrToken !== undefined) q.qrToken = doc.qrToken;
    await this.quittanceRepository.save(q);
    await this.audit(id, 'MODIFICATION', 'CORRECTION', acteurId, ancien, {
      documentUrl: q.documentUrl,
      qrToken: q.qrToken,
    });
    return q;
  }

  async enregistrerRemboursement(id: string, acteurId?: string | null): Promise<Quittance> {
    const q = await this.findOne(id);
    await this.audit(id, 'MODIFICATION', 'REMBOURSEMENT', acteurId, { statut: q.statut }, { statut: q.statut });
    return q;
  }

  async enregistrerSynchronisation(id: string, acteurId?: string | null, source?: string): Promise<Quittance> {
    const q = await this.findOne(id);
    await this.audit(id, 'MODIFICATION', 'SYNCHRONISATION', acteurId, null, { source });
    return q;
  }

  /** PDF de consultation / impression — format d'affichage configurable ultérieurement. */
  async telechargerPdf(id: string): Promise<Buffer> {
    const q = await this.findOne(id);
    const paiement = q.paiement;
    let marcheNom: string | null = null;
    let localNumero: string | null = null;
    if (paiement?.redevanceId) {
      const r = await this.redevanceRepository.findOne({
        where: { id: paiement.redevanceId },
        relations: ['location', 'location.local', 'location.local.zone', 'location.local.zone.marche'],
      });
      marcheNom = r?.location?.local?.zone?.marche?.nom ?? null;
      localNumero = r?.location?.local?.numero ?? null;
    }

    const bufferStream = new WritableStreamBuffer();
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(bufferStream);
    doc.fontSize(18).text('Quittance de paiement', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Référence quittance : ${q.numero}`);
    doc.text(`Référence transaction : ${paiement?.reference ?? '-'}`);
    doc.text(`Date d'émission : ${new Date(q.dateEmission).toLocaleDateString('fr-FR')}`);
    doc.text(`Montant : ${Number(q.montant).toFixed(2)} Ar`);
    doc.text(`Statut : ${q.statut}`);
    doc.text(`Commerçant : ${paiement?.commercantId ?? '-'}`);
    doc.text(`Agent : ${q.agent?.nomComplet ?? q.agentId ?? '-'}`);
    doc.text(`Mode de paiement : ${paiement?.modePaiement?.code ?? '-'}`);
    doc.text(`Marché : ${marcheNom ?? '-'}`);
    doc.text(`Emplacement : ${localNumero ?? '-'}`);
    if (q.qrToken) {
      doc.text(`Jeton d'authenticité : ${q.qrToken}`);
    }
    doc.moveDown();
    doc.text('Document généré — format configurable (modèle officiel non validé).', { align: 'center' });
    doc.end();

    return new Promise((resolve) => {
      bufferStream.on('finish', () => resolve(bufferStream.getContents() as Buffer));
    });
  }
}

