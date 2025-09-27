// websocket.controller.ts
import { Controller, Get, Post, Param, Body, BadRequestException } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

// DTOs pour la validation et la documentation Swagger
class BroadcastNotificationDto {
  @IsOptional()
  @IsUUID(4)
  userId?: string;

  @IsUUID(4)
  authorId: string;

  @IsString()
  message: string;
}

class BroadcastAllNotificationDto {
  @IsUUID(4)
  authorId: string;

  @IsString()
  message: string;
}

@ApiTags('Notifications WebSocket')
@Controller()
export class EventsController {
  constructor(private readonly eventsGateway: EventsGateway) {}

  // Route pour envoyer une notification à un utilisateur spécifique
  @Post('broadcast')
  @ApiOperation({ 
    summary: 'Envoyer une notification à un utilisateur spécifique',
    description: 'Envoie une notification via WebSocket à un utilisateur connecté. Si userId est fourni, envoie à cet utilisateur, sinon fait un broadcast à tous.'
  })
  @ApiBody({ type: BroadcastNotificationDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Notification envoyée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        userId: { type: 'string' },
        delivered: { type: 'boolean' }
      }
    }
  })
  async broadcastNotification(@Body() dto: BroadcastNotificationDto) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: dto.userId || null,
      authorId: dto.authorId,
      message: dto.message,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'message'
    };

    let delivered = false;
    let message = '';

    if (dto.userId) {
      // Envoi à un utilisateur spécifique
      delivered = this.eventsGateway.sendToUser(dto.userId, 'notification', notification);
      message = delivered 
        ? `Notification envoyée à l'utilisateur ${dto.userId}` 
        : `Utilisateur ${dto.userId} non connecté`;
    } else {
      // Broadcast à tous les utilisateurs connectés
      this.eventsGateway.broadcastToAll('notification', notification);
      delivered = true;
      message = 'Notification diffusée à tous les utilisateurs connectés';
    }

    return {
      success: true,
      message,
      userId: dto.userId || null,
      delivered,
      notification
    };
  }

  // Route pour broadcast à tous (alternative explicite)
  @Post('broadcast-all')
  @ApiOperation({ 
    summary: 'Diffuser une notification à tous les utilisateurs connectés',
    description: 'Envoie une notification via WebSocket à tous les utilisateurs actuellement connectés'
  })
  @ApiBody({ type: BroadcastAllNotificationDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Notification diffusée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        connectedUsers: { type: 'number' }
      }
    }
  })
  async broadcastToAll(@Body() dto: BroadcastAllNotificationDto) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: null, // Notification globale
      authorId: dto.authorId,
      message: dto.message,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'broadcast'
    };

    this.eventsGateway.broadcastToAll('notification', notification);
    const connectedUsers = this.eventsGateway.getConnectedUsersCount();

    return {
      success: true,
      message: 'Notification diffusée à tous les utilisateurs connectés',
      connectedUsers,
      notification
    };
  }

  // Route pour récupérer toutes les notifications d'un utilisateur
  @Get(':userId')
  @ApiOperation({ 
    summary: 'Récupérer toutes les notifications d\'un utilisateur',
    description: 'Retourne toutes les notifications pour un utilisateur donné'
  })
  @ApiParam({ name: 'userId', description: 'UUID de l\'utilisateur', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des notifications',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          authorId: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
          read: { type: 'boolean' },
          type: { type: 'string' }
        }
      }
    }
  })
  async getUserNotifications(@Param('userId') userId: string) {
    // Validation UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new BadRequestException('Invalid UUID format for userId');
    }

    // Ici vous devriez récupérer les notifications depuis votre base de données
    // Pour l'exemple, je retourne des données mockées
    const mockNotifications = [
      {
        id: `notif_${Date.now()}_1`,
        userId,
        authorId: '550e8400-e29b-41d4-a716-446655440000',
        message: 'Notification de test 1',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'message'
      },
      {
        id: `notif_${Date.now()}_2`,
        userId,
        authorId: '550e8400-e29b-41d4-a716-446655440001',
        message: 'Notification de test 2',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 heure avant
        read: true,
        type: 'message'
      }
    ];

    return mockNotifications;
  }

  // Route pour récupérer les notifications non lues d'un utilisateur
  @Get(':userId/unread')
  @ApiOperation({ 
    summary: 'Récupérer les notifications non lues d\'un utilisateur',
    description: 'Retourne uniquement les notifications non lues pour un utilisateur donné'
  })
  @ApiParam({ name: 'userId', description: 'UUID de l\'utilisateur', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des notifications non lues',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          authorId: { type: 'string' },
          message: { type: 'string' },
          timestamp: { type: 'string' },
          read: { type: 'boolean' },
          type: { type: 'string' }
        }
      }
    }
  })
  async getUserUnreadNotifications(@Param('userId') userId: string) {
    // Validation UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new BadRequestException('Invalid UUID format for userId');
    }

    // Récupérer toutes les notifications et filtrer les non lues
    const allNotifications = await this.getUserNotifications(userId);
    const unreadNotifications = allNotifications.filter(notification => !notification.read);

    return unreadNotifications;
  }

  // Routes utilitaires pour le debug/monitoring
  @Get('websocket/stats')
  @ApiOperation({ 
    summary: 'Statistiques WebSocket',
    description: 'Retourne les statistiques de connexion WebSocket'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques des connexions WebSocket',
    schema: {
      type: 'object',
      properties: {
        connectedUsers: { type: 'number' },
        timestamp: { type: 'string' }
      }
    }
  })
  getWebSocketStats() {
    return {
      connectedUsers: this.eventsGateway.getConnectedUsersCount(),
      timestamp: new Date().toISOString()
    };
  }

  @Get('websocket/users/:userId/status')
  @ApiOperation({ 
    summary: 'Statut de connexion d\'un utilisateur',
    description: 'Vérifie si un utilisateur est actuellement connecté via WebSocket'
  })
  @ApiParam({ name: 'userId', description: 'UUID de l\'utilisateur', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut de connexion de l\'utilisateur',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        isConnected: { type: 'boolean' },
        timestamp: { type: 'string' }
      }
    }
  })
  getUserConnectionStatus(@Param('userId') userId: string) {
    return {
      userId,
      isConnected: this.eventsGateway.isUserConnected(userId),
      timestamp: new Date().toISOString()
    };
  }
}