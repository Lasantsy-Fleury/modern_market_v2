import { Module } from '@nestjs/common';
import { PaiementLocationService } from './paiement_location.service';
import { PaiementLocationController } from './paiement_location.controller';

@Module({
  controllers: [PaiementLocationController],
  providers: [PaiementLocationService],
})
export class PaiementLocationModule {}
