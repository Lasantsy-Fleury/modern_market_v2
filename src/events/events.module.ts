// events.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service'; // 🔥 Nouveau

@Module({
  providers: [EventsGateway, EventsService], // 🔥 Ajouter EventsService
  exports: [EventsService], // 🔥 Exporter pour utilisation ailleurs
})
export class EventsModule {}