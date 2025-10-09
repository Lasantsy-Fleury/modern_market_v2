import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Location } from 'src/location/entities/location.entity';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';
import { Local } from 'src/local/entities/local.entity';
import { EventsModule } from 'src/events/events.module';
import { Zone } from 'src/zone/entities/zone.entity';
import { Typelocal } from 'src/type_local/entities/type_locale.entity';
import { LocalModule } from 'src/local/local.module';

@Module({
  imports: [
    // ✅ ajoute `Local` ici
    TypeOrmModule.forFeature([Notification, Location, Paiementlocation, Zone, Typelocal, Local]),
    HttpModule,
    EventsModule,
    forwardRef(() => LocalModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
