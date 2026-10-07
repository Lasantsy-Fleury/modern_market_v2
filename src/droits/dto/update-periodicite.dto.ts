import { PartialType } from '@nestjs/swagger';
import { CreatePeriodiciteDto } from './create-periodicite.dto';

export class UpdatePeriodiciteDto extends PartialType(CreatePeriodiciteDto) {}
