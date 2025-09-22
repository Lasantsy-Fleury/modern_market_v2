import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, LessThan } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { Periodicite } from './entities/location.entity';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';
import { Local } from 'src/local/entities/local.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaiementLocationService } from 'src/paiement_location/paiement_location.service';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Local)
    private readonly localRepository: Repository<Local>,
    private readonly paiementLocationService: PaiementLocationService,
    @InjectRepository(Paiementlocation)
    private readonly paiementLocationRepository: Repository<Paiementlocation>,

     private readonly eventsGateway: EventsGateway
  ) { }

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
    const countCurrentLocationUser = await this.countCurrentLocationsByUser(id_user);
    if (countCurrentLocationUser > 2) {
      throw new BadRequestException(`L'utilisateur avec l'ID ${id_user} a déjà 3 locations en cours.`);
    }

    // Conversion de la date de début
    const debut = new Date(date_debut_loc);
    debut.setHours(0, 0, 0, 0); // optionnel pour normaliser

    // Si périodicité mensuelle et contrat d'un an, calcul automatique
    if (periodicite === Periodicite.MENSUEL) {
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
    } date_fin_loc.setHours(0, 0, 0, 0); // normalisation

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
    this.eventsGateway.server.emit('create location', location);
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
    this.eventsGateway.server.emit('update location', location);
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

  async findOne(id: string, municipalityId?: number | null | undefined): Promise<Location> {
    const query = this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.local', 'local')
      .leftJoinAndSelect('local.typelocal', 'typelocal') 
      .leftJoinAndSelect('local.zone', 'zone')
      .where('location.id_location = :id', { id });

    // Ajoutez cette condition pour vérifier si municipalityId est fourni et n'est pas null
    if (municipalityId !== undefined && municipalityId !== null) {
      query.andWhere('zone.municipalityId = :municipalityId', { municipalityId });
    }

    const location = await query.getOne();

    if (!location) {
      throw new NotFoundException(`Location with ID "${id}" not found.`);
    }

    return location;
  }

  // Version sécurisée sans propriétés potentiellement inexistantes

  async findLocationWithPaymentDates(municipalityId: number, id_location: string): Promise<any> {
    try {
      console.log(`Recherche location ID: ${id_location}, Municipality: ${municipalityId}`);

      const location = await this.locationRepository
        .createQueryBuilder('location')
        .leftJoinAndSelect('location.paiement_locations', 'paiement_locations')
        .leftJoinAndSelect('location.local', 'local')
        .leftJoinAndSelect('local.typelocal', 'typelocal')
        .leftJoinAndSelect('local.zone', 'zone')
        .where('location.id_location = :id', { id: id_location })
        .andWhere('zone.municipalityId = :municipalityId', { municipalityId })
        .orderBy('paiement_locations.date_fin', 'DESC')
        .getOne();

      if (!location) {
        console.log(`Aucune location trouvée pour ID: ${id_location}, Municipality: ${municipalityId}`);
        throw new NotFoundException(`Location avec l'ID "${id_location}" non trouvée dans la municipalité "${municipalityId}".`);
      }

      console.log('Location trouvée:', {
        id: location.id_location,
        localId: location.local?.id_local,
        zoneId: location.local?.zone?.id_zone,
        municipalityId: location.local?.zone?.municipalityId
      });

      const lastPaymentDate = location.paiement_locations && location.paiement_locations.length > 0
        ? location.paiement_locations[0].date_fin
        : null;

      const tarif = location.local?.typelocal?.tarif;
      if (tarif === undefined || tarif === null) {
        console.warn(`Tarif manquant pour la location ${id_location}`);
      }

      const result = {
        id_location: location.id_location,
        periodicite: location.periodicite,
        date_debut_loc: location.date_debut_loc,
        date_fin_loc: location.date_fin_loc,
        frequence: location.frequence,
        tarif: tarif || 0,
        derniere_date_payer: lastPaymentDate,
        local_id: location.local?.id_local,
        zone_id: location.local?.zone?.id_zone,
        zone_nom: location.local?.zone?.nom,
        id_user: location.id_user,
        nif: location.nif,
        statut: new Date() <= new Date(location.date_fin_loc) ? 'ACTIF' : 'EXPIRÉ'
      };

      console.log('Données retournées:', result);
      return result;

    } catch (error) {
      console.error('Erreur dans findLocationWithPaymentDates:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(`Erreur lors de la récupération de la location: ${error.message}`);
    }
  }

  async getRemainingAmount(id_location: string): Promise<{ Montant_total: number; total_payer: number; Reste_a_payer: number }> {
    const location = await this.locationRepository.findOne({
      where: { id_location },
      relations: ['local', 'local.typelocal'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID "${id_location}" not found.`);
    }

    if (!location.local || !location.local.typelocal) {
      throw new NotFoundException(`Local or TypeLocal not found for location ID "${id_location}".`);
    }

    const { periodicite, frequence } = location;
    const tarif = location.local.typelocal.tarif;
    let Montant_total = 0;

    if (periodicite === 'MENSUEL' || periodicite === 'JOURNALIER') {
      Montant_total = tarif * frequence;
    } else {
      throw new BadRequestException(`Unsupported periodicity: ${periodicite}`);
    }

    // You need to inject and use the PaiementLocationService
    const total_payer = await this.paiementLocationService.getTotalPaidAmount(id_location);

    const Reste_a_payer = Montant_total - total_payer;

    return { Montant_total, total_payer, Reste_a_payer };
  }

  async getPaymentSchedule(id_location: string): Promise<any[]> {
    const location = await this.locationRepository.findOne({
      where: { id_location },
      relations: ['local', 'local.typelocal'],
    });

    if (!location || location.periodicite !== 'MENSUEL') {
      throw new BadRequestException('Payment schedule is only available for monthly locations.');
    }

    const tarif = location.local.typelocal.tarif;
    const paidPeriods = await this.paiementLocationRepository.find({
      where: { locationId: id_location },
      order: { date_fin: 'ASC' },
    });

    // Déclarez explicitement le type du tableau pour éviter les erreurs de typage
    const schedule: any[] = [];
    let currentDate = new Date(location.date_debut_loc);
    let paidUntilDate = new Date(location.date_debut_loc);

    if (paidPeriods.length > 0) {
      paidUntilDate = new Date(paidPeriods[paidPeriods.length - 1].date_fin);
    }

    for (let i = 0; i < location.frequence; i++) {
      const paymentDate = new Date(location.date_debut_loc);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      const isPaid = paidUntilDate >= paymentDate;

      schedule.push({
        dueDate: paymentDate.toISOString().split('T')[0],
        amount: tarif,
        status: isPaid ? 'PAID' : (paymentDate < new Date() ? 'OVERDUE' : 'DUE'),
      });
    }

    return schedule;
  }

  async update(municipalityId: number, id: string, updateDto: Partial<CreateLocationDto>): Promise<Location> {
    const location = await this.findOne(id, municipalityId);
    Object.assign(location, updateDto);
    return await this.locationRepository.save(location);
  }

  async remove(municipalityId: number, id: string): Promise<void> {
    const location = await this.findOne(id, municipalityId);
    await this.locationRepository.remove(location);
  }

  async countCurrentLocationsByUser(id_user: string): Promise<number> {
    const today = new Date();
    return await this.locationRepository.count({
      where: {
        id_user,
        date_debut_loc: LessThanOrEqual(today),
        date_fin_loc: MoreThanOrEqual(today),
      },
    });
  }

  async getNifByUserId(userId: string): Promise<string> {
    const location = await this.locationRepository.findOne({
      where: { id_user: userId },
      order: { id_location: 'DESC' },
    });

    if (!location) {
      throw new NotFoundException(`No location found for user ID "${userId}".`);
    }

    return location.nif;
  }

  async getLocationEndDate(id_location: string): Promise<Date> {
    const location = await this.locationRepository.findOne({
      where: { id_location },
      select: ['date_fin_loc'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID "${id_location}" not found.`);
    }

    return location.date_fin_loc;
  }
}
