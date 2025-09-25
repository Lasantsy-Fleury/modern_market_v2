import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateDistributionZoneDto } from './dto/create-distribution_zone.dto';
import { UpdateDistributionZoneDto } from './dto/update-distribution_zone.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionZone } from './entities/distribution_zone.entity';
import { ZoneService } from 'src/zone/zone.service';
import { Zone } from 'src/zone/entities/zone.entity';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class DistributionZoneService {
  constructor(
    @InjectRepository(DistributionZone)
    private readonly distributionZoneRepository: Repository<DistributionZone>,
    private readonly zoneService: ZoneService,
    private readonly eventsService: EventsService,
  ) { }

  async create(createDistributionZoneDto: CreateDistributionZoneDto) {
    const zone = await this.zoneService.findOneById(createDistributionZoneDto.zoneId);
    if (!zone) {
      throw new NotFoundException(`Zone ${createDistributionZoneDto.zoneId} introuvable`);
    }

    const distributionZone = this.distributionZoneRepository.create(createDistributionZoneDto);
    this.eventsService.sendWebSocketNotification('distribution_zone_created', distributionZone);
    return await this.distributionZoneRepository.save(distributionZone);
  }

  async findAll(municipalityId: number, page: number = 1, limit: number = 10): Promise<{ data: DistributionZone[], total: number }> {
    const query = this.distributionZoneRepository
      .createQueryBuilder('distributionZone')
      .leftJoinAndSelect('distributionZone.zone', 'zone')
      .where('zone.municipalityId = :municipalityId', { municipalityId })
      .orderBy('distributionZone.id_distribution_zone', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [result, total] = await query.getManyAndCount();

    return { data: result, total };
  }

  async findOne(id_distribution_zone: string, municipalityId: number) {
    const distributionZone = await this.distributionZoneRepository
      .createQueryBuilder('distributionZone')
      .leftJoinAndSelect('distributionZone.zone', 'zone')
      .where('distributionZone.id_distribution_zone = :id_distribution_zone', { id_distribution_zone })
      .andWhere('zone.municipalityId = :municipalityId', { municipalityId })
      .getOne();

    if (!distributionZone) {
      throw new NotFoundException(`DistributionZone ${id_distribution_zone} introuvable dans cette municipalité`);
    }

    return distributionZone;
  }

  async update(id_distribution_zone: string, municipalityId: number, updateDistributionZoneDto: UpdateDistributionZoneDto) {
    const distributionZone = await this.findOne(id_distribution_zone, municipalityId);
    Object.assign(distributionZone, updateDistributionZoneDto);
    this.eventsService.sendWebSocketNotification('distribution_zone_updated', distributionZone);
    return await this.distributionZoneRepository.save(distributionZone);
  }

  async remove(id_distribution_zone: string, municipalityId: number) {
    const distributionZone = await this.findOne(id_distribution_zone, municipalityId);
    return await this.distributionZoneRepository.remove(distributionZone);
  }
}
