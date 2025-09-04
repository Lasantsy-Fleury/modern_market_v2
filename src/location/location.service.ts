import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { Periodicite } from './entities/location.entity';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) { }

  async findAll() {
    return await this.locationRepository.find();
  }

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const { date_debut_loc, date_fin_loc, periodicite, localId, id_user, nif } = createLocationDto;

    console.log("le dto recu est ", createLocationDto);

    //Verifier si cet user a deja eu une location
    const existingUser = await this.locationRepository.findOne({
      where: { id_user }
    });

    if (existingUser && existingUser.nif !== nif) {
      throw new BadRequestException(`le nif de l'user ${id_user} est de  ${existingUser.nif} `)
    }

    const debut = new Date(date_debut_loc);
    const fin = new Date(date_fin_loc);

    const today = new Date();

    // Vérifier si le local est déjà en location en cours
    const existingLocation = await this.locationRepository.findOne({
      where: {
        localId,
        date_debut_loc: Between(new Date('1900-01-01'), today),
        date_fin_loc: Between(today, new Date('9999-12-31')),
      },
    });

    if (existingLocation) {
      throw new Error(`Le local ${localId} est déjà en location en cours.`);
    }

    if (debut >= fin) {
      throw new BadRequestException("La date de début doit être avant la date de fin.");
    }

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

    // Calcul fréquence
    let frequence = 0;
    if (periodicite === Periodicite.JOURNALIER) {
      const diffDays = Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24));
      frequence = diffDays;
    } else if (periodicite === Periodicite.MENSUEL) {
      const diffMonths =
        (fin.getFullYear() - debut.getFullYear()) * 12 +
        (fin.getMonth() - debut.getMonth());

      if (date_fin_loc.getDate() >= date_debut_loc.getDate()) {
        frequence = diffMonths + 1;
      } else {
        frequence = diffMonths;
      }

    }

    // Création de la location
    const location = this.locationRepository.create({
      ...createLocationDto,
      frequence,
    });

    return await this.locationRepository.save(location);
  }



  async findAllInProgress(): Promise<Location[]> {
    const today = new Date();

    return await this.locationRepository.find({
      where: {
        date_debut_loc: LessThanOrEqual(today),
        date_fin_loc: MoreThanOrEqual(today),
      },
      relations: ['local', 'paiement_locations'],
    });
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

  async findOne(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id_location: id },
      relations: ['local', 'paiement_locations'],
    });
    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }
    return location;
  }


  async findLocationWithPaymentDates(id_location: string): Promise<any> {
    const location = await this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.paiement_locations', 'paiement_locations')
      .where('location.id_location = :id', { id: id_location })
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
      paiement_locations: undefined // Explicitly remove the full payment location array

    }
  }
  async update(id: string, updateDto: Partial<CreateLocationDto>): Promise<Location> {
    const location = await this.findOne(id);
    Object.assign(location, updateDto);
    return await this.locationRepository.save(location);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
  }
}
