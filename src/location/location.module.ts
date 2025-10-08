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
import { LocalService } from 'src/local/local.service';
import { Zone } from 'src/zone/entities/zone.entity';
import { Typelocal } from 'src/type_local/entities/type_locale.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Location,
      Local,
      Paiementlocation,
      Zone,
      Typelocal,
      DistributionZone, // ⚡ Ajout du repository manquant
    ]),
    forwardRef(() => PaiementLocationModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => EventsModule),
    ScheduleModule.forRoot(),
    HttpModule
  ],
  controllers: [LocationController],
  providers: [LocationService,LocalService],
  exports: [LocationService],
})
export class LocationModule {}
