import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { Location } from './entities/location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';
import { Local } from 'src/local/entities/local.entity';
import { PaiementLocationModule } from 'src/paiement_location/paiement_location.module';
import { EventsModule } from 'src/events/events.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports:[TypeOrmModule.forFeature([Location,Paiementlocation,Local]),PaiementLocationModule,EventsModule,NotificationModule,
   ScheduleModule.forRoot(),
],
  controllers: [LocationController],
  providers: [LocationService],
  exports:[LocationService]
})
export class LocationModule {}
