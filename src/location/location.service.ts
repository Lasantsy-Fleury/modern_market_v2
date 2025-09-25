import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
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
import { NotificationService } from 'src/notification/notification.service';
import * as QRCode from 'qrcode';
import axios from 'axios';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Local)
    private readonly localRepository: Repository<Local>,
    private readonly paiementLocationService: PaiementLocationService,
    @InjectRepository(Paiementlocation)
    private readonly paiementLocationRepository: Repository<Paiementlocation>,
    private readonly notificationService: NotificationService,
    private readonly eventsGateway: EventsGateway,
  ) { }

  /**
   * Job CRON qui s'exécute tous les jours à minuit pour gérer les locations expirées
   * et mettre à jour le statut des locaux
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Europe/Paris',
  })
  async handleExpiredLocations() {
    console.log('--- JOB CRON EXÉCUTÉ À MINUIT ---');
    this.logger.log('Lancement du job CRON pour vérifier les locations expirées.');
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fin de journée pour inclure toute la journée

    try {
      // 1. Récupérer toutes les locations expirées avec leurs locaux
      const expiredLocations = await this.locationRepository.find({
        where: { 
          date_fin_loc: LessThan(today) // Strictement avant aujourd'hui
        },
        relations: ['local'],
      });

      this.logger.log(`${expiredLocations.length} locations expirées trouvées.`);

      for (const location of expiredLocations) {
        if (location.local) {
          await this.updateLocalStatusIfNoActiveLocation(location.local.id_local);
        }
      }

      // 2. Vérifier tous les locaux LOUÉS pour s'assurer qu'ils ont bien une location active
      const rentedLocals = await this.localRepository.find({
        where: { statut: 'LOUE' }
      });

      for (const local of rentedLocals) {
        await this.updateLocalStatusIfNoActiveLocation(local.id_local);
      }

      this.logger.log(`Fin du job CRON. ${expiredLocations.length} locations expirées traitées.`);
    } catch (error) {
      this.logger.error('Erreur lors du traitement des locations expirées:', error);
    }
  }
 
  private async updateLocalStatusIfNoActiveLocation(localId: string): Promise<void> {
  try {
    const today = new Date();
    
    // Vérifier s'il y a une location active pour ce local
    const activeLocation = await this.locationRepository.findOne({
      where: {
        localId,
        date_debut_loc: LessThanOrEqual(today),
        date_fin_loc: MoreThanOrEqual(today),
      },
    });

    // Récupérer le local
    const local = await this.localRepository.findOne({
      where: { id_local: localId }
    });

    if (local) {
      // S'il n'y a pas de location active, le local doit être DISPONIBLE
      if (!activeLocation) {
        if (local.statut !== 'DISPONIBLE') {
          this.logger.log(`Aucune location active trouvée pour le local ${localId}. Mise à jour du statut en DISPONIBLE.`);
          
          local.statut = 'DISPONIBLE';
          await this.localRepository.save(local);
          
          // Émettre un événement pour notifier le changement
          this.eventsGateway.server.emit('local_status_updated', {
            localId: local.id_local,
            newStatus: 'DISPONIBLE',
            timestamp: new Date()
          });
        }
      }
      // S'il y a une location active, le local doit être LOUÉ
      else {
        if (local.statut !== 'LOUE') {
          this.logger.log(`Location active trouvée pour le local ${localId}. Mise à jour du statut en LOUÉ.`);
          
          local.statut = 'LOUE';
          await this.localRepository.save(local);
          
          // Émettre un événement pour notifier le changement
          this.eventsGateway.server.emit('local_status_updated', {
            localId: local.id_local,
            newStatus: 'LOUE',
            timestamp: new Date()
          });
        }
      }
    }
  } catch (error) {
    this.logger.error(`Erreur lors de la mise à jour du statut du local ${localId}:`, error);
  }
}

  @Cron(CronExpression.EVERY_MINUTE)
  async updateExpiredLocations() {
    // Cette méthode peut être supprimée car la logique est maintenant dans handleExpiredLocations
    // Ou vous pouvez la garder pour une vérification plus fréquente
    const now = new Date();

    const expiredLocations = await this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.local', 'local')
      .where('location.date_fin_loc < :now', { now })
      .andWhere('local.statut = :statut', { statut: 'LOUE' })
      .getMany();

    for (const loc of expiredLocations) {
      await this.updateLocalStatusIfNoActiveLocation(loc.local.id_local);
    }
  }

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

  const local = await this.localRepository.findOne({
    where: { id_local: localId },
    relations: ['typelocal'],
  });

  if (!local) {
    throw new NotFoundException(`Local with id ${localId} not found`);
  }

  const countCurrentLocationUser = await this.countCurrentLocationsByUser(id_user);
  if (countCurrentLocationUser > 2) {
    throw new BadRequestException(`L'utilisateur avec l'ID ${id_user} a déjà 3 locations en cours.`);
  }

  const debut = new Date(date_debut_loc);
  debut.setHours(0, 0, 0, 0);

  // Calcul de la date de fin
  if (periodicite === Periodicite.MENSUEL) {
    date_fin_loc = new Date(debut);
    date_fin_loc.setFullYear(date_fin_loc.getFullYear() + 1);
    date_fin_loc.setHours(0, 0, 0, 0); // Normalisation pour les locations mensuelles
  } else if (periodicite === Periodicite.JOURNALIER) {
    date_fin_loc = new Date(debut);
    date_fin_loc.setHours(23, 59, 59, 999);
  } else {
    date_fin_loc = createLocationDto.date_fin_loc
      ? new Date(createLocationDto.date_fin_loc)
      : new Date(debut);
    date_fin_loc.setHours(0, 0, 0, 0); // Normalisation pour les locations autres
  }

  const fin = new Date(date_fin_loc);

  if (debut >= fin) {
    throw new BadRequestException("La date de début doit être avant la date de fin.");
  }

  // Vérifier s'il y a un chevauchement avec une location existante
  const existingLocation = await this.locationRepository.createQueryBuilder('location')
    .where('location.localId = :localId', { localId })
    .andWhere('location.date_debut_loc < :newFin', { newFin: fin })
    .andWhere('location.date_fin_loc > :newDebut', { newDebut: debut })
    .getOne();

  if (existingLocation) {
    throw new BadRequestException(`Le local ${localId} est déjà loué pour la période demandée.`);
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
    
    if (fin.getDate() === debut.getDate() && diffMonths > 0) {
      frequence = diffMonths;
    } else {
      frequence = fin.getDate() >= debut.getDate() ? diffMonths + 1 : diffMonths;
    }
  }

  // Création de la location
  const location = this.locationRepository.create({
    ...createLocationDto,
    date_fin_loc: fin, // Utilisation de la date de fin calculée et normalisée
    frequence,
  });
  
  const notifData = {
    id_location: location.id_location,
    localId: location.localId
  }

  this.eventsGateway.server.emit('create location', location);
  this.notificationService.createLocationNotification(location.id_user, "CONFIRMED", notifData);
  
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

    // Récupérer le montant total déjà payé pour cette location.
    const total_payer = await this.paiementLocationService.getTotalPaidAmount(id_location);

    // Calculer le coût total de tout le contrat en additionnant le montant payé et le montant restant à payer.
    let Montant_total = total_payer + (tarif * frequence);

    // Calculer le montant restant à payer.
    const Reste_a_payer = Montant_total - total_payer;

    return { 
      Montant_total, 
      total_payer, 
      Reste_a_payer: Math.max(0, Reste_a_payer) // Utiliser Math.max pour éviter les valeurs négatives
    };
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

  async remove(id: string): Promise<void> {
    const location = await this.locationRepository.findOne({ 
      where: { id_location: id }, 
      relations: ['local'], 
    });

    if (!location) {
      throw new NotFoundException(`Location avec l'ID "${id}" introuvable`);
    }

    const local = location.local;

    if (local) {
      // Mettre à jour le statut du local en 'DISPONIBLE' avant la suppression de la location
      local.statut = 'DISPONIBLE';
      await this.localRepository.save(local);
      
      // Émettre un événement pour notifier le changement
      this.eventsGateway.server.emit('local_status_updated', {
        localId: local.id_local,
        newStatus: 'DISPONIBLE',
        timestamp: new Date()
      });
    }
    
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

  async checkAndSendReminders(location: Location) {
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Récupérer la dernière paiement_location (par date_fin max)
    const lastPaiement = await this.paiementLocationRepository
      .createQueryBuilder('pl')
      .where('pl.locationId = :locId', { locId: location.id_location })
      .orderBy('pl.date_fin', 'DESC')
      .getOne();

    if (!lastPaiement) {
      throw new NotFoundException(`Pas de paiement trouvé pour la location ${location.id_location}`);
    }

    // Calculer la prochaine échéance (date_fin du dernier paiement + 1 mois)
    const nextDueDate = new Date(lastPaiement.date_fin);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    const nextDueDateOnly = new Date(nextDueDate.getFullYear(), nextDueDate.getMonth(), nextDueDate.getDate());

    // Différence en jours entre aujourd'hui et la prochaine échéance
    const diffDays = Math.floor(
      (nextDueDateOnly.getTime() - todayDateOnly.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Préparer les données pour la notification
    const reminderData = {
      montant: lastPaiement.montant_paye,
      locationId: location.id_location,
    };

    // J-5 ou J-2 avant la prochaine échéance
    if (diffDays === 5 || diffDays === 2) {
      await this.notificationService.scheduleReminderNotification(
        location.id_user,
        reminderData,
        nextDueDateOnly.getDate()
      );
    }

    // Après échéance, tous les jours si pas encore payé
    if (diffDays < 0) {
      await this.notificationService.scheduleReminderNotification(
        location.id_user,
        reminderData,
        nextDueDateOnly.getDate()
      );
    }
  }

  // 🔌 Job CRON qui vérifie tous les jours à 8h
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyReminders() {
    const allLocations = await this.locationRepository.find();

    for (const loc of allLocations) {
      await this.checkAndSendReminders(loc);
    }
  }

  async generateUserQrCode(userId: string): Promise<{ userId: string; qrCode: string }> {
    try {
      // Vérifier que l'utilisateur existe
      const response = await axios.get(`https://gateway.tsirylab.com/serviceauth/users/${userId}`);

      if (!response.data || !response.data.user_id) {
        throw new NotFoundException(`Utilisateur avec ID ${userId} introuvable`);
      }

      // Générer un QRCode encodant l'userId
      const qrCodeDataUrl = await QRCode.toDataURL(userId);

      return {
        userId: response.data.user_id,
        qrCode: qrCodeDataUrl, // ⚡ base64 utilisable dans <img src="...">
      };
    } catch (error) {
      throw new NotFoundException(`Impossible de générer le QRCode pour l'utilisateur ${userId}`);
    }
  }

  async findOccupiedPeriods(localId: string): Promise<Location[]> {
  const occupiedPeriods = await this.locationRepository.find({
    where: { localId },
    select: ['date_debut_loc', 'date_fin_loc'],
    order: { date_debut_loc: 'ASC' },
  });
  return occupiedPeriods;
}
}