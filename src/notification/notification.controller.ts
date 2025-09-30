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
  UsePipes,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateLocationNotificationDto,
  CreatePaymentNotificationDto,
  CreateReminderNotificationDto,
  MarkAsReadDto,
  GetMunicipalityNotificationsDto,
  CreateHistoriqueDto
} from './dto/create-notification.dto';
import {
  ApiTags, ApiOperation, ApiBody, ApiQuery, ApiResponse, ApiParam
} from '@nestjs/swagger';

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
  // @Get(':userId')
  // @ApiOperation({ summary: 'Lister les notifications d’un utilisateur avec pagination et filtres' })
  // async getUserNotifications(
  //   @Param('userId') userId: string,
  //   @Query() query: GetUserNotificationsDto,
  // ) {
  //   return this.notificationService.getUserNotifications(userId, {
  //     page: query.page ? +query.page : 1,
  //     limit: query.limit ? +query.limit : 20,
  //     isRead: query.isRead,
  //     priority: query.priority,
  //     type: query.type, // <-- ajout du filtre type
  //   });
  // }

  @Get()
  @ApiOperation({ summary: 'Lister les notifications filtrées par municipalité avec pagination' })
  async findAll(
    @Query() query: GetMunicipalityNotificationsDto,
  ) {
    const {
      municipalityId, // 👉 Peut être undefined maintenant
      userId,
      type,
      priority,
      isRead,
      page = 1,
      limit = 20,
      dateFrom,
      dateTo,
    } = query;

    return this.notificationService.findAllSimple({
      municipalityId,
      userId,
      type,
      priority,
      isRead,
      page,
      limit,
      dateFrom,
      dateTo
    });
  }



  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Récupérer une notification spécifique par ID avec vérification de municipalité' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la notification' })
  @ApiQuery({ name: 'municipalityId', type: Number, required: true, description: 'ID de la municipalité' })
  @ApiResponse({ status: 200, description: 'Notification trouvée' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée ou non accessible dans cette municipalité' })
  async findOne(
    @Param('id') id: string,
    @Query('municipalityId') municipalityId: string,
  ) {
    try {
      const notification = await this.notificationService.findOneSimple(id, municipalityId);

      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found or not accessible in municipality ${municipalityId}`);
      }

      return {
        success: true,
        data: notification,
        municipalityId
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error fetching notification: ${error.message}`);
    }
  }


  @Get(':userId/rapport')
  @ApiOperation({ summary: 'Obtenir le rapport des notifications HISTORIQUE CONTROLLEUR par zone' })
  async getRapport(
    @Param('userId') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    // Si besoin : filtrer par période
    const filters = {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };

    return this.notificationService.getRapport(userId, filters);
  }
}
