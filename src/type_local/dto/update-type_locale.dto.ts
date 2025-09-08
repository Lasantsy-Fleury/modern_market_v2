import { PartialType } from '@nestjs/swagger';
import { CreateTypeLocalDto } from './create-type_locale.dto';

export class UpdateTypeLocalDto extends PartialType(CreateTypeLocalDto) {}
