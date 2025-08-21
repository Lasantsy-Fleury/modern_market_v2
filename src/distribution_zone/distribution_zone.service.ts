import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDistributionZoneDto } from './dto/create-distribution_zone.dto';
import { UpdateDistributionZoneDto } from './dto/update-distribution_zone.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DistributionZone } from './entities/distribution_zone.entity';
import { Repository } from 'typeorm';
import { Zone } from 'src/zone/entities/zone.entity';

@Injectable()
export class DistributionZoneService {
  constructor(
    @InjectRepository(DistributionZone)
    private readonly distributionZoneRepository:
      Repository<DistributionZone>,

    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) { }

  async create(createDto: CreateDistributionZoneDto): Promise<DistributionZone> {
    // 1. Vérifier si la Zone existe
    const zone = await this.zoneRepository.findOne({
      where: { id_zone: createDto.id_zone },
    });
    if (!zone) {
      throw new NotFoundException(`La Zone avec l'ID ${createDto.id_zone} n'a pas été trouvée.`);
    }

    // 2. Vérifier si cette Zone est déjà assignée à une autre distribution_zone
    const existingDistributionZone = await this.distributionZoneRepository.findOne({
      where: { zone: { id_zone: createDto.id_zone } },
    });
    if (existingDistributionZone) {
      throw new Error(`La Zone avec l'ID ${createDto.id_zone} est déjà assignée à une autre zone de distribution.`);
    }

    // 3. Vérifier si l'utilisateur a déjà une distribution_zone avec isActual = true
    const userHasActiveDistributionZone = await this.distributionZoneRepository.findOne({
      where: {
        id_user_role: createDto.id_user_role, // juste la colonne, pas un objet

        isActual: true,
      },
    });

    if (userHasActiveDistributionZone) {
      throw new Error(`L'utilisateur ${createDto.id_user_role} a déjà une distribution_zone active (isActual = true).`);
    }

    // 4. Créer et sauvegarder la nouvelle DistributionZone
    const newDistributionZone = this.distributionZoneRepository.create({
      ...createDto,
      zone: zone, // Assigner l'objet Zone complet
    });

    return this.distributionZoneRepository.save(newDistributionZone);
  }

  async findAll(municipality_id: number): Promise<DistributionZone[]> {
  return this.distributionZoneRepository.find({
    relations: ['zone'], // Charger aussi la relation zone
    where: {
      zone: { municipality_id }, // Filtre uniquement sur la commune
    },
  });
}

async findOne(id: number, municipality_id: number): Promise<DistributionZone> {
  const distributionZone = await this.distributionZoneRepository.findOne({
    where: {
      id_distribution_zone: id,
      zone: { municipality_id }, // On filtre aussi sur la commune
    },
    relations: ['zone'],
  });

  if (!distributionZone) {
    throw new NotFoundException(
      `La DistributionZone avec l'ID ${id} pour la commune ${municipality_id} n'a pas été trouvée.`,
    );
  }
  return distributionZone;
}

async update(
  id_distribution_zone: number,
  municipality_id: number,
  updateZoneDto: UpdateDistributionZoneDto,
) {
  const distrib_zone = await this.findOne(id_distribution_zone, municipality_id);

  Object.assign(distrib_zone, updateZoneDto);
  return await this.distributionZoneRepository.save(distrib_zone);
}

}
