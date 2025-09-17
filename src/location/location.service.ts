import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, LessThan } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { Periodicite } from './entities/location.entity';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';
import { Local } from 'src/local/entities/local.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Local)
    private readonly localRepository: Repository<Local>,
  ) { }

//   async createLocation(data: CreateLocationDto) {
//   const location = this.locationRepository.create(data);
//   return await this.locationRepository.save(location);
// }

  async findAll(municipalityId: number, page: number = 1, limit: number = 10): Promise<{ data: Location[], total: number }> {
    const query = this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.local', 'local')
      .leftJoinAndSelect('local.zone', 'zone')
      .where('zone.municipalityId = :municipalityId', { municipalityId });

    const [result, total] = await query
      .orderBy('location.id_location', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: result, total };
  }
  
  async create(createLocationDto: CreateLocationDto): Promise<Location> {
  let { date_debut_loc, periodicite, localId, id_user, nif } = createLocationDto;
  let date_fin_loc: Date;

  // Récupérer le local et son type_local
  const local = await this.localRepository.findOne({
    where: { id_local: localId },
    relations: ['typelocal'],
  });

  if (!local || local.statut === 'LOUE' || local.statut === 'INDISPONIBLE') {
    throw new NotFoundException(`Local with id ${localId} not found`);
  }

  // Conversion de la date de début
  const debut = new Date(date_debut_loc);
  debut.setHours(0, 0, 0, 0); // optionnel pour normaliser

  // Si périodicité mensuelle et contrat d'un an, calcul automatique
  if (periodicite === Periodicite.MENSUEL ) {
  date_fin_loc = new Date(debut);
  date_fin_loc.setFullYear(date_fin_loc.getFullYear() + 1);
} else if (periodicite === Periodicite.JOURNALIER) {
  date_fin_loc = new Date(debut);
  date_fin_loc.setDate(date_fin_loc.getDate() + 1);
} else {
  // Sinon, on prend la date fin fournie
  date_fin_loc = createLocationDto.date_fin_loc
    ? new Date(createLocationDto.date_fin_loc)
    : new Date(debut);
}  date_fin_loc.setHours(0, 0, 0, 0); // normalisation

  const fin = new Date(date_fin_loc);

  const today = new Date();

  // Vérifier si le local est déjà en location
  const existingLocation = await this.locationRepository.findOne({
    where: {
      localId,
      date_debut_loc: LessThanOrEqual(today),
      date_fin_loc: MoreThanOrEqual(today),
    },
  });

  if (existingLocation) {
    throw new BadRequestException(`Le local ${localId} est déjà en location en cours.`);
  }

  if (debut >= fin) {
    throw new BadRequestException("La date de début doit être avant la date de fin.");
  }

  // Validation mensuelle
  if (periodicite === Periodicite.MENSUEL) {
    const diffMonths =
      (fin.getFullYear() - debut.getFullYear()) * 12 +
      (fin.getMonth() - debut.getMonth());

    if (diffMonths < 1) {
      throw new BadRequestException(
        "Pour une location mensuelle, l'écart doit être d'au moins un mois."
      );
    }
  }

  // Calcul de la fréquence
  let frequence = 0;
  if (periodicite === Periodicite.JOURNALIER) {
    frequence = Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24));
  } else if (periodicite === Periodicite.MENSUEL) {
    const diffMonths =
      (fin.getFullYear() - debut.getFullYear()) * 12 +
      (fin.getMonth() - debut.getMonth());

    frequence = fin.getDate() >= debut.getDate() ? diffMonths + 1 : diffMonths;
  }

  // Création de la location
  const location = this.locationRepository.create({
    ...createLocationDto,
    date_fin_loc,
    frequence,
  });

  // local.statut = 'LOUE';
  // await this.localRepository.save(local);

  return await this.locationRepository.save(location);
}

  async updateLocalStatusToRented(locationId: string): Promise<void> {
    // 1. Trouver la Location en incluant la relation vers le Local
    const location = await this.locationRepository.findOne({
      where: { id_location: locationId },
      relations: ['local'],
    });

    if (!location) {
      throw new NotFoundException(`Location with id ${locationId} not found`);
    }

    // 2. Vérifier si un local est associé
    if (!location.local) {
      throw new NotFoundException(`Local not found for location id ${locationId}`);
    }

    // 3. Mettre à jour le statut du Local associé
    const local = location.local;
    local.statut = 'LOUE';
    await this.localRepository.save(local);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateExpiredLocations() {
    const now = new Date();

    const expiredLocations = await this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.local', 'local')
      .where('location.date_fin_loc < :now', { now })
      .andWhere('local.statut = :statut', { statut: 'EN_COURS' })
      .getMany();


    for (const loc of expiredLocations) {
      loc.local.statut = 'DISPONIBLE';
      await this.locationRepository.save(loc);
      console.log(`Location est maintenant disponible.`);
    }
  }



  async findAllInProgress(municipalityId: number): Promise<Location[]> {
    const today = new Date();

    return await this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.local', 'local')
      .leftJoinAndSelect('local.zone', 'zone')
      .where('location.date_debut_loc <= :today', { today })
      .andWhere('location.date_fin_loc >= :today', { today })
      .andWhere('zone.municipalityId = :municipalityId', { municipalityId })
      .getMany();
  }


  async findByUser(id_user: string): Promise<Location[]> {
    return await this.locationRepository.find({
      where: { id_user },
      relations: ['local', 'paiement_locations'],
      order: { date_debut_loc: 'DESC' },
    });
  }


  async findInProgressByUser(id_user: string): Promise<Location[]> {
    const today = new Date();
    return await this.locationRepository.find({
      where: {
        id_user,
        date_debut_loc: Between(new Date('1900-01-01'), today),
        date_fin_loc: Between(today, new Date('9999-12-31')),
      },
      relations: ['local', 'paiement_locations'],
    });
  }

  async findOne(id: string, municipalityId: number): Promise<Location> {
    const location = await this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.local', 'local')
      .leftJoinAndSelect('local.zone', 'zone')
      .where('location.id_location = :id', { id })
      .andWhere('zone.municipalityId = :municipalityId', { municipalityId })
      .getOne();

    if (!location) {
      throw new NotFoundException(`Location with ID "${id}" not found in municipality "${municipalityId}".`);
    }

    return location;
  }

  async findLocationWithPaymentDates(municipalityId: number, id_location: string): Promise<any> {
    const location = await this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.paiement_locations', 'paiement_locations')
      .where('AND location.municipalityId = :municipalityId AND location.id_location = :id', { id: id_location, municipalityId })
      .select([
        'location', // Select all columns from the location entity
        'paiement_locations.date_fin', // Select only the date_fin from the associated payments
      ])
      .getOne();

    if (!location) {
      throw new NotFoundException('Location not found.');
    }

    const lastPayment = location.paiement_locations && location.paiement_locations.length > 0
      ? location.paiement_locations[0]
      : null;

    const lastPaymentDate = location.paiement_locations.length > 0
      ? location.paiement_locations[0].date_fin
      : null;

    console.log("les datas ", lastPayment, "et 0,", location);
    return {
      ...location, // Spread all properties of the location entity
      derniere_date_payer: lastPaymentDate, // Add the last payment date
      paiement_locations: undefined 

    }
  }
  async update(municipalityId: number, id: string, updateDto: Partial<CreateLocationDto>): Promise<Location> {
    const location = await this.findOne(id,municipalityId);
    Object.assign(location, updateDto);
    return await this.locationRepository.save(location);
  }

  async remove(municipalityId: number, id: string): Promise<void> {
    const location = await this.findOne(id, municipalityId);
    await this.locationRepository.remove(location);
  }
}
