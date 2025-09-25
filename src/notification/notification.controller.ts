import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,

} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateLocationNotificationDto,
  CreatePaymentNotificationDto,
  CreateReminderNotificationDto,
  MarkAsReadDto,
  GetUserNotificationsDto
} from './dto/create-notification.dto';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiResponse,  ApiBadRequestResponse,
  ApiInternalServerErrorResponse  } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  // -----------------------
  // Créer une notification de location
  // -----------------------
  @Post('location')
  @ApiOperation({ summary: 'Créer une notification de location' })
  @ApiBody({ type: CreateLocationNotificationDto })
  async createLocationNotification(
    @Body() dto: CreateLocationNotificationDto,
  ) {
    const { userId, type, data } = dto;
    return this.notificationService.createLocationNotification(userId, type, data);
  }

  // -----------------------
  // Créer une notification de paiement
  // -----------------------
  @Post('payment')
  @ApiOperation({ summary: 'Créer une notification de paiement' })
  @ApiBody({ type: CreatePaymentNotificationDto })
  async createPaymentNotification(
    @Body() dto: CreatePaymentNotificationDto,
  ) {
    const { userId, type, data } = dto;
    return this.notificationService.createPaymentNotification(userId, type, data);
  }

  // -----------------------
  // Créer une notification programmée
  // -----------------------
  @Post('reminder')
  @ApiOperation({ summary: 'Programmer une notification de rappel' })
  @ApiBody({ type: CreateReminderNotificationDto })
  async scheduleReminderNotification(
    @Body() dto: CreateReminderNotificationDto,
  ) {
    const { userId, data, dateNormalPaie } = dto;
    return this.notificationService.scheduleReminderNotification(userId, data, dateNormalPaie);
  }

  // -----------------------
  // Marquer une notification comme lue
  // -----------------------
  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiBody({ type: MarkAsReadDto })
  async markAsRead(
    @Param('id') id: string,
    @Body() dto: MarkAsReadDto,
  ) {
    return this.notificationService.markAsRead(id, dto.userId);
  }

  // -----------------------
  // Nombre de notifications non lues
  // -----------------------
  @Get('unread/count/:userId')
  @ApiOperation({ summary: 'Obtenir le nombre de notifications non lues' })
  async getUnreadCount(@Param('userId') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  // -----------------------
  // Récupérer les notifications d'un utilisateur avec filtres
  // -----------------------
  @Get(':userId')
  @ApiOperation({ summary: 'Lister les notifications d’un utilisateur avec pagination et filtres' })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query() query: GetUserNotificationsDto,
  ) {
    return this.notificationService.getUserNotifications(userId, {
      page: query.page ? +query.page : 1,
      limit: query.limit ? +query.limit : 20,
      isRead: query.isRead,
      priority: query.priority,
      // category: query.category, // si tu veux l’ajouter plus tard
    });
  }

 @Get('/getAll')
@ApiOperation({ summary: 'Récupérer les notifications filtrées par municipalité' })
@ApiQuery({ 
  name: 'municipalityId', 
  required: true, 
  type: Number, 
  description: 'ID de la municipalité',
  example: 1
})
@ApiQuery({ 
  name: 'userId', 
  required: false, 
  type: String, 
  description: 'ID de l\'utilisateur (UUID format)',
  example: '123e4567-e89b-12d3-a456-426614174000'
})
@ApiQuery({ 
  name: 'type', 
  required: false, 
  type: String, 
  description: 'Type de notification',
  example: 'PAYMENT_DUE'
})
@ApiQuery({ 
  name: 'keyword', 
  required: false, 
  type: String, 
  description: 'Mot-clé à rechercher dans title ou message',
  example: 'paiement'
})
@ApiQuery({ 
  name: 'isRead', 
  required: false, 
  type: Boolean, 
  description: 'Filtrer par lu / non lu',
  example: false
})
@ApiQuery({ 
  name: 'priority', 
  required: false, 
  enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  description: 'Niveau de priorité',
  example: 'HIGH'
})
@ApiQuery({ 
  name: 'sentAt', 
  required: false, 
  type: String, 
  description: 'Filtrer par date d\'envoi (YYYY-MM-DD)',
  example: '2024-09-23'
})
@ApiQuery({ 
  name: 'updatedAt', 
  required: false, 
  type: String, 
  description: 'Filtrer par date de mise à jour (YYYY-MM-DD)',
  example: '2024-09-23'
})
@ApiQuery({ 
  name: 'page', 
  required: false, 
  type: Number, 
  description: 'Numéro de page (minimum 1)', 
  example: 1 
})
@ApiQuery({ 
  name: 'limit', 
  required: false, 
  type: Number, 
  description: 'Nombre de résultats par page (maximum 100)', 
  example: 20 
})
@ApiResponse({ 
  status: 200, 
  description: 'Liste des notifications filtrées avec pagination',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Liste des notifications filtrées par municipalité' },
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id_notification: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            data: { type: 'object' },
            isRead: { type: 'boolean' },
            isArchived: { type: 'boolean' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            channels: { type: 'object' },
            scheduledAt: { type: 'string', format: 'date-time', nullable: true },
            sentAt: { type: 'string', format: 'date-time', nullable: true },
            readAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      },
      pagination: {
        type: 'object',
        properties: {
          page: { type: 'number' },
          limit: { type: 'number' },
          total: { type: 'number' },
          totalPages: { type: 'number' }
        }
      },
      status: { type: 'number', example: 200 }
    }
  }
})
@ApiBadRequestResponse({ 
  description: 'Paramètres invalides',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 400 },
      message: { 
        oneOf: [
          { type: 'string', example: 'Le paramètre "municipalityId" est obligatoire.' },
          { type: 'string', example: 'Format userId invalide. Un UUID valide est requis.' },
          { type: 'string', example: 'La limite ne peut pas dépasser 100' },
          { type: 'string', example: 'La page doit être supérieure à 0' }
        ]
      },
      error: { type: 'string', example: 'Bad Request' }
    }
  }
})
@ApiInternalServerErrorResponse({ 
  description: 'Erreur serveur',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 503 },
      message: { type: 'string', example: 'Impossible de récupérer les notifications pour le moment. Veuillez réessayer plus tard.' },
      error: { type: 'string', example: 'Service Unavailable' }
    }
  }
})
async findAll(
  @Query('municipalityId', ParseIntPipe) municipalityId: number,
  @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('userId') userId?: string,
  @Query('type') type?: string,
  @Query('keyword') keyword?: string,
  @Query('isRead') isRead?: string, // Reçu comme string depuis l'URL
  @Query('priority') priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  @Query('sentAt') sentAt?: string,
  @Query('updatedAt') updatedAt?: string,
) {
  // ✅ Validation des paramètres de pagination
  if (limit > 100) {
    throw new BadRequestException('La limite ne peut pas dépasser 100');
  }
  
  if (page < 1) {
    throw new BadRequestException('La page doit être supérieure à 0');
  }

  // ✅ Validation du municipalityId (déjà fait par ParseIntPipe, mais vérification supplémentaire)
  if (municipalityId <= 0) {
    throw new BadRequestException('Le municipalityId doit être un nombre positif.');
  }

  // ✅ Validation et nettoyage du userId
  let validatedUserId: string | undefined = undefined;
  if (userId && userId.trim() !== '' && userId !== 'getAll') {
    // Validation du format UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new BadRequestException('Format userId invalide. Un UUID valide est requis.');
    }
    validatedUserId = userId;
  }

  // ✅ Validation de la priorité
  if (priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
    throw new BadRequestException('La priorité doit être: LOW, MEDIUM, HIGH ou URGENT');
  }

  // ✅ Validation et conversion des dates
  let sentAtDate: Date | undefined = undefined;
  let updatedAtDate: Date | undefined = undefined;

  if (sentAt) {
    try {
      sentAtDate = new Date(sentAt);
      if (isNaN(sentAtDate.getTime())) {
        throw new Error('Date invalide');
      }
    } catch (error) {
      throw new BadRequestException('Format de date sentAt invalide. Utilisez le format YYYY-MM-DD.');
    }
  }

  if (updatedAt) {
    try {
      updatedAtDate = new Date(updatedAt);
      if (isNaN(updatedAtDate.getTime())) {
        throw new Error('Date invalide');
      }
    } catch (error) {
      throw new BadRequestException('Format de date updatedAt invalide. Utilisez le format YYYY-MM-DD.');
    }
  }

  // ✅ Conversion de isRead string -> boolean
  let isReadBoolean: boolean | undefined = undefined;
  if (isRead !== undefined && isRead !== '') {
    if (isRead === 'true' || isRead === '1') {
      isReadBoolean = true;
    } else if (isRead === 'false' || isRead === '0') {
      isReadBoolean = false;
    } else {
      throw new BadRequestException('Le paramètre isRead doit être true ou false');
    }
  }

  // ✅ Nettoyage du keyword
  const cleanKeyword = keyword && keyword.trim() !== '' ? keyword.trim() : undefined;

  // ✅ Construction de l'objet filters
  const filters = {
    userId: validatedUserId,
    type: type && type.trim() !== '' ? type.trim() : undefined,
    keyword: cleanKeyword,
    isRead: isReadBoolean,
    priority,
    sentAt: sentAtDate,
    updatedAt: updatedAtDate,
  };

  // ✅ Appel du service avec les paramètres validés
  try {
    return await this.notificationService.findAll(municipalityId, limit, page, filters);
  } catch (error) {
    // Log de l'erreur pour le débogage (à adapter selon votre système de logging)
    console.error('Erreur dans le contrôleur findAll:', error);
    throw error; // Re-lance l'erreur pour qu'elle soit gérée par le service
  }
}

}
