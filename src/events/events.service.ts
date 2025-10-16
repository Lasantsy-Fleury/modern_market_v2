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


// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { io, Socket } from 'socket.io-client';

// @Injectable()
// export class EventsService implements OnModuleInit {
//   private socketClient: Socket;
//   private isConnected: boolean = false;
//   onModuleInit() {
//     const userId = 'd1126ca8-9e5b-48a2-bbd7-a14a248cb410';

//     // L'URL de base du serveur Socket.IO, suivi du namespace
//     this.socketClient = io('wss://gateway.tsirylab.com/servicenotification', {
//       query: { userId },
//     });
//     this.socketClient.on('connect', () => {
//       this.isConnected = true;
//       console.log('✅ Connecté au serveur Socket.IO');

//     });

//     this.socketClient.on('connect_error', (err) => {
//       console.error('❌ Erreur de connexion Socket.IO :', err);
//     });

//     this.socketClient.on('local_created', (data) => {
//       console.log('📩 Notification reçue :', data);
//     });
//   }

//     broadcastToAll(event: string, data: any): boolean {
//     if (this.isConnected === true && this.socketClient) {
//       this.socketClient.emit(event, data);
//       console.log("✅ Message envoyé avec succès.event:",event,"data",data);

//         // Écouter la confirmation du serveur
//     this.socketClient.once('local_created', (confirmation) => {
//       console.log('✅ Confirmation reçue du serveur:', confirmation);
//     });
//       return true;
//     } else {
//       console.log("❌ Erreur d'envoi du message - Non connecté");
//       return false;
//     }
//   }

//   sendToUser(userId: string, event: string, data: any): boolean {


//     this.socketClient.emit('sendToUser', {
//       targetUserId: userId,
//       event: event,
//       data: data
//     });

//     console.log(`📤 Event "${event}" routé vers l'utilisateur ${userId} via le service de notification`);
//     return true;
//   }
// }
