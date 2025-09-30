// events.service.ts
import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsService {
  constructor(private readonly eventsGateway: EventsGateway) {}

  // 🔥 Méthode déplacée ici
  sendWebSocketNotification(event: string, data: any) {
    try {
      if (this.eventsGateway?.server) {
        this.eventsGateway.server.emit(event, data);
        console.log(`WebSocket event "${event}" emitted successfully`);
      } else {
        console.warn('WebSocket server not available');
      }
    } catch (error) {
      console.error('Error emitting WebSocket event:', error);
    }
  }

  // 🔥 Envoyer à un utilisateur spécifique
  sendToUser(userId: string, event: string, data: any) {
    try {
      this.eventsGateway.sendToUser(userId, event, data);
      console.log(`WebSocket event "${event}" sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending WebSocket event to user:', error);
    }
  }

  // 🔥 Diffuser à tous les utilisateurs
  broadcastToAll(event: string, data: any) {
    try {
      this.eventsGateway.broadcastToAll(event, data);
      console.log(`WebSocket event "${event}" broadcasted to all users`);
    } catch (error) {
      console.error('Error broadcasting WebSocket event:', error);
    }
  }
}