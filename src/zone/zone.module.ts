import { Module } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { HttpModule } from '@nestjs/axios';
import { ZoneController } from './zone.controller';
import { Zone } from './entities/zone.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';


@Module({
  imports: [TypeOrmModule.forFeature([Zone]),
    HttpModule.register({ timeout: 5000, maxRedirects: 5 }),
  
  ],
  controllers: [ZoneController],
  providers: [ZoneService],
  exports: [ZoneService],
})
export class ZoneModule { }
