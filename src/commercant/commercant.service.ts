import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Commercant } from 'src/modele_cible/entities/commercant.entity';
import { ActiviteCommerciale } from 'src/modele_cible/entities/activite_commerciale.entity';
import { Affectation } from 'src/modele_cible/entities/affectation.entity';
import { Presence } from 'src/modele_cible/entities/presence.entity';
import { Redevance } from 'src/modele_cible/entities/redevance.entity';
import { Quittance } from 'src/modele_cible/entities/quittance.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { AuditLog } from 'src/modele_cible/entities/audit_log.entity';
import { Location } from 'src/location/entities/location.entity';
import { CreateCommercantDto } from './dto/create-commercant.dto';
import { UpdateCommercantDto } from './dto/update-commercant.dto';
import { QueryCommercantDto } from './dto/query-commercant.dto';
import {
  calculerTotaux,
  evaluerSituation,
} from 'src/perception/situation.calculator';

@Injectable()
export class CommercantService {
  private gatewayBaseUrl: string;

  constructor(
    @InjectRepository(Commercant)
    private readonly commercantRepository: Repository<Commercant>,
    @InjectRepository(ActiviteCommerciale)
    private readonly activiteRepository: Repository<ActiviteCommerciale>,
    @InjectRepository(Affectation)
    private readonly affectationRepository: Repository<Affectation>,
    @InjectRepository(Presence)
    private readonly presenceRepository: Repository<Presence>,
    @InjectRepository(Redevance)
    private readonly redevanceRepository: Repository<Redevance>,
    @InjectRepository(Quittance)
    private readonly quittanceRepository: Repository<Quittance>,
    @InjectRepository(Paiement)
    private readonly paiementRepository: Repository<Paiement>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.gatewayBaseUrl = this.configService.get<string>('GATEWAY_BASE_URL')!;
  }

  /**
   * Autorisation : réutilise le mécanisme existant — chaque utilisateur
   * référencé doit exister côté serviceauth (appUserRoles requis).
   * Aucun nouveau système d'authentification n'est introduit.
   */
  private async verifierUtilisateurGateway(userId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gatewayBaseUrl}/serviceauth/users/${userId}`),
      );
      const userData = response.data;
      if (!userData || !userData.appUserRoles) {
        throw new NotFoundException(`Utilisateur ${userId} introuvable ou rôles manquants.`);
      }
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error.response?.status === 404) {
        throw new NotFoundException(`Utilisateur ${userId} introuvable.`);
      }
      if (error.response?.status === 403) {
        throw new ForbiddenException(`Accès refusé pour l’utilisateur ${userId}.`);
      }
      throw new BadRequestException(
        `Erreur lors de la vérification de l'utilisateur : ${error.message || error}`,
      );
    }
  }

  private async verifierActivite(activiteId: string): Promise<void> {
    const activite = await this.activiteRepository.findOne({ where: { id: activiteId } });
    if (!activite) {
      throw new NotFoundException(`Activité commerciale ${activiteId} introuvable.`);
    }
  }

  private async getExistant(id: string): Promise<Commercant> {
    const commercant = await this.commercantRepository.findOne({
      where: { id },
      relations: ['activite'],
    });
    if (!commercant) {
      throw new NotFoundException(`Commerçant ${id} introuvable.`);
    }
    return commercant;
  }

  async create(dto: CreateCommercantDto): Promise<Commercant> {
    if (dto.userId) {
      await this.verifierUtilisateurGateway(dto.userId);
      const existant = await this.commercantRepository.findOne({ where: { userId: dto.userId } });
      if (existant) {
        throw new BadRequestException(`Un commerçant existe déjà pour l'utilisateur ${dto.userId}.`);
      }
    }
    if (dto.activiteId) {
      await this.verifierActivite(dto.activiteId);
    }
    try {
      return await this.commercantRepository.save(this.commercantRepository.create(dto));
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException('Doublon détecté sur un identifiant unique.');
      }
      throw error;
    }
  }

  async findAll(query: QueryCommercantDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.commercantRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.activite', 'activite');

    if (query.activiteId) {
      qb.andWhere('c.activiteId = :activiteId', { activiteId: query.activiteId });
    }
    if (query.actif !== undefined) {
      qb.andWhere('c.actif = :actif', { actif: query.actif });
    }
    if (query.keyword) {
      qb.andWhere('(c.nif ILIKE :kw OR CAST(c.id AS text) ILIKE :kw)', {
        kw: `%${query.keyword}%`,
      });
    }

    const territorial = query.marcheId || query.zoneId || query.typelocalId || query.periodicite;
    if (territorial) {
      qb.innerJoin(
        Location,
        'loc',
        'loc.commercantId = c.id',
      )
        .innerJoin('loc.local', 'local')
      qb.distinct(true);

      if (query.marcheId || query.zoneId || query.typelocalId) {
        qb.innerJoin('local.zone', 'zone');
      }
      if (query.zoneId) {
        qb.andWhere('zone.id_zone = :zoneId', { zoneId: query.zoneId });
      }
      if (query.marcheId) {
        qb.andWhere('zone.marcheId = :marcheId', { marcheId: query.marcheId });
      }
      if (query.typelocalId) {
        qb.andWhere('local.typelocalId = :typelocalId', { typelocalId: query.typelocalId });
      }
      if (query.periodicite) {
        qb.andWhere('loc.periodicite = :periodicite', { periodicite: query.periodicite });
      }
    }

    qb.orderBy('c.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Commercant> {
    return this.getExistant(id);
  }

  async update(id: string, dto: UpdateCommercantDto): Promise<Commercant> {
    await this.getExistant(id);
    if (dto.userId !== undefined && dto.userId !== null) {
      await this.verifierUtilisateurGateway(dto.userId);
      const existant = await this.commercantRepository.findOne({ where: { userId: dto.userId } });
      if (existant && existant.id !== id) {
        throw new BadRequestException(`Un commerçant existe déjà pour l'utilisateur ${dto.userId}.`);
      }
    }
    if (dto.activiteId) {
      await this.verifierActivite(dto.activiteId);
    }
    try {
      await this.commercantRepository.update(id, dto);
      return this.getExistant(id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException('Doublon détecté sur un identifiant unique.');
      }
      throw error;
    }
  }

  async getHistorique(id: string): Promise<AuditLog[]> {
    await this.getExistant(id);
    return this.auditLogRepository.find({
      where: { tableName: 'commercant', recordId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async getActivite(id: string): Promise<ActiviteCommerciale | null> {
    const commercant = await this.getExistant(id);
    return commercant.activite ?? null;
  }

  async getEmplacements(id: string) {
    await this.getExistant(id);
    const affectations = await this.affectationRepository.find({
      where: { commercantId: id },
      relations: ['local', 'local.zone', 'local.zone.marche', 'local.typelocal'],
      order: { dateDebut: 'DESC' },
    });
    const locations = await this.locationRepository.find({
      where: { commercantId: id },
      relations: ['local', 'local.zone', 'local.zone.marche', 'local.typelocal'],
      order: { date_debut_loc: 'DESC' },
    });
    return { affectations, locations };
  }

  async getPresences(id: string): Promise<Presence[]> {
    await this.getExistant(id);
    return this.presenceRepository.find({
      where: { commercantId: id },
      relations: ['zone', 'local'],
      order: { datePresence: 'DESC' },
    });
  }

  async getSituationFinanciere(id: string) {
    await this.getExistant(id);
    const redevances = await this.redevanceRepository.find({
      where: { commercantId: id },
      relations: ['echeance'],
      order: { dateOuverture: 'DESC' },
    });
    const lignes = redevances.map((r) => ({
      ...r,
      situation: evaluerSituation({
        montantDu: Number(r.montantDu),
        montantRegle: Number(r.montantRegle),
        statut: r.statut,
        dateEcheance: r.echeance?.dateEcheance ?? null,
      }),
    }));
    const totaux = calculerTotaux(redevances);
    return { redevances: lignes, totaux };
  }

  async getPaiements(id: string): Promise<Paiement[]> {
    await this.getExistant(id);
    return this.paiementRepository
      .createQueryBuilder('p')
      .innerJoin('p.paiement_locations', 'pl')
      .innerJoin('pl.location', 'loc')
      .leftJoinAndSelect('p.paiement_locations', 'allPl')
      .where('loc.commercantId = :id', { id })
      .orderBy('p.date_creation', 'DESC')
      .distinct(true)
      .getMany();
  }

  async getQuittances(id: string): Promise<Quittance[]> {
    await this.getExistant(id);
    return this.quittanceRepository
      .createQueryBuilder('q')
      .innerJoin('q.paiement', 'p')
      .innerJoin('p.paiement_locations', 'pl')
      .innerJoin('pl.location', 'loc')
      .where('loc.commercantId = :id', { id })
      .orderBy('q.dateEmission', 'DESC')
      .distinct(true)
      .getMany();
  }
}
