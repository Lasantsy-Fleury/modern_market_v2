import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Local } from './entities/local.entity';
import { Repository } from 'typeorm';
import { Zone } from 'src/zone/entities/zone.entity';

@Injectable()
export class LocalService {
  constructor(
    @InjectRepository(Local)
    private readonly localRepository:
    Repository<Local>,
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ){}
  
  async create(createLocalDto: CreateLocalDto) {
    const existingLocal = await this.localRepository.findOne({
      where: { numero: createLocalDto.numero }
    });
    if (existingLocal) {
      throw new NotFoundException(`Local with name ${createLocalDto.numero} already exists`);
    }
    const local = this.localRepository.create(createLocalDto);
    return await this.localRepository.save(local)
  }

  async findAll() {
    return await this.localRepository.find()
  }

  async findOne(id_local: string) {
    return await this.localRepository.findOne({
      where: {id_local : id_local}
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
    if (!local){
      throw new NotFoundException();
    }
    Object.assign(local , updateLocalDto);
    return await this.localRepository.save(local)
  }

  async remove(id_local: string) {
     const local = await this.findOne(id_local);
    if (!local){
      throw new NotFoundException();
    }
    return await this.localRepository.remove(local)
  }
}
