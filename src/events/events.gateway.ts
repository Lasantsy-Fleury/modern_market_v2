import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      "http://192.168.10.10:8080",
      "http://localhost:8080", 
      "http://127.0.0.1:8080",
      "http://localhost:5173",
      "https://anjaranaka.tsirylab.com",
      "https://gateway.tsirylab.com", // AJOUT IMPORTANT
      "file://"
    ],
    methods: ['GET', 'POST'],
    credentials: true, // Changé à true si vous avez besoin d'authentification
  },
  transports: ['websocket', 'polling'],
  namespace: '/servicemodernmarket', // Ajout du slash
  // SUPPRIMEZ le path ici - laissez Socket.IO gérer le chemin par défaut
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;

  private userSockets: Map<string, string> = new Map();
  private socketUsers: Map<string, string> = new Map();

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id} from ${client.handshake.headers.origin}`);

    // Récupérer userId depuis query parameters
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      console.warn(`Client ${client.id} attempted connection without userId`);
      client.disconnect();
      return;
    }

    if (!this.isValidUUID(userId)) {
      console.warn(`Client ${client.id} provided invalid UUID: ${userId}`);
      client.disconnect();
      return;
    }

    // Enregistrer l'utilisateur
    this.registerUser(userId, client.id);

    console.log(`User ${userId} registered with socket ${client.id}`);

    // Accusé de réception
    client.emit('connected', {
      success: true,
      message: 'Successfully connected to notification service',
      userId
    });

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

  private registerUser(userId: string, socketId: string) {
    this.userSockets.set(userId, socketId);
    this.socketUsers.set(socketId, userId);
  }

  private unregisterUser(userId: string, socketId: string) {
    this.userSockets.delete(userId);
    this.socketUsers.delete(socketId);
  }

  private setupEventListeners(client: Socket) {
    client.on('subscribeToNotifications', (data: { userId: string }) => {
      console.log(`User ${data.userId} subscribed to notifications`);
      client.emit('subscribed', { success: true, userId: data.userId });
    });

    client.on('ping', () => {
      client.emit('pong', { timestamp: new Date().toISOString() });
    });
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

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

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}