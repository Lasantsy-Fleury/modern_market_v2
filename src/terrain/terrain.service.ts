import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Presence } from 'src/modele_cible/entities/presence.entity';
import { Controle } from 'src/modele_cible/entities/controle.entity';
import { Commercant } from 'src/modele_cible/entities/commercant.entity';
import { Zone } from 'src/zone/entities/zone.entity';
import { Local } from 'src/local/entities/local.entity';
import { Agent } from 'src/modele_cible/entities/agent.entity';
import { Parametre } from 'src/modele_cible/entities/parametre.entity';
import { distanceMetresGPS } from './geo.util';
import { CreatePresenceDto } from './dto/create-presence.dto';
import { CreateControleDto, UpdateControleDto } from './dto/create-controle.dto';

/** Seuils par défaut — surchargeables via la table `parametre` ou le DTO. */
export const CONTROLE_RAYON_DEFAUT_M = 50;
export const CONTROLE_PRECISION_DEFAUT_M = 50;

@Injectable()
export class TerrainService {
  constructor(
    @InjectRepository(Presence)
    private readonly presenceRepository: Repository<Presence>,
    @InjectRepository(Controle)
    private readonly controleRepository: Repository<Controle>,
    @InjectRepository(Commercant)
    private readonly commercantRepository: Repository<Commercant>,
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
    @InjectRepository(Local)
    private readonly localRepository: Repository<Local>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(Parametre)
    private readonly parametreRepository: Repository<Parametre>,
  ) {}

  // ---------- Présences ----------
  async createPresence(dto: CreatePresenceDto): Promise<Presence> {
    const commercant = await this.commercantRepository.findOne({ where: { id: dto.commercantId } });
    if (!commercant) throw new NotFoundException(`Commerçant ${dto.commercantId} introuvable.`);
    const zone = await this.zoneRepository.findOne({ where: { id_zone: dto.zoneId } });
    if (!zone) throw new NotFoundException(`Zone ${dto.zoneId} introuvable.`);
    if (dto.localId) {
      const local = await this.localRepository.findOne({ where: { id_local: dto.localId } });
      if (!local) throw new NotFoundException(`Emplacement ${dto.localId} introuvable.`);
    }
    return this.presenceRepository.save(
      this.presenceRepository.create({
        ...dto,
        datePresence: dto.datePresence ? new Date(dto.datePresence) : new Date(),
      } as DeepPartial<Presence>),
    );
  }

  async findAllPresences(commercantId?: string): Promise<Presence[]> {
    return this.presenceRepository.find({
      where: commercantId ? { commercantId } : {},
      relations: ['zone', 'local'],
      order: { datePresence: 'DESC' },
    });
  }

  // ---------- Contrôles ----------
  async createControle(dto: CreateControleDto): Promise<Controle> {
    const agent = await this.agentRepository.findOne({ where: { id: dto.agentId } });
    if (!agent) throw new NotFoundException(`Agent ${dto.agentId} introuvable.`);
    const zone = await this.zoneRepository.findOne({ where: { id_zone: dto.zoneId } });
    if (!zone) throw new NotFoundException(`Zone ${dto.zoneId} introuvable.`);
    if (dto.commercantId) {
      const c = await this.commercantRepository.findOne({ where: { id: dto.commercantId } });
      if (!c) throw new NotFoundException(`Commerçant ${dto.commercantId} introuvable.`);
    }
    if (dto.presenceId) {
      const p = await this.presenceRepository.findOne({ where: { id: dto.presenceId } });
      if (!p) throw new NotFoundException(`Présence ${dto.presenceId} introuvable.`);
    }

    let local: Local | null = null;
    if (dto.localId) {
      local = await this.localRepository.findOne({ where: { id_local: dto.localId } });
      if (!local) throw new NotFoundException(`Emplacement ${dto.localId} introuvable.`);
    }

    const { resultat, typeAnomalie } = await this.evaluerControle(dto, local);

    return this.controleRepository.save(
      this.controleRepository.create({
        agentId: dto.agentId,
        zoneId: dto.zoneId,
        localId: dto.localId ?? null,
        commercantId: dto.commercantId ?? null,
        presenceId: dto.presenceId ?? null,
        dateControle: dto.dateControle ? new Date(dto.dateControle) : new Date(),
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        precisionGps: dto.precisionGps ?? null,
        comparerPosition: dto.comparerPosition !== false,
        typeAnomalie: typeAnomalie ?? dto.typeAnomalie ?? null,
        observations: dto.observations ?? null,
        statut: 'OUVERT',
        resultat,
      } as DeepPartial<Controle>),
    );
  }

  /**
   * La géolocalisation est un mécanisme technique configurable, jamais une
   * preuve juridique automatique de présence.
   */
  private async evaluerControle(
    dto: CreateControleDto,
    local: Local | null,
  ): Promise<{ resultat: string | null; typeAnomalie: string | null }> {
    if (dto.comparerPosition === false) {
      return { resultat: 'CONTROLE_MANUEL', typeAnomalie: dto.typeAnomalie ?? null };
    }
    if (dto.latitude === undefined || dto.longitude === undefined) {
      return {
        resultat: 'GPS_INDISPONIBLE',
        typeAnomalie: dto.typeAnomalie ?? null,
      };
    }
    const seuilPrecision = await this.seuilConfig(
      'CONTROLE_PRECISION_MAX_M',
      dto.seuilPrecisionMetres,
      CONTROLE_PRECISION_DEFAUT_M,
    );
    if (dto.precisionGps !== undefined && dto.precisionGps > seuilPrecision) {
      return { resultat: 'FAIBLE_PRECISION', typeAnomalie: dto.typeAnomalie ?? null };
    }
    if (!local) {
      return { resultat: 'SANS_EMPLACEMENT_FIXE', typeAnomalie: dto.typeAnomalie ?? null };
    }
    const rayon = await this.seuilConfig('CONTROLE_RAYON_M', dto.rayonMetres, CONTROLE_RAYON_DEFAUT_M);
    const distance = distanceMetresGPS(
      Number(dto.latitude),
      Number(dto.longitude),
      Number(local.latitude),
      Number(local.longitude),
    );
    if (distance <= rayon) {
      return { resultat: 'CONFORME', typeAnomalie: null };
    }
    return { resultat: 'HORS_ZONE', typeAnomalie: dto.typeAnomalie ?? 'HORS_ZONE' };
  }

  private async seuilConfig(
    cle: string,
    surcharge: number | undefined,
    defaut: number,
  ): Promise<number> {
    if (surcharge !== undefined) return surcharge;
    const p = await this.parametreRepository.findOne({
      where: { cle, scopeId: '' },
    });
    if (p && typeof p.valeur === 'object' && p.valeur !== null && 'valeur' in (p.valeur as any)) {
      const v = Number((p.valeur as any).valeur);
      if (!Number.isNaN(v) && v > 0) return v;
    }
    if (p && typeof p.valeur === 'number') return p.valeur;
    return defaut;
  }

  async findAllControles(filters: {
    commercantId?: string;
    zoneId?: string;
    agentId?: string;
    statut?: string;
    resultat?: string;
  }): Promise<Controle[]> {
    const where: any = {};
    if (filters.commercantId) where.commercantId = filters.commercantId;
    if (filters.zoneId) where.zoneId = filters.zoneId;
    if (filters.agentId) where.agentId = filters.agentId;
    if (filters.statut) where.statut = filters.statut;
    if (filters.resultat) where.resultat = filters.resultat;
    return this.controleRepository.find({
      where,
      relations: ['agent', 'zone', 'local', 'commercant', 'presence'],
      order: { dateControle: 'DESC' },
    });
  }

  async findOneControle(id: string): Promise<Controle> {
    const c = await this.controleRepository.findOne({
      where: { id },
      relations: ['agent', 'zone', 'local', 'commercant', 'presence'],
    });
    if (!c) throw new NotFoundException(`Contrôle ${id} introuvable.`);
    return c;
  }

  async historiqueControles(commercantId: string): Promise<Controle[]> {
    const c = await this.commercantRepository.findOne({ where: { id: commercantId } });
    if (!c) throw new NotFoundException(`Commerçant ${commercantId} introuvable.`);
    return this.controleRepository.find({
      where: { commercantId },
      relations: ['agent', 'zone', 'local', 'presence'],
      order: { dateControle: 'DESC' },
    });
  }

  async updateControle(id: string, dto: UpdateControleDto): Promise<Controle> {
    await this.findOneControle(id);
    await this.controleRepository.update(id, dto as any);
    return this.findOneControle(id);
  }
}
