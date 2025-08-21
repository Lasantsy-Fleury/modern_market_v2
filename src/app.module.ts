import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DistributionZoneModule } from './distribution_zone/distribution_zone.module';
import { ZoneModule } from './zone/zone.module';
import * as Joi from 'joi';
import { DistributionTicketModule } from './distribution_ticket/distribution_ticket.module';
import { DatabaseModule } from './Database/database.module';
@Module({
  imports: [
        ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        PORT: Joi.number(),
      })
    }),
    DatabaseModule,
    ZoneModule,
    DistributionTicketModule,
    DistributionZoneModule
   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
