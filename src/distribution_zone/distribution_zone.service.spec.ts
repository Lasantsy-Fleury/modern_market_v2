import { Module } from '@nestjs/common';
import { DistributionZoneService } from './distribution_zone.service';
import { DistributionZoneController } from './distribution_zone.controller';
import { DistributionZone } from './entities/distribution_zone.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zone } from 'src/zone/entities/zone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DistributionZone,Zone])],
  controllers: [DistributionZoneController],
  providers: [DistributionZoneService],
})
export class DistributionZoneModule {}
