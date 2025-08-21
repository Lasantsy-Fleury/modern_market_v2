import { PartialType } from '@nestjs/mapped-types';
import { CreateDistributionZoneDto } from './create-distribution_zone.dto';

export class UpdateDistributionZoneDto extends PartialType(CreateDistributionZoneDto) {}
