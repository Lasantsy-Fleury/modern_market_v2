import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerrainService } from './terrain.service';
import { PresenceController } from './presence.controller';
import { ControleController } from './controle.controller';
import { Presence } from 'src/modele_cible/entities/presence.entity';
import { Controle } from 'src/modele_cible/entities/controle.entity';
import { Commercant } from 'src/modele_cible/entities/commercant.entity';
import { Zone } from 'src/zone/entities/zone.entity';
import { Local } from 'src/local/entities/local.entity';
import { Agent } from 'src/modele_cible/entities/agent.entity';
import { Parametre } from 'src/modele_cible/entities/parametre.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Presence, Controle, Commercant, Zone, Local, Agent, Parametre]),
  ],
  controllers: [PresenceController, ControleController],
  providers: [TerrainService],
  exports: [TerrainService],
})
export class TerrainModule {}
