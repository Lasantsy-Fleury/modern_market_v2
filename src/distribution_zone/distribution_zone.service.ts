import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateDistributionZoneDto } from './dto/create-distribution_zone.dto';
import { UpdateDistributionZoneDto } from './dto/update-distribution_zone.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionZone } from './entities/distribution_zone.entity';
import { ZoneService } from 'src/zone/zone.service';

@Injectable()
export class DistributionZoneService {
  constructor(
    @InjectRepository(DistributionZone)
    private readonly distributionZoneRepository: Repository<DistributionZone>,
    private readonly zoneService: ZoneService,
  ) {}

  async create(createDistributionZoneDto: CreateDistributionZoneDto) {
    // Vérification de l’existence de la zone
    // const zone = await this.zoneService.findOne(
    //   createDistributionZoneDto.municipalityId,
    //   createDistributionZoneDto.zoneId,
    // );
    // if (!zone) {
    //   throw new NotFoundException(`Zone ${createDistributionZoneDto.zoneId} introuvable`);
    // }

    const distributionZone = this.distributionZoneRepository.create(createDistributionZoneDto);
    return await this.distributionZoneRepository.save(distributionZone);
  }

  async findAll() {
    return await this.distributionZoneRepository.find();
  }

  async findOne(id_distribution_zone: string) {
    const distributionZone = await this.distributionZoneRepository.findOne({
      where: { id_distribution_zone: id_distribution_zone },
    });
    if (!distributionZone) {
      throw new NotFoundException(`DistributionZone ${id_distribution_zone} introuvable`);
    }
    return distributionZone;
  }

  async update(id_distribution_zone: string, updateDistributionZoneDto: UpdateDistributionZoneDto) {
    const distributionZone = await this.findOne(id_distribution_zone);
    Object.assign(distributionZone, updateDistributionZoneDto);
    return await this.distributionZoneRepository.save(distributionZone);
  }

  async remove(id: string) {
    const distributionZone = await this.findOne(id);
    return await this.distributionZoneRepository.remove(distributionZone);
  }

  async someAsyncMethod() {
    try {
      // Code qui peut échouer
    } catch (error) {
      throw new ServiceUnavailableException('Impossible de récupérer les zones pour le moment. Veuillez réessayer plus tard.');
    }
  }
}
