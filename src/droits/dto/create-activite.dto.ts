import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class LibelleAct {
  @ApiProperty() @IsString() @IsNotEmpty() mg: string;
  @ApiProperty() @IsString() @IsNotEmpty() fr: string;
}

export class CreateActiviteDto {
  @ApiProperty({ maxLength: 50, example: 'EPICERIE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ type: () => LibelleAct })
  @ValidateNested()
  @Type(() => LibelleAct)
  libelle: LibelleAct;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
