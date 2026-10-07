import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Periodicite } from 'src/modele_cible/entities/periodicite.entity';
import { TypeDroit } from 'src/modele_cible/entities/type_droit.entity';
import { Tarif } from 'src/modele_cible/entities/tarif.entity';
import { ActiviteCommerciale } from 'src/modele_cible/entities/activite_commerciale.entity';
import { CreatePeriodiciteDto } from './dto/create-periodicite.dto';
import { UpdatePeriodiciteDto } from './dto/update-periodicite.dto';
import { CreateTypeDroitDto } from './dto/create-type-droit.dto';
import { UpdateTypeDroitDto } from './dto/update-type-droit.dto';
import { CreateTarifDto } from './dto/create-tarif.dto';
import { UpdateTarifDto } from './dto/update-tarif.dto';
import { CreateActiviteDto } from './dto/create-activite.dto';
import { UpdateActiviteDto } from './dto/update-activite.dto';
import { ResoudreTarifQueryDto } from './dto/resoudre-tarif.query.dto';

@Injectable()
export class DroitsService {
  constructor(
    @InjectRepository(Periodicite)
    private readonly periodiciteRepository: Repository<Periodicite>,
    @InjectRepository(TypeDroit)
    private readonly typeDroitRepository: Repository<TypeDroit>,
    @InjectRepository(Tarif)
    private readonly tarifRepository: Repository<Tarif>,
    @InjectRepository(ActiviteCommerciale)
    private readonly activiteRepository: Repository<ActiviteCommerciale>,
  ) {}

  // ---------- Périodicités ----------
  async createPeriodicite(dto: CreatePeriodiciteDto): Promise<Periodicite> {
    const existante = await this.periodiciteRepository.findOne({ where: { code: dto.code } });
    if (existante) {
      throw new ConflictException(`Une périodicité avec le code ${dto.code} existe déjà.`);
    }
    try {
      return await this.periodiciteRepository.save(
        this.periodiciteRepository.create(dto as DeepPartial<Periodicite>),
      );
    } catch (error: any) {
      if (error.code === '23505') throw new ConflictException(`Code périodicité déjà utilisé : ${dto.code}`);
      throw error;
    }
  }

  async findAllPeriodicites(): Promise<Periodicite[]> {
    return this.periodiciteRepository.find({ order: { code: 'ASC' } });
  }

  async findOnePeriodicite(id: string): Promise<Periodicite> {
    const p = await this.periodiciteRepository.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Périodicité ${id} introuvable.`);
    return p;
  }

  async updatePeriodicite(id: string, dto: UpdatePeriodiciteDto): Promise<Periodicite> {
    await this.findOnePeriodicite(id);
    if (dto.code) {
      const doublon = await this.periodiciteRepository.findOne({ where: { code: dto.code } });
      if (doublon && doublon.id !== id) {
        throw new ConflictException(`Code périodicité déjà utilisé : ${dto.code}`);
      }
    }
    await this.periodiciteRepository.update(id, dto as any);
    return this.findOnePeriodicite(id);
  }

  // ---------- Types de droit / ticket ----------
  async createTypeDroit(dto: CreateTypeDroitDto): Promise<TypeDroit> {
    await this.verifierPeriodiciteActive(dto.periodiciteId);
    const existant = await this.typeDroitRepository.findOne({ where: { code: dto.code } });
    if (existant) {
      throw new ConflictException(`Un type de droit avec le code ${dto.code} existe déjà.`);
    }
    return this.typeDroitRepository.save(
      this.typeDroitRepository.create(dto as DeepPartial<TypeDroit>),
    );
  }

  async findAllTypeDroits(): Promise<TypeDroit[]> {
    return this.typeDroitRepository.find({ relations: ['periodicite'], order: { code: 'ASC' } });
  }

  async findOneTypeDroit(id: string): Promise<TypeDroit> {
    const td = await this.typeDroitRepository.findOne({ where: { id }, relations: ['periodicite'] });
    if (!td) throw new NotFoundException(`Type de droit ${id} introuvable.`);
    return td;
  }

  async updateTypeDroit(id: string, dto: UpdateTypeDroitDto): Promise<TypeDroit> {
    await this.findOneTypeDroit(id);
    if (dto.periodiciteId) {
      await this.verifierPeriodiciteActive(dto.periodiciteId);
    }
    if (dto.code) {
      const doublon = await this.typeDroitRepository.findOne({ where: { code: dto.code } });
      if (doublon && doublon.id !== id) {
        throw new ConflictException(`Code déjà utilisé : ${dto.code}`);
      }
    }
    await this.typeDroitRepository.update(id, dto as any);
    return this.findOneTypeDroit(id);
  }

  private async verifierPeriodiciteActive(id: string): Promise<Periodicite> {
    const p = await this.periodiciteRepository.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Périodicité ${id} introuvable.`);
    if (p.actif === false) {
      throw new BadRequestException(`La périodicité ${p.code} est inactive et ne peut pas être utilisée.`);
    }
    return p;
  }

  // ---------- Activités ----------
  async createActivite(dto: CreateActiviteDto): Promise<ActiviteCommerciale> {
    const existante = await this.activiteRepository.findOne({ where: { code: dto.code } });
    if (existante) {
      throw new ConflictException(`Une activité avec le code ${dto.code} existe déjà.`);
    }
    try {
      return await this.activiteRepository.save(
        this.activiteRepository.create(dto as DeepPartial<ActiviteCommerciale>),
      );
    } catch (error: any) {
      if (error.code === '23505') throw new ConflictException(`Code activité déjà utilisé : ${dto.code}`);
      throw error;
    }
  }

  async findAllActivites(): Promise<ActiviteCommerciale[]> {
    return this.activiteRepository.find({ order: { code: 'ASC' } });
  }

  async findOneActivite(id: string): Promise<ActiviteCommerciale> {
    const a = await this.activiteRepository.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Activité ${id} introuvable.`);
    return a;
  }

  async updateActivite(id: string, dto: UpdateActiviteDto): Promise<ActiviteCommerciale> {
    await this.findOneActivite(id);
    if (dto.code) {
      const doublon = await this.activiteRepository.findOne({ where: { code: dto.code } });
      if (doublon && doublon.id !== id) {
        throw new ConflictException(`Code activité déjà utilisé : ${dto.code}`);
      }
    }
    await this.activiteRepository.update(id, dto as any);
    return this.findOneActivite(id);
  }

  // ---------- Tarifs ----------
  async createTarif(dto: CreateTarifDto): Promise<Tarif> {
    const typeDroit = await this.typeDroitRepository.findOne({ where: { id: dto.typeDroitId } });
    if (!typeDroit) throw new NotFoundException(`Type de droit ${dto.typeDroitId} introuvable.`);
    if (!typeDroit.actif) {
      throw new BadRequestException(`Le type de droit ${typeDroit.code} est inactif.`);
    }
    if (dto.periodiciteId) {
      await this.verifierPeriodiciteActive(dto.periodiciteId);
    }
    this.validerDatesTarif(dto.dateDebut, dto.dateFin);
    this.validerPorteeTarif(dto);
    await this.verifierDoublonTarif(dto);
    return this.tarifRepository.save(
      this.tarifRepository.create(this.mapTarif(dto) as DeepPartial<Tarif>),
    );
  }

  async findAllTarifs(): Promise<Tarif[]> {
    return this.tarifRepository.find({
      relations: ['typeDroit', 'periodicite', 'zone', 'marche', 'local', 'typelocal', 'activite'],
      order: { dateDebut: 'DESC' },
    });
  }

  async findOneTarif(id: string): Promise<Tarif> {
    const t = await this.tarifRepository.findOne({
      where: { id },
      relations: ['typeDroit', 'periodicite', 'zone', 'marche', 'local', 'typelocal', 'activite'],
    });
    if (!t) throw new NotFoundException(`Tarif ${id} introuvable.`);
    return t;
  }

  async updateTarif(id: string, dto: UpdateTarifDto): Promise<Tarif> {
    const actuel = await this.findOneTarif(id);
    if (dto.typeDroitId) {
      const td = await this.typeDroitRepository.findOne({ where: { id: dto.typeDroitId } });
      if (!td) throw new NotFoundException(`Type de droit ${dto.typeDroitId} introuvable.`);
      if (!td.actif) throw new BadRequestException(`Le type de droit ${td.code} est inactif.`);
    }
    if (dto.periodiciteId) {
      await this.verifierPeriodiciteActive(dto.periodiciteId);
    }
    const fusion = { ...actuel, ...dto };
    this.validerDatesTarif(fusion.dateDebut as any, fusion.dateFin as any);
    this.validerPorteeTarif(fusion as any);
    await this.verifierDoublonTarif(fusion as any, id);
    await this.tarifRepository.update(id, this.mapTarif(dto) as any);
    return this.findOneTarif(id);
  }

  /**
   * Résolution : ne renvoie que les tarifs ACTIFS et DANS LEUR PÉRIODE DE
   * VALIDITÉ correspondant aux dimensions demandées. Un tarif inactif ou
   * hors période ne peut donc jamais être "utilisé" via ce point d'entrée.
   */
  async resoudreTarifs(q: ResoudreTarifQueryDto): Promise<Tarif[]> {
    const date = q.date ? new Date(q.date) : new Date();
    const qb = this.tarifRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.typeDroit', 'typeDroit')
      .leftJoinAndSelect('t.periodicite', 'periodicite')
      .where('t.actif = :actif', { actif: true })
      .andWhere('t.dateDebut <= :date', { date })
      .andWhere('(t.dateFin IS NULL OR t.dateFin >= :date)', { date });

    if (q.typeDroitId) qb.andWhere('t.typeDroitId = :typeDroitId', { typeDroitId: q.typeDroitId });
    if (q.periodiciteId) qb.andWhere('t.periodiciteId = :periodiciteId', { periodiciteId: q.periodiciteId });
    if (q.typelocalId) qb.andWhere('t.typelocalId = :typelocalId', { typelocalId: q.typelocalId });
    if (q.zoneId) qb.andWhere('t.zoneId = :zoneId', { zoneId: q.zoneId });
    if (q.marcheId) qb.andWhere('t.marcheId = :marcheId', { marcheId: q.marcheId });
    if (q.localId) qb.andWhere('t.localId = :localId', { localId: q.localId });
    if (q.activiteId) qb.andWhere('t.activiteId = :activiteId', { activiteId: q.activiteId });

    return qb.orderBy('t.dateDebut', 'DESC').getMany();
  }

  private validerDatesTarif(dateDebut: any, dateFin: any): void {
    const debut = new Date(dateDebut);
    if (dateFin) {
      const fin = new Date(dateFin);
      if (debut > fin) {
        throw new BadRequestException('dateDebut doit être antérieure ou égale à dateFin.');
      }
    }
  }

  private validerPorteeTarif(dto: Partial<CreateTarifDto>): void {
    const auMoinsUn =
      dto.typelocalId || dto.zoneId || dto.marcheId || dto.localId || dto.activiteId;
    if (!auMoinsUn) {
      throw new BadRequestException(
        'Au moins une dimension de portée (marché, zone, emplacement, type de local, activité) doit être renseignée.',
      );
    }
  }

  private async verifierDoublonTarif(dto: any, currentId?: string): Promise<void> {
    const candidats = await this.tarifRepository.find({
      where: {
        typeDroitId: dto.typeDroitId,
        periodiciteId: dto.periodiciteId ?? null,
        typelocalId: dto.typelocalId ?? null,
        zoneId: dto.zoneId ?? null,
        marcheId: dto.marcheId ?? null,
        localId: dto.localId ?? null,
        activiteId: dto.activiteId ?? null,
      },
    });
    const debut = new Date(dto.dateDebut);
    const fin = dto.dateFin ? new Date(dto.dateFin) : null;
    for (const t of candidats) {
      if (currentId && t.id === currentId) continue;
      if (!t.actif) continue;
      const tDebut = new Date(t.dateDebut as any);
      const tFin = t.dateFin ? new Date(t.dateFin as any) : null;
      const chevauche = tDebut <= (fin ?? new Date('9999-12-31')) && (tFin ?? new Date('9999-12-31')) >= debut;
      if (chevauche) {
        throw new ConflictException(
          'Un tarif actif couvre déjà la même combinaison (droit, périodicité, portée) sur cette période.',
        );
      }
    }
  }

  private mapTarif(dto: any) {
    const out: any = { ...dto };
    if (dto.dateDebut) out.dateDebut = new Date(dto.dateDebut);
    if (dto.dateFin) out.dateFin = new Date(dto.dateFin);
    return out;
  }
}
