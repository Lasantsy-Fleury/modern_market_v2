import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { Location } from './entities/location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Location,Paiementlocation])],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
