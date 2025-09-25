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

  // 🔥 Optionnel : autres méthodes utilitaires
  sendToUser(userId: string, event: string, data: any) {
    this.eventsGateway.server?.to(userId).emit(event, data);
  }

  broadcastToAll(event: string, data: any) {
    this.eventsGateway.server?.emit(event, data);
  }
}