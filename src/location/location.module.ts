import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { Location } from './entities/location.entity';
import { Local } from 'src/local/entities/local.entity';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';
import { DistributionZone } from 'src/distribution_zone/entities/distribution_zone.entity';
import { PaiementLocationModule } from 'src/paiement_location/paiement_location.module';
import { NotificationModule } from 'src/notification/notification.module';
import { EventsModule } from 'src/events/events.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Location,
      Local,
      Paiementlocation,
      DistributionZone, // ⚡ Ajout du repository manquant
    ]),
    forwardRef(() => PaiementLocationModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => EventsModule),
    ScheduleModule.forRoot(),
    HttpModule
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
