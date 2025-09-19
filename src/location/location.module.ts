import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { Location } from './entities/location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';
import { Local } from 'src/local/entities/local.entity';
import { PaiementLocationModule } from 'src/paiement_location/paiement_location.module';

@Module({
  imports:[TypeOrmModule.forFeature([Location,Paiementlocation,Local]),PaiementLocationModule],
  controllers: [LocationController],
  providers: [LocationService],
  exports:[LocationService]
})
export class LocationModule {}
