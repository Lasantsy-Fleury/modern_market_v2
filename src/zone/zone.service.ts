import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Zone } from './entities/zone.entity';
import { Repository,FindOptionsWhere  } from 'typeorm';

@Injectable()
export class ZoneService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository:
    Repository<Zone>
  ){}

  async create(createZoneDto: CreateZoneDto) {
    const zone = this.zoneRepository.create(createZoneDto);

    return  await this.zoneRepository.save(zone);
  }

  async findAll(municipality_id?: number) {
    let whereClause: FindOptionsWhere<Zone> | undefined = undefined;
    if (municipality_id) {
      whereClause = { municipality_id: municipality_id };
    }
    return await this.zoneRepository.find({ where: whereClause });
  }

  async findOne(id_zone: number, municipality_id?: number) {
  const whereClause: any = { id_zone: id_zone };
  if (municipality_id) {
    whereClause.municipalityId = municipality_id;
  }

  const zone = await this.zoneRepository.findOne({ where: whereClause });
  if (!zone) {
    throw new NotFoundException(`Zone with id_zone ${id_zone} not found`);
  }
  return zone;
}

async update(id_zone: number, updateZoneDto: UpdateZoneDto, municipality_id?: number) {
  const zone = await this.findOne(id_zone, municipality_id);
  Object.assign(zone, updateZoneDto);
  return await this.zoneRepository.save(zone);
}


  
}
