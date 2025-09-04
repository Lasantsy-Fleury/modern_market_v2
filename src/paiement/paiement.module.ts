import { Module } from '@nestjs/common';
import { PaiementService } from './paiement.service';
import { PaiementController } from './paiement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { Location } from 'src/location/entities/location.entity';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';
import { PaiementLocationService } from 'src/paiement_location/paiement_location.service';

@Module({
  imports: [TypeOrmModule.forFeature([Paiement,Location,Paiementlocation])],
  controllers: [PaiementController],
  providers: [PaiementService,PaiementLocationService],
})
export class PaiementModule {}
