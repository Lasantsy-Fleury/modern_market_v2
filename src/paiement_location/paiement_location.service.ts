import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Paiementlocation } from './entities/paiement_location.entity';
import { CreatePaiementLocationDto } from './dto/create-paiement_location.dto';
import { Location, Periodicite } from 'src/location/entities/location.entity';

@Injectable()
export class PaiementLocationService {
  constructor(
    @InjectRepository(Paiementlocation)
    private readonly paiementLocationRepository: Repository<Paiementlocation>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) { }

  async create(createPaiementLocationDto: CreatePaiementLocationDto, queryRunner?: QueryRunner): Promise<Paiementlocation> {
    const { locationId, nombre_paye, ...dtoRest } = createPaiementLocationDto;

    // Utiliser le gestionnaire de la transaction si un queryRunner est fourni, sinon les dépôts injectés
    const manager = queryRunner ? queryRunner.manager : this.locationRepository.manager;

    // 1. Trouver la location et sa périodicité en utilisant le manager de la transaction
    const location = await manager.findOne(Location, { where: { id_location: locationId } });
    if (!location) {
      throw new NotFoundException(`Location with ID "${locationId}" not found.`);
    }

    // 2. Trouver le dernier paiement pour cette location en utilisant le manager de la transaction
    const lastPaiement = await manager.findOne(Paiementlocation, {
      where: { locationId },
      order: { date_fin: 'DESC' },
    });

    let newDateDebut: Date;
    let newDateFin: Date;
    const now = new Date();

    // 3. Calculer les dates de début et de fin
    if (lastPaiement) {
      newDateDebut = new Date(lastPaiement.date_fin);
    } else {
      newDateDebut = new Date(location.date_debut_loc);
    }

    newDateFin = new Date(newDateDebut);
    if (location.periodicite === Periodicite.MENSUEL) {
      newDateFin.setMonth(newDateFin.getMonth() + nombre_paye);
    } else if (location.periodicite === Periodicite.JOURNALIER) {
      newDateFin.setDate(newDateFin.getDate() + nombre_paye);
    } else {
      throw new BadRequestException(`Invalid periodicity for location ID "${locationId}".`);
    }

    if (location.frequence !== null && nombre_paye > location.frequence) {
      throw new BadRequestException(`Cannot pay for more than the remaining frequency (${location.frequence}).`);
    }

    // 4. Mettre à jour la fréquence de la location en utilisant le manager de la transaction
    if (location.frequence !== null) {
      location.frequence -= nombre_paye;
    }
    await manager.save(location);

    // 5. Créer et sauvegarder le nouveau paiement en utilisant le manager de la transaction
    const newPaiementLocation = manager.create(Paiementlocation, {
      ...dtoRest,
      locationId,
      nombre_paye,
      date_debut: newDateDebut,
      date_fin: newDateFin,
      date_paiement: now,
    });

    return manager.save(newPaiementLocation);
  }
  async findAll(): Promise<Paiementlocation[]> {
    return this.paiementLocationRepository.find({
      relations: ['paiement', 'location'],
    });
  }

  async findOne(id: number): Promise<Paiementlocation> {
    const found = await this.paiementLocationRepository.findOne({
      where: { id_paiement_location: id },
      relations: ['paiement', 'location'],
    });
    if (!found) {
      throw new NotFoundException(`Paiementlocation with ID "${id}" not found.`);
    }
    return found;
  }

  //  async remove(id_paiement_location: number): Promise<void> {
  //     const typeLocal = await this.findOne(id_paiement_location);
  //     await this.paiementLocationRepository.remove(typeLocal);
  //   }
}