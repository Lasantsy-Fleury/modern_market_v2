import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { Location } from 'src/location/entities/location.entity';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';
import { Local } from 'src/local/entities/local.entity';
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepository: Repository<Notification>,

    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,

    @InjectRepository(Location)
    private readonly paiementLocationRepository: Repository<Paiementlocation>,

    @InjectRepository(Local)
    private readonly localRepository: Repository<Local>,
  ) { }

  async createLocationNotification(
    userId: string,
    type: 'CONFIRMED' | 'CANCELLED' | 'PENDING',
    locationData: any,
  ) {
    if (!locationData.id_location && !locationData.localId) {
      throw new BadRequestException(
        'Vous devez fournir soit id_location soit localId',
      );
    }

    let local;

    // Si l'id de location est fourni
    if (locationData.id_location) {
      const location = await this.locationRepository.findOne({
        where: { id_location: locationData.id_location },
      });

      if (!location) {
        throw new NotFoundException(
          `Aucune location trouvée avec l'id ${locationData.id_location}`,
        );
      }

      // Vérifier que l'utilisateur est propriétaire
      if (location.id_user !== userId) {
        throw new ForbiddenException(
          `L'utilisateur ${userId} n'a pas accès à cette location`,
        );
      }

      // Récupérer le local associé à la location
      local = await this.localRepository.findOne({
        where: { id_local: location.localId },
      });

      if (!local) {
        throw new NotFoundException(`Aucun local trouvé pour cette location`);
      }
    }

    // Si seulement localId est fourni
    if (!local && locationData.localId) {
      local = await this.localRepository.findOne({
        where: { id_local: locationData.localId },
      });

      if (!local) {
        throw new NotFoundException(
          `Aucun local trouvé avec l'id ${locationData.localId}`,
        );
      }
    }

    // Préparer les templates
    const templates = {
      CONFIRMED: {
        title: 'Location confirmée',
        message: `Votre location pour le local ${local.numero} est confirmée.`,
        priority: 'HIGH',
        channels: { inApp: true, email: true, sms: false, push: true },
      },
      CANCELLED: {
        title: 'Location annulée',
        message: `Impossible de louer le local ${local.numero}.`,
        priority: 'HIGH',
        channels: { inApp: true, email: false, sms: false, push: true },
      },
      PENDING: {
        title: 'Location en attente',
        message: `La location du local ${local.numero} est en attente.`,
        priority: 'MEDIUM',
        channels: { inApp: true, email: false, sms: false, push: true },
      },
    };

    const notification = this.notifRepository.create({
      userId,
      type:
        type === 'CONFIRMED'
          ? 'LOCATION CONFIRMEE'
          : type === 'CANCELLED'
            ? 'LOCATION ANNULEE'
            : 'LOCATION EN ATTENTE',
      ...templates[type],
      data: locationData,
    });

    return await this.notifRepository.save(notification);
  }


  async createPaymentNotification(
    userId: string,
    type: 'SUCCESS' | 'FAILED' | 'PENDING',
    paymentData: any,
  ) {
    const templates = {
      SUCCESS: {
        title: 'Paiement réussi',
        message: `Votre paiement de ${paymentData.montant} Ar a été traité avec succès.`,
        priority: 'HIGH',
      },
      FAILED: {
        title: 'Échec du paiement',
        message: `Le paiement de ${paymentData.montant} Ar a échoué. Veuillez réessayer.`,
        priority: 'URGENT',
      },
    };

    const notification = this.notifRepository.create({
      userId,
      type: type === 'SUCCESS' ? 'PAIEMENT REUSSIE' : 'PAIEMENT NON REUSSIE',
      ...templates[type],
      data: paymentData,
      channels: { inApp: true, email: true, sms: true, push: true },
    });

    return await this.notifRepository.save(notification);
  }

  async scheduleReminderNotification(
    userId: string,
    reminderData: any,
    dateNormalPaie: number
  ) {
    const notification = this.notifRepository.create({
      userId,
      type: 'RAPPELLE DE PAIEMENT',
      title: 'Rappel de paiement',
      message: `N'oubliez pas votre paiement de votre location d' une montant de ${reminderData.montant} d'ici le ${dateNormalPaie} du mois.`,
      data: reminderData,
      priority: 'MEDIUM',
    });

    return await this.notifRepository.save(notification);
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notifRepository.findOne({
      where: { id_notification: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return await this.notifRepository.save(notification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepository.count({
      where: { userId, isRead: false, isArchived: false },
    });
  }

  async getUserNotifications(
    userId: string,
    options: { page?: number; limit?: number; isRead?: boolean; priority?: string },
  ) {
    const { page = 1, limit = 20, isRead, priority } = options;

    const query = this.notifRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.isArchived = :archived', { archived: false });

    if (isRead !== undefined) {
      query.andWhere('notification.isRead = :isRead', { isRead });
    }

    if (priority) {
      query.andWhere('notification.priority = :priority', { priority });
    }

    query
      .orderBy('notification.priority', 'DESC')
      .addOrderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [result, total] = await query.getManyAndCount();

    return {
      data: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllSimple(municipalityId: number) {
    return this.notifRepository
      .createQueryBuilder('notification')
      .where(
        `EXISTS (
        SELECT 1 FROM location loc
        INNER JOIN local l ON l.id_local = loc."localId"
        INNER JOIN zone z ON z.id_zone = l."zoneId"
        WHERE (
          (notification.data->>'id_location' IS NOT NULL AND notification.data->>'id_location' = loc.id_location::text)
          OR (notification.data->>'localId' IS NOT NULL AND notification.data->>'localId' = l.id_local::text)
        )
        AND z."municipalityId" = :municipalityId
      )`,
        { municipalityId }
      )
      .orWhere(
        `EXISTS (
        SELECT 1 FROM paiement_location pl
        INNER JOIN location loc ON loc.id_location = pl."locationId"
        INNER JOIN local l ON l.id_local = loc."localId"
        INNER JOIN zone z ON z.id_zone = l."zoneId"
        WHERE (
          (notification.data->>'id_paiement' IS NOT NULL AND notification.data->>'id_paiement' = pl."paiementId"::text)
          OR (notification.data->>'id_paiement_location' IS NOT NULL AND notification.data->>'id_paiement_location' = pl.id_paiement_location::text)
        )
        AND z."municipalityId" = :municipalityId
      )`,
        { municipalityId }
      )
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  async findOneSimple(id: string, municipalityId: number) {
    console.log('Recherche notification:', { id, municipalityId });

    // D'abord, vérifions si la notification existe
    const notificationExists = await this.notifRepository.findOne({
      where: { id_notification: id }
    });

    console.log('Notification existe:', !!notificationExists);
    if (notificationExists) {
      console.log('Data de la notification:', notificationExists.data);
    }

    // Testons chaque condition séparément
    const locationCondition = await this.notifRepository
      .createQueryBuilder('notification')
      .where('notification.id_notification = :id', { id })
      .andWhere(
        `EXISTS (
        SELECT 1 FROM location loc
        INNER JOIN local l ON l.id_local = loc."localId"
        INNER JOIN zone z ON z.id_zone = l."zoneId"
        WHERE (
          (notification.data->>'id_location' IS NOT NULL AND notification.data->>'id_location' = loc.id_location::text)
          OR (notification.data->>'localId' IS NOT NULL AND notification.data->>'localId' = l.id_local::text)
        )
        AND z."municipalityId" = :municipalityId
      )`,
        { municipalityId }
      )
      .getOne();

    console.log('Résultat condition location:', !!locationCondition);

    const paiementCondition = await this.notifRepository
      .createQueryBuilder('notification')
      .where('notification.id_notification = :id', { id })
      .andWhere(
        `EXISTS (
        SELECT 1 FROM paiement_location pl
        INNER JOIN location loc ON loc.id_location = pl."locationId"
        INNER JOIN local l ON l.id_local = loc."localId"
        INNER JOIN zone z ON z.id_zone = l."zoneId"
        WHERE (
          (notification.data->>'id_paiement' IS NOT NULL AND notification.data->>'id_paiement' = pl."paiementId"::text)
          OR (notification.data->>'id_paiement_location' IS NOT NULL AND notification.data->>'id_paiement_location' = pl.id_paiement_location::text)
        )
        AND z."municipalityId" = :municipalityId
      )`,
        { municipalityId }
      )
      .getOne();

    console.log('Résultat condition paiement:', !!paiementCondition);

    // Requête finale corrigée
    return this.notifRepository
      .createQueryBuilder('notification')
      .where('notification.id_notification = :id', { id })
      .andWhere(
        `(EXISTS (/* condition location */) OR EXISTS (/* condition paiement */))`,
        { municipalityId }
      )
      .getOne();
  }
}
