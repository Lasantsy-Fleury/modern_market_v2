import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateLocationNotificationDto,
  CreatePaymentNotificationDto,
  CreateReminderNotificationDto,
  MarkAsReadDto,
  GetUserNotificationsDto
} from './dto/create-notification.dto';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

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
    const { userId, data,dateNormalPaie } = dto;
    return this.notificationService.scheduleReminderNotification(userId,  data,dateNormalPaie);
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
}
