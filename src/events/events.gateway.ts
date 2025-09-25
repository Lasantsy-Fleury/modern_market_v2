import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ path: '/servicenotification', cors: true }) // juste le path, pas l'URL complète
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // Fonction pour émettre un message à tous les clients
  broadcastMessage(event: string, data: any) {
    const payload = JSON.stringify({ event, data });
    this.server.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(payload);
      }
    });
  }
}
