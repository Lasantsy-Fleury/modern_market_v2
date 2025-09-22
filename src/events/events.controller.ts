import { Controller, Get, Post, Body } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Events') // 👈 Catégorie visible dans Swagger
@Controller('events')
export class EventsController {
  constructor(private readonly eventsGateway: EventsGateway) {}

//   @Get('ping')
//   @ApiOperation({ summary: 'Tester la connexion REST' })
//   @ApiResponse({ status: 200, description: 'Retourne pong' })
//   ping() {
//     return { message: 'pong depuis REST' };
//   }

  @Post('notify')
  @ApiOperation({ summary: 'Notifier tous les clients WebSocket' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Hello frontend!' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Notification envoyée' })
  notifyAll(@Body() body: { message: string }) {
    this.eventsGateway.server.emit('notification', body.message);
    return { status: 'ok', sent: body.message };
  }
}
