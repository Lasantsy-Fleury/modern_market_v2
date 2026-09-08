import { PartialType } from '@nestjs/swagger';
import { CreateDistributionZoneDto } from './create-distribution_zone.dto';

export class UpdateDistributionZoneDto extends PartialType(CreateDistributionZoneDto) {}
