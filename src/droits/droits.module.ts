import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DroitsService } from './droits.service';
import { PeriodiciteController } from './periodicite.controller';
import { TypeDroitController } from './type-droit.controller';
import { TarifController } from './tarif.controller';
import { ActiviteController } from './activite.controller';
import { Periodicite } from 'src/modele_cible/entities/periodicite.entity';
import { TypeDroit } from 'src/modele_cible/entities/type_droit.entity';
import { Tarif } from 'src/modele_cible/entities/tarif.entity';
import { ActiviteCommerciale } from 'src/modele_cible/entities/activite_commerciale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Periodicite, TypeDroit, Tarif, ActiviteCommerciale])],
  controllers: [PeriodiciteController, TypeDroitController, TarifController, ActiviteController],
  providers: [DroitsService],
  exports: [DroitsService],
})
export class DroitsModule {}
