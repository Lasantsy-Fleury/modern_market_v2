import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service'; // 🔥 Nouveau
;


@Module({
  providers: [EventsGateway, EventsService,], // 🔥 Ajouter EventsService
  exports: [EventsService], // 🔥 Exporter pour utilisation ailleurs

})
export class EventsModule {}


      // this.socketClient.on('connect', () => {
      //   console.log('✅ Connecté au service de notification WebSocket');
      //   this.isConnected = true;
      //   this.socketClient.emit('subscribeToNotifications', { userId });
      //   resolve();
      // });

      // this.socketClient.on('subscribed', (message) => {
      //   console.log('✅ Abonnement confirmé:', message);
      // });

      // this.socketClient.on('notification', (notification) => {
      //   console.log('📨 Notification reçue:', notification);
      //   this.handleNotification(notification);
      // });

      // this.socketClient.on('connect_error', (error) => {
      //   console.error('❌ Erreur de connexion WebSocket:', error.message);
      //   reject(error);
      // });

      // this.socketClient.on('error', (error) => {
      //   console.error('❌ Erreur WebSocket:', error);
      // });

  //     this.socketClient.on('disconnect', (reason) => {
  //       console.log('🔌 Déconnecté du service WebSocket:', reason);
  //       this.isConnected = false;
  //     });
  //   });
  // }

  // private disconnect(): void {
  //   if (this.socketClient) {
  //     this.socketClient.disconnect();
  //     this.socketClient = null;
  //     this.isConnected = false;
  //     console.log('🔌 Déconnexion du service WebSocket');
  //   }
  // }
    // public isConnectedToService(): boolean {
  //   return this.isConnected && this.socketClient?.connected;
  // }
