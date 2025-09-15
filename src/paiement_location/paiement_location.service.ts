import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Paiementlocation } from './entities/paiement_location.entity';
import { CreatePaiementLocationDto } from './dto/create-paiement_location.dto';
import { Location, Periodicite } from 'src/location/entities/location.entity';
import * as QRCode from 'qrcode';

@Injectable()
export class PaiementLocationService {
  constructor(
    @InjectRepository(Paiementlocation)
    private readonly paiementLocationRepository: Repository<Paiementlocation>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) { }

  async create(
    createPaiementLocationDto: CreatePaiementLocationDto,
    queryRunner?: QueryRunner,
  ): Promise<Paiementlocation> {
    const { locationId, nombre_paye, ...dtoRest } = createPaiementLocationDto;

    // Utiliser le gestionnaire de transaction si fourni
    const manager = queryRunner ? queryRunner.manager : this.locationRepository.manager;

    // 1. Vérifier si la location existe
    const location = await manager.findOne(Location, { where: { id_location: locationId } });
    if (!location) {
      throw new NotFoundException(`Location with ID "${locationId}" not found.`);
    }

    // 2. Trouver le dernier paiement pour cette location
    const lastPaiement = await manager.findOne(Paiementlocation, {
      where: { locationId },
      order: { date_fin: 'DESC' },
    });

    // 3. Calculer les dates de début et de fin
    const now = new Date();
    let newDateDebut: Date = lastPaiement ? new Date(lastPaiement.date_fin) : new Date(location.date_debut_loc);
    let newDateFin: Date = new Date(newDateDebut);

    if (location.periodicite === Periodicite.MENSUEL) {
      newDateFin.setMonth(newDateFin.getMonth() + nombre_paye);
    } else if (location.periodicite === Periodicite.JOURNALIER) {
      newDateFin.setDate(newDateFin.getDate() + nombre_paye);
    } else {
      throw new BadRequestException(`Invalid periodicity for location ID "${locationId}".`);
    }

    // 4. Vérifier la fréquence restante
    if (location.frequence !== null && nombre_paye > location.frequence) {
      throw new BadRequestException(`Cannot pay for more than the remaining frequency (${location.frequence}).`);
    }

    // 5. Mettre à jour la fréquence
    if (location.frequence !== null) {
      location.frequence -= nombre_paye;
    }
    await manager.save(location);

    // 6. Créer et sauvegarder le paiement
    const newPaiementLocation = manager.create(Paiementlocation, {
      ...dtoRest,
      locationId,
      nombre_paye,
      date_debut: newDateDebut,
      date_fin: newDateFin,
      date_paiement: now,
    });

    const savedPaiementLocation = await manager.save(newPaiementLocation);

    // 7. Retourner le paiement avec relations (paiement et location) pour QR code ou autre usage
    const paiementWithRelations = await manager.findOne(Paiementlocation, {
      where: { id_paiement_location: savedPaiementLocation.id_paiement_location },
      relations: ['paiement', 'location'],
    });

    if (!paiementWithRelations) {
      throw new NotFoundException(`Paiementlocation with ID "${savedPaiementLocation.id_paiement_location}" not found after save.`);
    }

    return paiementWithRelations;
  }


  async findAll(
    municipalityId: number,
    filters?: {
      locationId?: string;
      paiementId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Paiementlocation[]> {
    if (!municipalityId) {
      throw new BadRequestException('Le municipalityId est obligatoire.');
    }

    const query = this.paiementLocationRepository
      .createQueryBuilder('paiement_location')
      .leftJoinAndSelect('paiement_location.paiement', 'paiement')
      .leftJoinAndSelect('paiement_location.location', 'location')
      .leftJoinAndSelect('location.local', 'local')
      .leftJoinAndSelect('local.zone', 'zone')
      .where('zone.municipalityId = :municipalityId', { municipalityId }); // filtre obligatoire

    // Filtre sur locationId
    if (filters?.locationId) {
      query.andWhere('paiement_location.locationId = :locationId', {
        locationId: filters.locationId,
      });
    }

    // Filtre sur paiementId
    if (filters?.paiementId) {
      query.andWhere('paiement_location.paiementId = :paiementId', {
        paiementId: filters.paiementId,
      });
    }

    // Filtre sur date de paiement
    if (filters?.startDate) {
      query.andWhere('paiement_location.date_paiement >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('paiement_location.date_paiement <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // Trier par date de paiement
    query.orderBy('paiement_location.date_paiement', 'DESC');

    return query.getMany();
  }

async findOne(id: string, municipalityId: number): Promise<Paiementlocation> {
  const found = await this.paiementLocationRepository
    .createQueryBuilder('paiement_location')
    .leftJoinAndSelect('paiement_location.paiement', 'paiement')
    .leftJoinAndSelect('paiement_location.location', 'location')
    .leftJoinAndSelect('location.local', 'local')
    .leftJoinAndSelect('local.zone', 'zone')
    .where('paiement_location.id_paiement_location = :id', { id })
    .andWhere('zone.municipalityId = :municipalityId', { municipalityId }) // filtre obligatoire
    .getOne();

  if (!found) {
    throw new NotFoundException(`Paiementlocation with ID "${id}" not found in municipality "${municipalityId}".`);
  }

  return found;
}

async findOneWithQr(
  id: string,
  municipalityId: number,
): Promise<{ paiementLocation: Paiementlocation; qrCode: string }> {
  const found = await this.paiementLocationRepository
    .createQueryBuilder('paiement_location')
    .leftJoinAndSelect('paiement_location.paiement', 'paiement')
    .leftJoinAndSelect('paiement_location.location', 'location')
    .leftJoinAndSelect('location.local', 'local')
    .leftJoinAndSelect('local.zone', 'zone')
    .where('paiement_location.id_paiement_location = :id', { id })
    .andWhere('zone.municipalityId = :municipalityId', { municipalityId }) // filtre obligatoire
    .getOne();

  if (!found) {
    throw new NotFoundException(`Paiementlocation with ID "${id}" not found in municipality "${municipalityId}".`);
  }

  const qrData = {
    id_paiement_location: found.id_paiement_location,
    nombre_paye: found.nombre_paye,
    date_debut: found.date_debut,
    date_fin: found.date_fin,
    date_paiement: found.date_paiement,
    paiement: found.paiement,
    location: found.location,
  };

  const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

  return { paiementLocation: found, qrCode };
}


  //  async remove(id_paiement_location: number): Promise<void> {
  //     const typeLocal = await this.findOne(id_paiement_location);
  //     await this.paiementLocationRepository.remove(typeLocal);
  //   }
}