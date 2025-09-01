import { PartialType } from '@nestjs/swagger';
import { CreateTypeLocalDto } from './create-type_local.dto';

export class UpdateTypeLocalDto extends PartialType(CreateTypeLocalDto) {}
