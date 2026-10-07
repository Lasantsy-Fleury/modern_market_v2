import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuiviService } from './suivi.service';
import { SuiviController } from './suivi.controller';
import { Recette } from 'src/modele_cible/entities/recette.entity';
import { Redevance } from 'src/modele_cible/entities/redevance.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { Quittance } from 'src/modele_cible/entities/quittance.entity';
import { Presence } from 'src/modele_cible/entities/presence.entity';
import { Controle } from 'src/modele_cible/entities/controle.entity';
import { Commercant } from 'src/modele_cible/entities/commercant.entity';
import { Echeance } from 'src/modele_cible/entities/echeance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recette,
      Redevance,
      Paiement,
      Quittance,
      Presence,
      Controle,
      Commercant,
      Echeance,
    ]),
  ],
  controllers: [SuiviController],
  providers: [SuiviService],
  exports: [SuiviService],
})
export class SuiviModule {}
