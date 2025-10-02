// events.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  path: '/servicemodernmarket',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Important: ajouter les deux transports
  allowEIO3: true, // Compatibilité avec les anciennes versions
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    // 🔥 RÉCUPÉRER LE userId DEPUIS LES QUERY PARAMETERS
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      console.warn(`Client ${client.id} attempted connection without userId`);
      client.disconnect(); // Déconnecter si pas de userId
      return;
    }

    if (!this.isValidUUID(userId)) {
      console.warn(`Client ${client.id} provided invalid UUID: ${userId}`);
      client.disconnect();
      return;
    }

    // 🔥 ENREGISTRER L'UTILISATEUR
    this.registerUser(userId, client.id);

    console.log(`User ${userId} registered with socket ${client.id}`);

    // 🔥 ENVOYER UN ACCUSÉ DE RÉCEPTION
    client.emit('connected', {
      success: true,
      message: 'Successfully connected to notification service',
      userId
    });

    // Écouter les événements personnalisés
    this.setupEventListeners(client);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);

    if (userId) {
      this.unregisterUser(userId, client.id);
      console.log(`User ${userId} disconnected (socket: ${client.id})`);
    } else {
      console.log(`Unknown client disconnected: ${client.id}`);
    }
  }

  // 🔥 MÉTHODE D'ENREGISTREMENT
  private registerUser(userId: string, socketId: string) {
    this.userSockets.set(userId, socketId);
    this.socketUsers.set(socketId, userId);
  }

  private unregisterUser(userId: string, socketId: string) {
    this.userSockets.delete(userId);
    this.socketUsers.delete(socketId);
  }

  private setupEventListeners(client: Socket) {
    // Écouter l'événement de subscription (au cas où)
    client.on('subscribeToNotifications', (data: { userId: string }) => {
      console.log(`User ${data.userId} subscribed to notifications`);
      client.emit('subscribed', { success: true, userId: data.userId });
    });

    // Écouter les pings
    client.on('ping', () => {
      client.emit('pong', { timestamp: new Date().toISOString() });
    });
  }

  // 🔥 VALIDATION UUID
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Méthode pour envoyer à un utilisateur spécifique
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
      console.log(`Event "${event}" sent to user ${userId} (socket: ${socketId})`);
      return true;
    } else {
      console.log(`User ${userId} not connected, event "${event}" not sent`);
      return false;
    }
  }

  // Méthode pour diffuser à tous
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
    console.log(`Event "${event}" broadcasted to ${this.server.engine.clientsCount} clients`);
  }

  // 🔥 NOUVELLE MÉTHODE : Obtenir le nombre d'utilisateurs connectés
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // 🔥 NOUVELLE MÉTHODE : Vérifier si un utilisateur est connecté
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}