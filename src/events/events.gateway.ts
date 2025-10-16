// events.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
  transports: ['websocket', 'polling'],
  namespace: '/servicemodernmarket', // ✅ Namespace unique pour votre service
  path: '/servicemodernmarket/socket.io', // ✅ Path unique pour éviter les conflits
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map();
  private socketUsers: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`[ModernMarket] Client connected: ${client.id}`);

    const userId = client.handshake.query.userId as string;

    if (!userId) {
      console.warn(`[ModernMarket] Client ${client.id} attempted connection without userId`);
      client.disconnect();
      return;
    }

    if (!this.isValidUUID(userId)) {
      console.warn(`[ModernMarket] Client ${client.id} provided invalid UUID: ${userId}`);
      client.disconnect();
      return;
    }

    this.registerUser(userId, client.id);
    console.log(`[ModernMarket] User ${userId} registered with socket ${client.id}`);

    client.emit('connected', {
      success: true,
      message: 'Successfully connected to ModernMarket notification service',
      userId,
      service: 'modernmarket'
    });

    this.setupEventListeners(client);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);

    if (userId) {
      this.unregisterUser(userId, client.id);
      console.log(`[ModernMarket] User ${userId} disconnected (socket: ${client.id})`);
    } else {
      console.log(`[ModernMarket] Unknown client disconnected: ${client.id}`);
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
      console.log(`[ModernMarket] User ${data.userId} subscribed to notifications`);
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
      console.log(`[ModernMarket] Event "${event}" sent to user ${userId}`);
      return true;
    } else {
      console.log(`[ModernMarket] User ${userId} not connected`);
      return false;
    }
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
    console.log(`[ModernMarket] Event "${event}" broadcasted`);
  }

  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}