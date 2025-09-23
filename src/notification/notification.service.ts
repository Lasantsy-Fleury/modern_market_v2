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
        message: `Votre paiement de ${paymentData.montant}€ a été traité avec succès.`,
        priority: 'HIGH',
      },
      FAILED: {
        title: 'Échec du paiement',
        message: `Le paiement de ${paymentData.montant}€ a échoué. Veuillez réessayer.`,
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

async findAll(
  municipalityId: number,
  limit: number,
  page: number,
  filters: {
    userId?: string;
    type?: string;
    keyword?: string;   // recherche dans title ou message
    isRead?: boolean;   // filtre sur lu / non lu
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; // filtre sur priorité
    sentAt?: Date;
    updatedAt?: Date;
  },
) {
  try {
    if (!municipalityId) {
      throw new BadRequestException(
        'Le paramètre "municipalityId" est obligatoire.',
      );
    }

    const query = this.notifRepository
      .createQueryBuilder('notif')
      .leftJoin('location', 'loc', 'loc.id_location = notif.data->>\'id_location\'')
      .leftJoin('paiement_location', 'pl', 'pl.id_paiement_location = notif.data->>\'id_paiement_location\'')
      .where('(loc.municipalityId = :municipalityId OR pl.municipalityId = :municipalityId)', { municipalityId });

    // 🔍 Filtre userId
    if (filters.userId) {
      query.andWhere('notif.userId = :userId', { userId: filters.userId });
    }

    // 🔍 Filtre type
    if (filters.type) {
      query.andWhere('notif.type = :type', { type: filters.type });
    }

    // 🔍 Filtre mot-clé
    if (filters.keyword) {
      query.andWhere(
        '(LOWER(notif.title) LIKE :keyword OR LOWER(notif.message) LIKE :keyword)',
        { keyword: `%${filters.keyword.toLowerCase()}%` },
      );
    }

    // 🔍 Filtre statut lecture
    if (filters.isRead !== undefined) {
      query.andWhere('notif.isRead = :isRead', { isRead: filters.isRead });
    }

    // 🔍 Filtre priorité
    if (filters.priority) {
      query.andWhere('notif.priority = :priority', { priority: filters.priority });
    }

    // 🔍 Dates optionnelles
    if (filters.sentAt) {
      query.andWhere('DATE(notif.sentAt) = :sentAt', { sentAt: filters.sentAt });
    }

    if (filters.updatedAt) {
      query.andWhere('DATE(notif.updatedAt) = :updatedAt', { updatedAt: filters.updatedAt });
    }

    // 📌 Pagination
    query
      .orderBy('notif.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [result, total] = await query.getManyAndCount();

    return {
      message: 'Liste des notifications filtrées par municipalité',
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      status: 200,
    };
  } catch (error) {
    throw new ServiceUnavailableException(
      'Impossible de récupérer les notifications pour le moment. Veuillez réessayer plus tard.',
    );
  }
}


}
