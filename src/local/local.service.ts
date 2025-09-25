import { Inject, Injectable, BadRequestException, ServiceUnavailableException, NotFoundException } from '@nestjs/common';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Local } from './entities/local.entity';
import { Repository } from 'typeorm';
import { Zone } from 'src/zone/entities/zone.entity';
import { Typelocal } from 'src/type_local/entities/type_locale.entity';
import { validate as isUUID } from 'uuid';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class LocalService {
  constructor(
    @InjectRepository(Local)
    private readonly localRepository:
      Repository<Local>,

    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,

    @InjectRepository(Typelocal)
    private readonly typeLocalRepository: Repository<Typelocal>,
    private readonly httpService: HttpService,

    private readonly eventsService: EventsService,

  ) { }

  async existingLocalTest(createLocalDto: CreateLocalDto) {
    const existingLocal = await this.localRepository.findOne({
      where: { numero: createLocalDto.numero }
    });
    if (existingLocal) {
      throw new NotFoundException(`Local with name ${createLocalDto.numero} already exists`);
    }
  }

  async existingZoneTest(zoneId: string) {
    const zone = await this.zoneRepository.findOne({
      where: { id_zone: zoneId },
    });
    if (!zone) {
      throw new NotFoundException(
        `Zone with id '${zoneId}' not found`,
      );
    }
  }

  async existingType(typelocalId: string) {
    const typeLocal = await this.typeLocalRepository.findOne({
      where: { id_type_local: typelocalId },
    });
    if (!typeLocal) {
      throw new NotFoundException(
        `TypeLocal with id '${typelocalId}' not found`,
      );
    }
  }

  async create(createLocalDto: CreateLocalDto) {
    await this.existingZoneTest(createLocalDto.zoneId);
    await this.existingType(createLocalDto.typelocalId);
    await this.existingLocalTest(createLocalDto);


    const zone = await this.zoneRepository.findOne({
      where: { id_zone: createLocalDto.zoneId },
    });
    if (!zone) {
      throw new NotFoundException(
        `Zone with id '${createLocalDto.zoneId}' not found`,
      );
    }


    try {
      const local = this.localRepository.create(createLocalDto);
      this.eventsService.sendWebSocketNotification('local_created', local);
      return await this.localRepository.save(local)
    } catch (error) {
      throw new BadRequestException(
        `Failed to create zone. Please check your input data.`,
      );
    }

  }


  async getAll(
    municipalityId: number,
    page: number = 1,
    limit: number = 10,
    filters: {
      zoneId?: string;
      typelocalId?: string;
      statut?: 'DISPONIBLE' | 'LOUE' | 'INDISPONIBLE';
      keyword?: string;
      surface?: number;
    },
  ) {
    try {
      // Vérifier que la municipalité a au moins une zone
      const zones = await this.zoneRepository.find({
        where: { municipalityId },
      });
      console.log("1 terminer, ", zones);
      if (!zones || zones.length === 0) {
        console.log("1 terminer");
        throw new NotFoundException(
          `Aucune zone de marche trouvée pour la municipalité ${municipalityId}`,
        );
      }
      const zoneIds = zones.map((z) => z.id_zone);
      // Construire la requête dynamique
      const query = this.localRepository
        .createQueryBuilder('local')
        .innerJoinAndSelect('local.zone', 'zone')
        .leftJoinAndSelect('local.typelocal', 'typelocal')
        .where('zone.municipalityId = :municipalityId', { municipalityId })
        .skip((page - 1) * limit)
        .take(limit);
      console.log("3 terminer");
      // Application des filtres
      if (filters.zoneId) {
        if (!isUUID(filters.zoneId)) {
          throw new BadRequestException(`zoneId '${filters.zoneId}' n'est pas un UUID valide`);
        }
        await this.existingZoneTest(filters.zoneId);
        query.andWhere('local.zoneId = :zoneId', { zoneId: filters.zoneId });
      }

      if (filters.typelocalId) {
        if (!isUUID(filters.typelocalId)) {
          throw new BadRequestException(`typelocalId '${filters.typelocalId}' n'est pas un UUID valide`);
        }
        await this.existingType(filters.typelocalId);
        query.andWhere('local.typelocalId = :typelocalId', { typelocalId: filters.typelocalId });
      }

      if (filters.statut) {
        query.andWhere('local.statut = :statut', { statut: filters.statut });
      }

      if (filters.keyword) {
        query.andWhere('local.numero ILIKE :keyword', { keyword: `%${filters.keyword}%` });
      }

      if (filters.surface) {
        query.andWhere('local.surface = :surface', { surface: filters.surface });
      }

      // Exécuter la requête avec pagination
      const [result, total] = await query.getManyAndCount();

      // if (result.length === 0) {
      //   throw new NotFoundException(
      //     `Aucun local trouvé pour la municipalité ${municipalityId} avec les filtres donnés`,
      //   );
      // }

      return {
        message: 'Liste des locaux trouvés',
        data: result,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        status: 200,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'Impossible de récupérer les locaux pour le moment.',
      );
    }
  }



  // Trouver un local en vérifiant la municipalité
  async findOne(municipalityId: number, id_local: string) {
    const local = await this.localRepository
      .createQueryBuilder('local')
      .leftJoinAndSelect('local.zone', 'zone')
      .where('local.id_local = :id_local', { id_local })
      .andWhere('zone.municipalityId = :municipalityId', { municipalityId })
      .getOne();

    if (!local) {
      throw new NotFoundException(
        `Local with id '${id_local}' not found in municipality '${municipalityId}'`
      );
    }

    return local;
  }

  async findLastLocationByLocal(municipalityId: number, id_local: string) {
    // 1️⃣ Récupération du local avec ses locations et zone
    const local = await this.localRepository
      .createQueryBuilder('local')
      .leftJoinAndSelect('local.zone', 'zone')
      .leftJoinAndSelect('local.locations', 'location')
      .where('local.id_local = :id_local', { id_local })
      .andWhere('zone.municipalityId = :municipalityId', { municipalityId })
      .orderBy('location.date_fin_loc', 'DESC') // la plus récente d'abord
      .getOne();

    if (!local || !local.locations || local.locations.length === 0) {
      throw new NotFoundException(
        `Aucune location trouvée pour le local '${id_local}' dans la municipalité '${municipalityId}'`,
      );
    }

    const lastLocation = local.locations[0];

    // 2️⃣ Récupérer le userPseudo via l'API externe
    if (!lastLocation.id_user) {
      throw new BadRequestException('La location n’a pas d’utilisateur associé.');
    }

    const url = `https://gateway.tsirylab.com/serviceauth/users/${lastLocation.id_user}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url, {
        headers: { accept: 'application/json' },
      }));

      const userPseudo = response.data?.user_pseudo || null;

      return {
        ...lastLocation,
        userPseudo,
      };
    } catch (error) {
      throw new NotFoundException(`Impossible de récupérer l'utilisateur '${lastLocation.id_user}'`);
    }
  }


  // Mettre à jour un local
  async update(
    municipalityId: number,
    id_local: string,
    updateLocalDto: UpdateLocalDto
  ) {
    const local = await this.findOne(municipalityId, id_local);

    Object.assign(local, updateLocalDto);
    this.eventsService.sendWebSocketNotification('local_updated', local);
    return await this.localRepository.save(local);
  }

  // Supprimer un local
  async remove(municipalityId: number, id_local: string) {
    const local = await this.findOne(municipalityId, id_local);
    return await this.localRepository.remove(local);
  }

}
