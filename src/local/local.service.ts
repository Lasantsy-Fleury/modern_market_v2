import { Inject, Injectable, BadRequestException, ServiceUnavailableException, NotFoundException } from '@nestjs/common';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Local } from './entities/local.entity';
import { Repository } from 'typeorm';
import { Zone } from 'src/zone/entities/zone.entity';
import { Typelocal } from 'src/type_local/entities/type_locale.entity';
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
      return await this.localRepository.save(local)
    } catch (error) {
      throw new BadRequestException(
        `Failed to create zone. Please check your input data.`,
      );
    }

  }

  async findByZoneAndType(zoneId: string, typelocalId: string, limit: number, page: number) {
    await this.existingZoneTest(zoneId);
    await this.existingType(typelocalId);
    try {
      if (!zoneId || !typelocalId) {
        throw new BadRequestException('zoneId et typelocalId sont requis');
      }

      const locaux = await this.localRepository.find({
        where: { zoneId, typelocalId },
        skip: (page - 1) * limit,
        take: limit,
      });

      if (!locaux) {
        throw new NotFoundException(
          `Aucun local trouvé pour la zone '${zoneId}' et le type local '${typelocalId}'`,
        );
      }

      return {
        message: 'Liste des locaux trouvés',
        data: locaux,
         pagination: {
        page,
        limit,
            },
        count: locaux.length,
        status: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'Impossible de récupérer les locaux pour le moment',
      );
    }
  }

    async findByZoneAndTypeByStatut(zoneId: string, typelocalId: string,  statut: 'DISPONIBLE' | 'LOUE' | 'INDISPONIBLE',
 limit: number, page: number) {
    await this.existingZoneTest(zoneId);
    await this.existingType(typelocalId);
    try {
      if (!zoneId || !typelocalId) {
        throw new BadRequestException('zoneId et typelocalId sont requis');
      }

      const locaux = await this.localRepository.find({
        where: { zoneId, typelocalId, statut},
        skip: (page - 1) * limit,
        take: limit,
      });

      if (!locaux) {
        throw new NotFoundException(
          `Aucun local trouvé pour la zone '${zoneId}' et le type local '${typelocalId}'`,
        );
      }

      return {
        message: 'Locaux avec statut ${statut}',
        data: locaux,
         pagination: {
        page,
        limit,
            },
        count: locaux.length,
        status: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'Impossible de récupérer les locaux pour le moment',
      );
    }
  }

  async findAll() {
    return await this.localRepository.find()
  }

  async findOne(id_local: string) {
    return await this.localRepository.findOne({
      where: { id_local: id_local }
    })
  }

  async findZoneLocalDisponibleParPrix() {
    const zones = await this.zoneRepository
      .createQueryBuilder('zone')
      .leftJoin('zone.locaux', 'local')
      .leftJoin('local.typelocal', 'typelocal')
      .where('local.statut = :statut', { statut: 'DISPONIBLE' })
      .select('zone.nom', 'zone')
      .addSelect('typelocal.tarif', 'prix')
      .addSelect('COUNT(local.id_local)', 'nombre')
      .groupBy('zone.nom')
      .addGroupBy('typelocal.tarif')
      .getRawMany();

    if (zones.length === 0) {
      throw new NotFoundException('Aucun local disponible trouvé.');
    }

    // transformer le résultat pour avoir le format souhaité
    const result = zones.reduce((acc, cur) => {
      const zoneExist = acc.find(z => z.zone === cur.zone);
      const tarifInfo = { prix: Number(cur.prix), nombre: Number(cur.nombre) };

      if (zoneExist) {
        zoneExist.tarifs.push(tarifInfo);
      } else {
        acc.push({
          zone: cur.zone,
          tarifs: [tarifInfo],
        });
      }

      return acc;
    }, []);

    return result;
  }


  async update(id_local: string, updateLocalDto: UpdateLocalDto) {
    const local = await this.findOne(id_local);
    if (!local) {
      throw new NotFoundException();
    }
    Object.assign(local, updateLocalDto);
    return await this.localRepository.save(local)
  }

  async remove(id_local: string) {
    const local = await this.findOne(id_local);
    if (!local) {
      throw new NotFoundException();
    }
    return await this.localRepository.remove(local)
  }
}
