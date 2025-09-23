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
      keyword?: string;
      isRead?: boolean;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      sentAt?: Date;
      updatedAt?: Date;
    },
  ) {
    try {
      // Construction de la requête SQL brute pour de meilleures performances
      let whereConditions = ['n.isArchived = false'];
      let parameters: any = { municipalityId };
      let paramIndex = 1;

      // Filtrage par municipalité via les relations
      const municipalityFilter = `
      EXISTS (
        SELECT 1 FROM location loc
        JOIN local l ON l.id_local = loc.localId
        JOIN zone z ON z.id_zone = l.zoneId
        WHERE loc.id_location = n.data->>'id_location'
        AND z.municipalityId = $${++paramIndex}
      ) OR EXISTS (
        SELECT 1 FROM paiement_location pl
        JOIN location pl_loc ON pl_loc.id_location = pl.locationId
        JOIN local pl_local ON pl_local.id_local = pl_loc.localId
        JOIN zone pl_zone ON pl_zone.id_zone = pl_local.zoneId
        WHERE pl.id_paiement_location = n.data->>'id_paiement_location'
        AND pl_zone.municipalityId = $${paramIndex}
      )
    `;
      whereConditions.push(`(${municipalityFilter})`);
      parameters[`param${paramIndex}`] = municipalityId;

      // Filtres dynamiques
      if (filters.userId && filters.userId !== 'getAll') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(filters.userId)) {
          throw new BadRequestException('Format userId invalide.');
        }
        whereConditions.push(`n.userId = $${++paramIndex}`);
        parameters[`param${paramIndex}`] = filters.userId;
      }

      if (filters.type) {
        whereConditions.push(`n.type = $${++paramIndex}`);
        parameters[`param${paramIndex}`] = filters.type;
      }

      if (filters.isRead !== undefined) {
        whereConditions.push(`n.isRead = $${++paramIndex}`);
        parameters[`param${paramIndex}`] = filters.isRead;
      }

      if (filters.priority) {
        whereConditions.push(`n.priority = $${++paramIndex}`);
        parameters[`param${paramIndex}`] = filters.priority;
      }

      if (filters.keyword) {
        whereConditions.push(`(LOWER(n.title) LIKE $${++paramIndex} OR LOWER(n.message) LIKE $${++paramIndex})`);
        const keyword = `%${filters.keyword.toLowerCase()}%`;
        parameters[`param${paramIndex - 1}`] = keyword;
        parameters[`param${paramIndex}`] = keyword;
      }

      // Construction de la requête finale
      const whereClause = whereConditions.join(' AND ');
      const offset = (page - 1) * limit;

      const countQuery = `
      SELECT COUNT(*) as total
      FROM notification n
      WHERE ${whereClause}
    `;

      const dataQuery = `
      SELECT n.*
      FROM notification n
      WHERE ${whereClause}
      ORDER BY 
        CASE n.priority 
          WHEN 'URGENT' THEN 4 
          WHEN 'HIGH' THEN 3 
          WHEN 'MEDIUM' THEN 2 
          WHEN 'LOW' THEN 1 
          ELSE 0 
        END DESC,
        n.createdAt DESC
      LIMIT $${++paramIndex} OFFSET $${++paramIndex}
    `;

      parameters[`param${paramIndex - 1}`] = limit;
      parameters[`param${paramIndex}`] = offset;

      // Conversion des paramètres pour la requête
      const queryParams = Object.keys(parameters)
        .sort((a, b) => {
          const aNum = a === 'municipalityId' ? 1 : parseInt(a.replace('param', ''));
          const bNum = b === 'municipalityId' ? 1 : parseInt(b.replace('param', ''));
          return aNum - bNum;
        })
        .map(key => parameters[key]);

      // Exécution des requêtes
      const [countResult, dataResult] = await Promise.all([
        this.notifRepository.query(countQuery, queryParams.slice(0, -2)),
        this.notifRepository.query(dataQuery, queryParams)
      ]);

      const total = parseInt(countResult[0].total);

      return {
        message: 'Liste des notifications filtrées par municipalité',
        data: dataResult,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        status: 200,
      };
    } catch (error) {
      console.error('Erreur dans findAllOptimized:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Impossible de récupérer les notifications pour le moment. Veuillez réessayer plus tard.',
      );
    }
  }


}
