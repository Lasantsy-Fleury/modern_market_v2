// events.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service'; // 🔥 Nouveau
import { EventsController } from './events.controller';

@Module({
  providers: [EventsGateway, EventsService], // 🔥 Ajouter EventsService
  exports: [EventsService], // 🔥 Exporter pour utilisation ailleurs
  controllers: [EventsController],
})
export class EventsModule {}