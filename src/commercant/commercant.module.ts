import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CommercantService } from './commercant.service';
import { CommercantController } from './commercant.controller';
import { Commercant } from 'src/modele_cible/entities/commercant.entity';
import { ActiviteCommerciale } from 'src/modele_cible/entities/activite_commerciale.entity';
import { Affectation } from 'src/modele_cible/entities/affectation.entity';
import { Presence } from 'src/modele_cible/entities/presence.entity';
import { Redevance } from 'src/modele_cible/entities/redevance.entity';
import { Quittance } from 'src/modele_cible/entities/quittance.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { AuditLog } from 'src/modele_cible/entities/audit_log.entity';
import { Location } from 'src/location/entities/location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Commercant,
      ActiviteCommerciale,
      Affectation,
      Presence,
      Redevance,
      Quittance,
      Paiement,
      AuditLog,
      Location,
    ]),
    HttpModule.register({ timeout: 5000, maxRedirects: 5 }),
  ],
  controllers: [CommercantController],
  providers: [CommercantService],
  exports: [CommercantService],
})
export class CommercantModule {}
