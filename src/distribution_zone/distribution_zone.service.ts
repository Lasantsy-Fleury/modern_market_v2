import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDistributionZoneDto } from './dto/create-distribution_zone.dto';
import { UpdateDistributionZoneDto } from './dto/update-distribution_zone.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionZone } from './entities/distribution_zone.entity';

@Injectable()
export class DistributionZoneService {
  constructor(
    @InjectRepository(DistributionZone)
    private readonly distributionZoneRepository: Repository<DistributionZone>,
  ) {}

  async create(createDistributionZoneDto: CreateDistributionZoneDto) {
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

}
