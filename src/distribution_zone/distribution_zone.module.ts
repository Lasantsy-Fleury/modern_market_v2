import { Module } from '@nestjs/common';
import { DistributionZoneService } from './distribution_zone.service';
import { DistributionZoneController } from './distribution_zone.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionZone } from './entities/distribution_zone.entity';
import { ZoneModule } from 'src/zone/zone.module';
import { Zone } from 'luxon';

@Module({
  imports: [
    TypeOrmModule.forFeature([DistributionZone , Zone]),
    ZoneModule,
   
  ],
  controllers: [DistributionZoneController],
  providers: [DistributionZoneService],
})
export class DistributionZoneModule {}
