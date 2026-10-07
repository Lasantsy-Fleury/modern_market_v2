import { PartialType } from '@nestjs/swagger';
import { CreateTypeDroitDto } from './create-type-droit.dto';

export class UpdateTypeDroitDto extends PartialType(CreateTypeDroitDto) {}
