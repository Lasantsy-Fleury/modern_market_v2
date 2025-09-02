import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './entities/zone.entity';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';

@Injectable()
export class ZoneService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) {}

  // Créer une zone pour une municipalité spécifique
  async create(municipalityId: number, createZoneDto: CreateZoneDto) {
    const zone = this.zoneRepository.create({
      ...createZoneDto,
      municipality_id: municipalityId,
    });
    return await this.zoneRepository.save(zone);
  }

  // Retourner toutes les zones d’une municipalité
  async findAll(municipalityId: number) {
    return await this.zoneRepository.find({
      where: { municipality_id: municipalityId },
    });
  }

  // Trouver une zone par son nom ou autre filtre limité à la municipalité
  async findOne(municipalityId: number, nom: string) {
    const zone = await this.zoneRepository.findOne({
      where: { municipality_id: municipalityId, nom },
    });
    if (!zone) {
      throw new NotFoundException(
        `Zone with name '${nom}' not found in municipality ${municipalityId}`,
      );
    }
    return zone;
  }

  // Mettre à jour une zone via son nom et la municipalité
  async update(municipalityId: number, nom: string, updateZoneDto: UpdateZoneDto) {
    const zone = await this.findOne(municipalityId, nom);
    Object.assign(zone, updateZoneDto);
    return await this.zoneRepository.save(zone);
  }

  // Supprimer une zone via son nom et la municipalité
  async remove(municipalityId: number, nom: string) {
    const zone = await this.findOne(municipalityId, nom);
    return await this.zoneRepository.remove(zone);
  }
}
