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

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // -----------------------
  // Créer une notification de location
  // -----------------------
  @Post('location')
  async createLocationNotification(
    @Body('userId') userId: string,
    @Body('type') type: 'CONFIRMED' | 'CANCELLED' | 'PENDING',
    @Body('data') data: any,
  ) {
    return this.notificationService.createLocationNotification(userId, type, data);
  }

  // -----------------------
  // Créer une notification de paiement
  // -----------------------
  @Post('payment')
  async createPaymentNotification(
    @Body('userId') userId: string,
    @Body('type') type: 'SUCCESS' | 'FAILED' | 'PENDING',
    @Body('data') data: any,
  ) {
    return this.notificationService.createPaymentNotification(userId, type, data);
  }

  // -----------------------
  // Créer une notification programmée
  // -----------------------
  @Post('reminder')
  async scheduleReminderNotification(
    @Body('userId') userId: string,
    @Body('scheduledAt') scheduledAt: Date,
    @Body('data') data: any,
  ) {
    return this.notificationService.scheduleReminderNotification(userId, scheduledAt, data);
  }

  // -----------------------
  // Marquer une notification comme lue
  // -----------------------
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.notificationService.markAsRead(id, userId);
  }

  // -----------------------
  // Nombre de non lues
  // -----------------------
  @Get('unread/count/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  // -----------------------
  // Récupérer les notifications d'un user avec filtres
  // -----------------------
  @Get(':userId')
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('isRead') isRead?: boolean,
    @Query('priority') priority?: string,
  ) {
    return this.notificationService.getUserNotifications(userId, {
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      isRead,
      priority,
    });
  }
}
