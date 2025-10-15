import { Injectable, OnModuleInit } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';

@Injectable()
export class EventsService implements OnModuleInit {
  private socketClient: Socket;

  onModuleInit() {
    const userId = 'd1126ca8-9e5b-48a2-bbd7-a14a248cb410';
    // L'URL de base du serveur Socket.IO, suivi du namespace
    this.socketClient = io('wss://gateway.tsirylab.com/serviceflotte', {
      
      path: '/serviceflotte/socket.io'
    });
    this.socketClient.on('connect', () => {
      console.log('✅ Connecté au serveur Socket.IO');

    });

    this.socketClient.on('connect_error', (err) => {
      console.error('❌ Erreur de connexion Socket.IO :', err);
    });

    this.socketClient.on('local_created', (data) => {
      console.log('📩 Notification reçue :', data);
    });
  }

  broadcastToAll(event: string, data: any): void {
    this.socketClient.emit(event, data);
    console.log("local created")
  }
  sendToUser(user_id: string, event: string, data: any): void {
    this.socketClient.emit(event, data);
  }
}
