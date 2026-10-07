import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { Redevance } from 'src/modele_cible/entities/redevance.entity';
import { Echeance } from 'src/modele_cible/entities/echeance.entity';
import { PaiementRedevance } from 'src/modele_cible/entities/paiement_redevance.entity';
import { Recette } from 'src/modele_cible/entities/recette.entity';
import { Quittance } from 'src/modele_cible/entities/quittance.entity';
import { ModePaiement } from 'src/modele_cible/entities/mode_paiement.entity';
import { Commercant } from 'src/modele_cible/entities/commercant.entity';
import { TypeDroit } from 'src/modele_cible/entities/type_droit.entity';
import { Parametre } from 'src/modele_cible/entities/parametre.entity';
import { CreerPaiementDto, UpdatePaiementDto } from './dto/creer-paiement.dto';
import { CreerEcheanceDto } from './dto/creer-echeance.dto';
import { CreerModePaiementDto } from './dto/mode-paiement.dto';
import {
  calculerTotaux,
  evaluerSituation,
  SituationFinanciere,
} from './situation.calculator';

@Injectable()
export class PerceptionService {
  constructor(
    @InjectRepository(Paiement)
    private readonly paiementRepository: Repository<Paiement>,
    @InjectRepository(Redevance)
    private readonly redevanceRepository: Repository<Redevance>,
    @InjectRepository(Echeance)
    private readonly echeanceRepository: Repository<Echeance>,
    @InjectRepository(PaiementRedevance)
    private readonly paiementRedevanceRepository: Repository<PaiementRedevance>,
    @InjectRepository(Recette)
    private readonly recetteRepository: Repository<Recette>,
    @InjectRepository(Quittance)
    private readonly quittanceRepository: Repository<Quittance>,
    @InjectRepository(ModePaiement)
    private readonly modePaiementRepository: Repository<ModePaiement>,
    @InjectRepository(Commercant)
    private readonly commercantRepository: Repository<Commercant>,
    @InjectRepository(TypeDroit)
    private readonly typeDroitRepository: Repository<TypeDroit>,
    @InjectRepository(Parametre)
    private readonly parametreRepository: Repository<Parametre>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ---------- Modes de paiement (extensibles : espèces, Mobile Money, autres) ----------
  async createModePaiement(dto: CreerModePaiementDto): Promise<ModePaiement> {
    const existant = await this.modePaiementRepository.findOne({ where: { code: dto.code } });
    if (existant) {
      throw new ConflictException(`Mode de paiement ${dto.code} déjà existant.`);
    }
    return this.modePaiementRepository.save(
      this.modePaiementRepository.create(dto as DeepPartial<ModePaiement>),
    );
  }

  async findAllModePaiements(): Promise<ModePaiement[]> {
    return this.modePaiementRepository.find({ order: { code: 'ASC' } });
  }

  // ---------- Échéances ----------
  async createEcheance(dto: CreerEcheanceDto): Promise<Echeance> {
    const typeDroit = await this.typeDroitRepository.findOne({ where: { id: dto.typeDroitId } });
    if (!typeDroit) throw new NotFoundException(`Type de droit ${dto.typeDroitId} introuvable.`);
    if (!typeDroit.actif) {
      throw new BadRequestException(`Le type de droit ${typeDroit.code} est inactif.`);
    }
    const debut = new Date(dto.periodeDebut);
    const fin = new Date(dto.periodeFin);
    if (debut > fin) {
      throw new BadRequestException('periodeDebut doit être <= periodeFin.');
    }
    return this.echeanceRepository.save(
      this.echeanceRepository.create({
        ...dto,
        periodeDebut: debut,
        periodeFin: fin,
        dateEcheance: new Date(dto.dateEcheance),
      } as DeepPartial<Echeance>),
    );
  }

  async findAllEcheances(): Promise<Echeance[]> {
    return this.echeanceRepository.find({
      relations: ['typeDroit', 'location', 'commercant'],
      order: { dateEcheance: 'DESC' },
    });
  }

  // ---------- Paiements (cycle : commerçant → redevance → paiement → quittance → recette) ----------
  async enregistrerPaiement(dto: CreerPaiementDto): Promise<any> {
    const commercant = await this.commercantRepository.findOne({
      where: { id: dto.commercantId },
    });
    if (!commercant) throw new NotFoundException(`Commerçant ${dto.commercantId} introuvable.`);

    const redevance = await this.redevanceRepository.findOne({
      where: { id: dto.redevanceId },
      relations: ['echeance', 'echeance.typeDroit'],
    });
    if (!redevance) throw new NotFoundException(`Redevance ${dto.redevanceId} introuvable.`);
    if (redevance.commercantId !== dto.commercantId) {
      throw new BadRequestException(
        "La redevance ne correspond pas au commerçant indiqué.",
      );
    }
    if (redevance.statut === 'ANNULEE') {
      throw new BadRequestException("Paiement interdit sur une obligation annulée.");
    }
    if (redevance.statut === 'SOLDEE' || Number(redevance.montantRegle) >= Number(redevance.montantDu)) {
      throw new ConflictException("Double paiement : l'obligation est déjà soldée.");
    }
    if (redevance.echeance?.typeDroit && redevance.echeance.typeDroit.actif === false) {
      throw new BadRequestException("Paiement interdit sur un type de droit inactif.");
    }
    if (dto.montant <= 0) {
      throw new BadRequestException('Le montant doit être strictement positif.');
    }
    const reste = Number(redevance.montantDu) - Number(redevance.montantRegle);
    if (dto.montant > reste && !(await this.surpaiementAutorise())) {
      throw new BadRequestException(
        `Paiement supérieur au restant dû (${reste}) interdit par la configuration.`,
      );
    }
    const doublonRef = await this.paiementRepository.findOne({ where: { reference: dto.reference } });
    if (doublonRef) {
      throw new ConflictException(`Référence de paiement déjà utilisée : ${dto.reference}`);
    }
    if (dto.modePaiementId) {
      const mode = await this.modePaiementRepository.findOne({ where: { id: dto.modePaiementId } });
      if (!mode) throw new NotFoundException(`Mode de paiement ${dto.modePaiementId} introuvable.`);
      if (!mode.actif) {
        throw new BadRequestException(`Le mode de paiement ${mode.code} est inactif.`);
      }
    }

    return this.dataSource.manager.transaction(async (manager) => {
      const datePaiement = dto.datePaiement ? new Date(dto.datePaiement) : new Date();

      const paiement = (await manager.save(
        manager.create(Paiement, {
          reference: dto.reference,
          status: 'success',
          raison: dto.raison ?? 'Règlement redevance',
          montant: dto.montant,
          modePaiementId: dto.modePaiementId ?? null,
          canal: dto.canal ?? null,
          agentId: dto.agentId ?? null,
          source: dto.source,
          commercantId: dto.commercantId,
          redevanceId: dto.redevanceId,
          date_creation: datePaiement,
        } as any),
      )) as Paiement;

      // Imputation sur paiement_redevance
      await manager.save(
        manager.create(PaiementRedevance, {
          paiementId: paiement.id_paiement,
          redevanceId: redevance.id,
          montantImpute: dto.montant,
        } as any),
      );

      // Mise à jour de la redevance
      redevance.montantRegle = Number(redevance.montantRegle) + dto.montant;
      redevance.statut =
        Number(redevance.montantRegle) >= Number(redevance.montantDu) ? 'SOLDEE' : 'PARTIELLE';
      await manager.save(redevance);

      const recette = (await manager.save(
        manager.create(Recette, {
          paiementId: paiement.id_paiement,
          dateRecette: datePaiement,
          montant: dto.montant,
          modePaiementId: dto.modePaiementId ?? null,
          canal: dto.canal ?? null,
        } as any),
      )) as Recette;

      const quittance = (await manager.save(
        manager.create(Quittance, {
          numero: paiement.reference,
          paiementId: paiement.id_paiement,
          montant: dto.montant,
          dateEmission: datePaiement,
          statut: 'EMISE',
          agentId: dto.agentId ?? null,
        } as any),
      )) as Quittance;

      return { paiement, redevance, recette, quittance };
    });
  }

  async findOnePaiement(id: string): Promise<Paiement> {
    const p = await this.paiementRepository.findOne({
      where: { id_paiement: id },
      relations: ['modePaiement', 'agent', 'commercant', 'redevance', 'paiement_locations'],
    });
    if (!p) throw new NotFoundException(`Paiement ${id} introuvable.`);
    return p;
  }

  /**
   * Protections : un paiement validé (success) est immuable sur ses montants,
   * sa référence, sa redevance et son commerçant — seule la raison et le
   * passage en failed sont permis.
   */
  async updatePaiement(id: string, dto: UpdatePaiementDto): Promise<Paiement> {
    const p = await this.findOnePaiement(id);
    if (p.status === 'success') {
      if (dto.status !== undefined && dto.status !== 'failed') {
        throw new ForbiddenException(
          'Modification frauduleuse : un paiement validé ne peut pas être modifié.',
        );
      }
      if (dto.status === 'failed') {
        // Autorisé : annulation du paiement côté journal.
      }
      // Toute autre modification structurelle est bloquée par le DTO (limits).
    }
    await this.paiementRepository.update(id, dto as any);
    return this.findOnePaiement(id);
  }

  async findPaiementsCommercant(commercantId: string): Promise<Paiement[]> {
    return this.paiementRepository.find({
      where: { commercantId },
      relations: ['modePaiement', 'agent', 'redevance'],
      order: { date_creation: 'DESC' },
    });
  }

  // ---------- Situation centralisée ----------
  async getSituationCommercant(commercantId: string) {
    const c = await this.commercantRepository.findOne({ where: { id: commercantId } });
    if (!c) throw new NotFoundException(`Commerçant ${commercantId} introuvable.`);
    const redevances = await this.redevanceRepository.find({
      where: { commercantId },
      relations: ['echeance'],
      order: { dateOuverture: 'DESC' },
    });
    const lignes = redevances.map((r) => ({
      redevanceId: r.id,
      montantDu: Number(r.montantDu),
      montantRegle: Number(r.montantRegle),
      statut: r.statut,
      echeanceId: r.echeanceId ?? null,
      dateEcheance: r.echeance?.dateEcheance ?? null,
      situation: evaluerSituation({
        montantDu: Number(r.montantDu),
        montantRegle: Number(r.montantRegle),
        statut: r.statut,
        dateEcheance: r.echeance?.dateEcheance ?? null,
      }),
    }));
    const compteurs = lignes.reduce((acc, l) => {
      acc[l.situation] = (acc[l.situation] ?? 0) + 1;
      return acc;
    }, {} as Record<SituationFinanciere, number>);
    return {
      commercantId,
      lignes,
      compteurs,
      totaux: calculerTotaux(lignes),
    };
  }

  private async surpaiementAutorise(): Promise<boolean> {
    const p = await this.parametreRepository.findOne({
      where: { cle: 'AUTORISER_SURPAIEMENT', scopeId: '' },
    });
    if (!p) return false;
    const v: any = p.valeur;
    if (typeof v === 'boolean') return v;
    if (v && typeof v === 'object' && typeof v.valeur === 'boolean') return v.valeur;
    return false;
  }
}
