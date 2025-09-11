import { Module } from '@nestjs/common';
import { DistributionZoneService } from './distribution_zone.service';
import { DistributionZoneController } from './distribution_zone.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionZone } from './entities/distribution_zone.entity';
import { ZoneModule } from 'src/zone/zone.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DistributionZone]),
    ZoneModule,
  ],
  controllers: [DistributionZoneController],
  providers: [DistributionZoneService],
})
export class DistributionZoneModule {}
