import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Zone } from './entities/zone.entity';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';

@Injectable()
export class ZoneService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) { }

  // Créer une zone pour une municipalité spécifique
  async create(createZoneDto: CreateZoneDto) {
    const existingZone = await this.zoneRepository.findOne({
      where: {
        nom: createZoneDto.nom,
        municipality_id: createZoneDto.municipality_id,
      },
    });
    if (existingZone) {
      throw new NotFoundException(
        `Zone with id '${createZoneDto.nom}' already exists in municipality ${createZoneDto.municipality_id}`,
      );
    }
    const zone = this.zoneRepository.create({
      ...createZoneDto,
    });
    return await this.zoneRepository.save(zone);
  }
8
  // Retourner toutes les zones d’une municipalité
  async findAll(municipalityId: number) {
    return await this.zoneRepository.find({
      where: { municipality_id: municipalityId },
    });
  }

  // Trouver une zone par son nom ou autre filtre limité à la municipalité
  async findOne(municipalityId: number, id_zone: string) {
    const zone = await this.zoneRepository.findOne({
      where: { municipality_id: municipalityId, id_zone },
    });
    if (!zone) {
      throw new NotFoundException(
        `Zone with id '${id_zone}' not found in municipality ${municipalityId}`,
      );
    }
    return zone;
  }

  async searchByName(municipalityId: number, keyword: string): Promise<Zone[]> {
    return await this.zoneRepository.find({
      where: {
        municipality_id: municipalityId,
        nom: ILike(`%${keyword}%`), // ILike = insensible à la casse
      },
    });
  }

  // Mettre à jour une zone via son nom et la municipalité
  async update(municipalityId: number, nom: string, updateZoneDto: UpdateZoneDto) {
    const zone = await this.findOne(municipalityId, nom);
    Object.assign(zone, updateZoneDto);
    return await this.zoneRepository.save(zone);
  }

  // Supprimer une zone via son nom et la municipalité
  async remove(municipalityId: number, id_zone: string) {
    const zone = await this.findOne(municipalityId, id_zone);
    return await this.zoneRepository.remove(zone);
  }
}
