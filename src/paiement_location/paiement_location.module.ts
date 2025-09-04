import { Module } from '@nestjs/common';
import { PaiementLocationService } from './paiement_location.service';
import { PaiementLocationController } from './paiement_location.controller';
import { Paiementlocation } from './entities/paiement_location.entity';
import { Location } from 'src/location/entities/location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([Paiementlocation,Location])],
  controllers: [PaiementLocationController],
  providers: [PaiementLocationService],
})
export class PaiementLocationModule {}
