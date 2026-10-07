import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerceptionService } from './perception.service';
import { PerceptionController } from './perception.controller';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { Redevance } from 'src/modele_cible/entities/redevance.entity';
import { Echeance } from 'src/modele_cible/entities/echeance.entity';
import { PaiementRedevance } from 'src/modele_cible/entities/paiement_redevance.entity';
import { Recette } from 'src/modele_cible/entities/recette.entity';
import { Quittance } from 'src/modele_cible/entities/quittance.entity';
import { ModePaiement } from 'src/modele_cible/entities/mode_paiement.entity';
import { Commercant } from 'src/modele_cible/entities/commercant.entity';
import { TypeDroit } from 'src/modele_cible/entities/type_droit.entity';
import { Parametre } from 'src/modele_cible/entities/parametre.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Paiement,
      Redevance,
      Echeance,
      PaiementRedevance,
      Recette,
      Quittance,
      ModePaiement,
      Commercant,
      TypeDroit,
      Parametre,
    ]),
  ],
  controllers: [PerceptionController],
  providers: [PerceptionService],
  exports: [PerceptionService],
})
export class PerceptionModule {}
