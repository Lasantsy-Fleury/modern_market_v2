import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recette } from 'src/modele_cible/entities/recette.entity';
import { Redevance } from 'src/modele_cible/entities/redevance.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { Quittance } from 'src/modele_cible/entities/quittance.entity';
import { Presence } from 'src/modele_cible/entities/presence.entity';
import { Controle } from 'src/modele_cible/entities/controle.entity';
import { Commercant } from 'src/modele_cible/entities/commercant.entity';
import { Echeance } from 'src/modele_cible/entities/echeance.entity';
import { SuiviFiltresDto } from './dto/suivi-filtres.dto';
import { evaluerSituation, SituationFinanciere } from 'src/perception/situation.calculator';

interface JoinPath {
  /** Alias de la table dans laquelle appliquer les filtres territoriaux. */
  redevanceLocationJoin: string;
}

@Injectable()
export class SuiviService {
  constructor(
    @InjectRepository(Recette)
    private readonly recetteRepository: Repository<Recette>,
    @InjectRepository(Redevance)
    private readonly redevanceRepository: Repository<Redevance>,
    @InjectRepository(Paiement)
    private readonly paiementRepository: Repository<Paiement>,
    @InjectRepository(Quittance)
    private readonly quittanceRepository: Repository<Quittance>,
    @InjectRepository(Presence)
    private readonly presenceRepository: Repository<Presence>,
    @InjectRepository(Controle)
    private readonly controleRepository: Repository<Controle>,
    @InjectRepository(Commercant)
    private readonly commercantRepository: Repository<Commercant>,
    @InjectRepository(Echeance)
    private readonly echeanceRepository: Repository<Echeance>,
  ) {}

  private bornes(f: SuiviFiltresDto) {
    const now = new Date();
    const debut = f.dateDebut ? new Date(f.dateDebut) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const fin = f.dateFin ? new Date(f.dateFin) : new Date(debut);
    fin.setHours(23, 59, 59, 999);
    return { debut, fin };
  }

  // ---------- Recettes (jour / mois / année) ----------
  async getRecettesAgregat(f: SuiviFiltresDto) {
    const { fin } = this.bornes(f);
    const todayStart = new Date(fin);
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(fin.getFullYear(), fin.getMonth(), 1);
    const yearStart = new Date(fin.getFullYear(), 0, 1);

    const apply = (qb: any, from: Date, to: Date) => {
      qb.andWhere('r.dateRecette BETWEEN :from AND :to', { from: this.fmt(from), to: this.fmt(to) });
      if (f.modePaiementId) qb.andWhere('r.modePaiementId = :mp', { mp: f.modePaiementId });
      if (f.agentId || f.communeId || f.marcheId || f.zoneId || f.typeDroitId || f.periodiciteId) {
        qb.innerJoin('r.paiement', 'p');
      }
      if (f.agentId) qb.andWhere('p.agentId = :ag', { ag: f.agentId });
      if (f.communeId || f.marcheId || f.zoneId) {
        qb.innerJoin('p.paiement_locations', 'pl').innerJoin('pl.location', 'loc')
          .innerJoin('loc.local', 'loc0').innerJoin('loc0.zone', 'z');
        if (f.communeId) {
          qb.innerJoin('z.marche', 'm');
          qb.andWhere('m.communeId = :communeId', { communeId: f.communeId });
        }
        if (f.marcheId) {
          if (!f.communeId) qb.innerJoin('z.marche', 'm');
          qb.andWhere('m.id = :marcheId', { marcheId: f.marcheId });
        }
        if (f.zoneId) qb.andWhere('z.id_zone = :zoneId', { zoneId: f.zoneId });
      }
      if (f.typeDroitId || f.periodiciteId) {
        qb.leftJoin('p.redevance', 'rd').leftJoin('rd.echeance', 'ec').leftJoin('ec.typeDroit', 'td');
        if (f.typeDroitId) qb.andWhere('td.id = :td', { td: f.typeDroitId });
        if (f.periodiciteId) qb.andWhere('td.periodiciteId = :per', { per: f.periodiciteId });
      }
      return qb;
    };

    const sum = (from: Date, to: Date) =>
      apply(
        this.recetteRepository.createQueryBuilder('r').select('COALESCE(SUM(r.montant), 0)', 'total'),
        from,
        to,
      ).getRawOne().then((r) => Number(r?.total ?? 0));

    const [jour, mois, annee] = await Promise.all([
      sum(todayStart, fin),
      sum(monthStart, fin),
      sum(yearStart, fin),
    ]);
    return { jour, mois, annee };
  }

  // ---------- Redevances : attendu / encaissé / impayés / retards / partiels ----------
  async getSituationFinanciere(f: SuiviFiltresDto) {
    const qb = this.redevanceRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.echeance', 'ec')
      .leftJoin('ec.typeDroit', 'td')
      .leftJoin('r.location', 'loc')
      .leftJoin('loc.local', 'l')
      .leftJoin('l.zone', 'z')
      .leftJoin('z.marche', 'm')
      .where('r.statut != :annulee', { annulee: 'ANNULEE' });
    if (f.communeId) qb.andWhere('m.communeId = :communeId', { communeId: f.communeId });
    if (f.marcheId) qb.andWhere('m.id = :marcheId', { marcheId: f.marcheId });
    if (f.zoneId) qb.andWhere('z.id_zone = :zoneId', { zoneId: f.zoneId });
    if (f.typeDroitId) qb.andWhere('td.id = :td', { td: f.typeDroitId });
    if (f.periodiciteId) qb.andWhere('td.periodiciteId = :per', { per: f.periodiciteId });

    const redevances = await qb.getMany();
    let montantAttendu = 0;
    let montantEncaisse = 0;
    let impayes = { nombre: 0, montant: 0 };
    let retards = { nombre: 0, montant: 0 };
    let partiels = { nombre: 0, montant: 0 };

    for (const r of redevances) {
      const du = Number(r.montantDu) || 0;
      const regle = Number(r.montantRegle) || 0;
      montantAttendu += du;
      montantEncaisse += regle;
      const situation = evaluerSituation({
        montantDu: du,
        montantRegle: regle,
        statut: r.statut,
        dateEcheance: r.echeance?.dateEcheance ?? null,
      });
      const reste = Math.max(du - regle, 0);
      if (situation === SituationFinanciere.EN_RETARD) {
        retards.nombre++;
        retards.montant += reste;
      } else if (situation === SituationFinanciere.PARTIELLEMENT_PAYEE) {
        partiels.nombre++;
        partiels.montant += reste;
      } else if (situation === SituationFinanciere.IMPAYEE || situation === SituationFinanciere.A_ECHEANCE) {
        impayes.nombre++;
        impayes.montant += reste;
      }
    }
    return { montantAttendu, montantEncaisse, impayes, retards, paiementsPartiels: partiels };
  }

  // ---------- Activité opérationnelle ----------
  async getActivite(f: SuiviFiltresDto) {
    const { debut, fin } = this.bornes(f);

    const commerants = await this.commercantRepository.count();

    const presentes = await this.presenceRepository
      .createQueryBuilder('p')
      .select('COUNT(DISTINCT p.commercantId)', 'n')
      .leftJoin('p.zone', 'z')
      .leftJoin('z.marche', 'm')
      .where('p.datePresence BETWEEN :d AND :f', { d: this.fmt(debut), f: this.fmt(fin) })
      .andWhere(f.zoneId ? 'z.id_zone = :z' : '1=1', { z: f.zoneId })
      .andWhere(f.marcheId ? 'm.id = :mid' : '1=1', { mid: f.marcheId })
      .andWhere(f.communeId ? 'm.communeId = :c' : '1=1', { c: f.communeId })
      .getRawOne()
      .then((r) => Number(r?.n ?? 0));

    const controles = await this.controleRepository
      .createQueryBuilder('c')
      .select('COUNT(DISTINCT c.commercantId)', 'n')
      .leftJoin('c.zone', 'z')
      .leftJoin('z.marche', 'm')
      .where('c.dateControle BETWEEN :d AND :f', { d: debut, f: fin })
      .andWhere(f.zoneId ? 'z.id_zone = :z' : '1=1', { z: f.zoneId })
      .andWhere(f.marcheId ? 'm.id = :mid' : '1=1', { mid: f.marcheId })
      .andWhere(f.communeId ? 'm.communeId = :c' : '1=1', { c: f.communeId })
      .andWhere(f.agentId ? 'c.agentId = :ag' : '1=1', { ag: f.agentId })
      .getRawOne()
      .then((r) => Number(r?.n ?? 0));

    const tickets = await this.echeanceRepository
      .createQueryBuilder('e')
      .leftJoin('e.typeDroit', 'td')
      .leftJoin('e.location', 'loc')
      .leftJoin('loc.local', 'l')
      .leftJoin('l.zone', 'z')
      .leftJoin('z.marche', 'm')
      .where(`td.famille = 'TICKET'`)
      .andWhere('e.periodeDebut BETWEEN :d AND :f', { d: this.fmt(debut), f: this.fmt(fin) })
      .andWhere(f.zoneId ? 'z.id_zone = :z' : '1=1', { z: f.zoneId })
      .andWhere(f.marcheId ? 'm.id = :mid' : '1=1', { mid: f.marcheId })
      .andWhere(f.communeId ? 'm.communeId = :c' : '1=1', { c: f.communeId })
      .getCount();

    const quittances = await this.quittanceRepository
      .createQueryBuilder('q')
      .innerJoin('q.paiement', 'p')
      .leftJoin('p.paiement_locations', 'pl')
      .leftJoin('pl.location', 'loc')
      .leftJoin('loc.local', 'l')
      .leftJoin('l.zone', 'z')
      .leftJoin('z.marche', 'm')
      .where(`q.statut = 'EMISE'`)
      .andWhere('q.dateEmission BETWEEN :d AND :f', { d: debut, f: fin })
      .andWhere(f.zoneId ? 'z.id_zone = :z' : '1=1', { z: f.zoneId })
      .andWhere(f.marcheId ? 'm.id = :mid' : '1=1', { mid: f.marcheId })
      .andWhere(f.communeId ? 'm.communeId = :c' : '1=1', { c: f.communeId })
      .andWhere(f.agentId ? 'p.agentId = :ag' : '1=1', { ag: f.agentId })
      .andWhere(f.modePaiementId ? 'p.modePaiementId = :mp' : '1=1', { mp: f.modePaiementId })
      .getCount();

    return {
      nombreCommercants: commerants,
      commercantsPresents: presentes,
      commercantsControles: controles,
      ticketsDelivres: tickets,
      quittancesEmises: quittances,
    };
  }

  // ---------- État de rapprochement ----------
  async getRapprochement(f: SuiviFiltresDto) {
    const { debut, fin } = this.bornes(f);

    const paiements = await this.paiementRepository
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.montant), 0)', 't')
      .where(`p.status = 'success'`)
      .andWhere('p.date_creation BETWEEN :d AND :f', { d: debut, f: fin })
      .andWhere(f.agentId ? 'p.agentId = :ag' : '1=1', { ag: f.agentId })
      .andWhere(f.modePaiementId ? 'p.modePaiementId = :mp' : '1=1', { mp: f.modePaiementId })
      .andWhere(
        f.communeId || f.marcheId || f.zoneId
          ? `EXISTS (SELECT 1 FROM paiement_location pl JOIN location loc ON loc.id_location = pl."locationId" JOIN local l ON l.id_local = loc."localId" JOIN zone z ON z.id_zone = l."zoneId" JOIN marche m ON m.id = z."marcheId" WHERE pl."paiementId" = p.id_paiement ${f.communeId ? `AND m."communeId" = '${f.communeId}'` : ''} ${f.marcheId ? `AND m.id = '${f.marcheId}'` : ''} ${f.zoneId ? `AND z.id_zone = '${f.zoneId}'` : ''})`
          : '1=1',
      )
      .getRawOne()
      .then((r) => Number(r?.t ?? 0));

    const quittances = await this.quittanceRepository
      .createQueryBuilder('q')
      .select('COALESCE(SUM(q.montant), 0)', 't')
      .where(`q.statut = 'EMISE'`)
      .andWhere('q.dateEmission BETWEEN :d AND :f', { d: debut, f: fin })
      .andWhere(f.agentId ? 'q.agentId = :ag' : '1=1', { ag: f.agentId })
      .andWhere(
        f.modePaiementId
          ? `EXISTS (SELECT 1 FROM paiement p WHERE p.id_paiement = q."paiementId" AND p."modePaiementId" = '${f.modePaiementId}')`
          : '1=1',
      )
      .getRawOne()
      .then((r) => Number(r?.t ?? 0));

    const recettes = await this.recetteRepository
      .createQueryBuilder('r')
      .select('COALESCE(SUM(r.montant), 0)', 't')
      .where('r.dateRecette BETWEEN :d AND :f', { d: this.fmt(debut), f: this.fmt(fin) })
      .andWhere(f.modePaiementId ? 'r.modePaiementId = :mp' : '1=1', { mp: f.modePaiementId })
      .getRawOne()
      .then((r) => Number(r?.t ?? 0));

    const encaissements = paiements; // encaissements = montants de paiements validés

    const coherent =
      Math.abs(paiements - quittances) < 0.01 &&
      Math.abs(paiements - recettes) < 0.01;

    return {
      paiementsEnregistres: paiements,
      quittances,
      recettes,
      encaissements,
      coherent,
      ecarts: {
        paiementsVsQuittances: Number((paiements - quittances).toFixed(2)),
        paiementsVsRecettes: Number((paiements - recettes).toFixed(2)),
      },
    };
  }

  // ---------- Détails paginés ----------
  async getRecettesDetails(f: SuiviFiltresDto) {
    const page = f.page ?? 1;
    const limit = f.limit ?? 20;
    const { debut, fin } = this.bornes(f);
    const qb = this.recetteRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.paiement', 'p')
      .where('r.dateRecette BETWEEN :d AND :f', { d: this.fmt(debut), f: this.fmt(fin) })
      .orderBy('r.dateRecette', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (f.modePaiementId) qb.andWhere('r.modePaiementId = :mp', { mp: f.modePaiementId });
    if (f.agentId) qb.andWhere('p.agentId = :ag', { ag: f.agentId });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  private fmt(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}
