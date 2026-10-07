import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { SigrnfController } from './sigrnf.controller';
import { SigrnfService } from './sigrnf.service';
import { SigrnfSync } from './entities/sigrnf-sync.entity';
import { SIGRNF_ADAPTER } from './interfaces/sigrnf-adapter.interface';
import { MockSigrnfAdapter } from './adapters/mock-sigrnf.adapter';
import { HttpSigrnfAdapter } from './adapters/http-sigrnf.adapter';
import {
  SIGRNF_CONFIG,
  loadSigrnfConfig,
  isSigrnfConfigured,
} from './sigrnf.config';

/**
 * Module d'intégration SIGRNF.
 *
 * - Indépendant des modules métier existants (aucune importation vers eux).
 * - Désactivable par configuration (SIGRNF_ENABLED=false par défaut).
 * - Aucune dépendance externe supplémentaire : TypeORM, @nestjs/axios,
 *   @nestjs/schedule et Swagger sont déjà utilisés par le projet.
 *
 * Adaptateur sélectionné :
 *  - enabled && baseUrl renseigné -> HttpSigrnfAdapter (skeleton, TODO(SIGRNF))
 *  - sinon                        -> MockSigrnfAdapter (journalisation)
 */
@Module({
  imports: [TypeOrmModule.forFeature([SigrnfSync]), HttpModule],
  controllers: [SigrnfController],
  providers: [
    SigrnfService,
    {
      provide: SIGRNF_CONFIG,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        loadSigrnfConfig(configService),
    },
    {
      provide: SIGRNF_ADAPTER,
      inject: [SIGRNF_CONFIG, HttpService],
      useFactory: (
        config: ReturnType<typeof loadSigrnfConfig>,
        httpService: HttpService,
      ) => {
        if (config.enabled && isSigrnfConfigured(config)) {
          // TODO(SIGRNF): HttpSigrnfAdapter sera complété dès réception du
          // contrat officiel (endpoint, authentification, payload).
          return new HttpSigrnfAdapter(httpService, config);
        }
        return new MockSigrnfAdapter();
      },
    },
  ],
  exports: [SigrnfService],
})
export class SigrnfModule {}
