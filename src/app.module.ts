import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ZoneModule } from './zone/zone.module';
import * as Joi from 'joi';
import { DatabaseModule } from './Database/database.module';
import { LocalModule } from './local/local.module';
import { LocationModule } from './location/location.module';
import { PaiementModule } from './paiement/paiement.module';
import { PaiementLocationModule } from './paiement_location/paiement_location.module';
import { NotificationModule } from './notification/notification.module';
import { DistributionZoneModule } from './distribution_zone/distribution_zone.module';
import { TypeLocalModule } from './type_local/type_locale.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SocketModule } from './socket/socket.module';
import { SigrnfModule } from './sigrnf/sigrnf.module';
import { CommercantModule } from './commercant/commercant.module';
import { DroitsModule } from './droits/droits.module';
import { TerrainModule } from './terrain/terrain.module';
import { PerceptionModule } from './perception/perception.module';
import { QuittanceModule } from './quittance/quittance.module';
import { SuiviModule } from './suivi/suivi.module';



@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        PORT: Joi.number(),
        // --- Configuration SIGRNF (intégration désactivée par défaut) ---
        SIGRNF_ENABLED: Joi.boolean().default(false),
        SIGRNF_BASE_URL: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .allow('')
          .default(''),
        SIGRNF_API_KEY: Joi.string().allow('').default(''),
        SIGRNF_TIMEOUT_MS: Joi.number().integer().min(0).default(10000),
        SIGRNF_RETRY_ATTEMPTS: Joi.number().integer().min(1).default(3),
      })
    }),
    DatabaseModule,
    ZoneModule,
    LocalModule,
    LocationModule,
    PaiementModule,
    PaiementLocationModule,
    NotificationModule,
    TypeLocalModule,
    DistributionZoneModule,
    SocketModule,
    SigrnfModule,
    CommercantModule,
    DroitsModule,
    TerrainModule,
    PerceptionModule,
    QuittanceModule,
    SuiviModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
