import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepository: Repository<Notification>,
  ) {}

  async createLocationNotification(
    userId: string,
    type: 'CONFIRMED' | 'CANCELLED' |'PENDING',
    locationData: any,
  ) {
    const templates = {
      CONFIRMED: {
        title: 'Réservation confirmée',
        message: `Votre réservation pour le local ${locationData.localNumber} est confirmée.`,
        priority: 'HIGH',
        channels: { inApp: true, email: true, sms: false, push: true },
      },
      CANCELLED: {
        title: 'Réservation annulée',
        message: `Votre réservation ${locationData.reservationNumber} a été annulée.`,
        priority: 'HIGH',
        channels: { inApp: true, email: true, sms: false, push: true },
      },
    };

    const notification = this.notifRepository.create({
      userId,
      type: type === 'CONFIRMED' ? 'LOCATION CONFIRMEE' : 'LOCATION ANNULEE',
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
        message: `Votre paiement de ${paymentData.amount}€ a été traité avec succès.`,
        priority: 'HIGH',
      },
      FAILED: {
        title: 'Échec du paiement',
        message: `Le paiement de ${paymentData.amount}€ a échoué. Veuillez réessayer.`,
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
    scheduledAt: Date,
    reminderData: any,
  ) {
    const notification = this.notifRepository.create({
      userId,
      type: 'RAPPELLE DE PAIEMENT',
      title: 'Rappel de paiement',
      message: `N'oubliez pas votre paiement d'ici le ${reminderData.dueDate}`,
      data: reminderData,
      scheduledAt,
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
}
