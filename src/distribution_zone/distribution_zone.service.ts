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
    this.eventsService.broadcastToAll('distribution_zone_created', distributionZone);
    this.eventsService.sendToUser(createDistributionZoneDto.id_user, 'vous_avez_une_zone', distributionZone);
    return await this.distributionZoneRepository.save(distributionZone);
  }

  async findAll(municipalityId: string, page: number = 1, limit: number = 10): Promise<{ data: DistributionZone[], total: number }> {
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

  async findOne(id_distribution_zone: string, municipalityId: string) {
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

  async findAllTrueByidUser(id_user: string, municipalityId: string) {
    const distributionZone = await this.distributionZoneRepository
      .createQueryBuilder('distributionZone')
      .leftJoinAndSelect('distributionZone.zone', 'zone')
      .where('distributionZone.id_user = :id_user', { id_user })
      .andWhere('zone.municipalityId = :municipalityId', { municipalityId })
      .andWhere('distributionZone.status = :status', { status: true })
      .getMany();

    if (!distributionZone) {
      throw new NotFoundException(`DistributionZone for user ${id_user} introuvable dans cette municipalité`);
    }
    return distributionZone;
  }

  async findAllByIdUser(id_user: string, municipalityId: number): Promise<DistributionZone[]> {
  const distributionZones = await this.distributionZoneRepository
    .createQueryBuilder('distributionZone')
    .leftJoinAndSelect('distributionZone.zone', 'zone')
    .where('distributionZone.id_user = :id_user', { id_user })
    .andWhere('zone.municipalityId = :municipalityId', { municipalityId })
    .getMany();

    if (!distributionZones || distributionZones.length === 0) {
      throw new NotFoundException(`Aucune zone de distribution historique n'a été trouvée pour l'utilisateur ${id_user} dans cette municipalité.`);
    }

    return distributionZones;
  }

  async update(id_distribution_zone: string, municipalityId: string, updateDistributionZoneDto: UpdateDistributionZoneDto) {
    const distributionZone = await this.findOne(id_distribution_zone, municipalityId);
    Object.assign(distributionZone, updateDistributionZoneDto);
    this.eventsService.broadcastToAll('distribution_zone_updated', distributionZone);
    return await this.distributionZoneRepository.save(distributionZone);
  }

  async remove(id_distribution_zone: string, municipalityId: string) {
    const distributionZone = await this.findOne(id_distribution_zone, municipalityId);
    return await this.distributionZoneRepository.remove(distributionZone);
  }
}
