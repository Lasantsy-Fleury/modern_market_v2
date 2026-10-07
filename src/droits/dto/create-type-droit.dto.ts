import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { LibelleBilingueDto } from './libelle-bilingue.dto';
import { IsObject } from 'class-validator';

class LibelleBilingueValidated extends LibelleBilingueDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  declare mg: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  declare fr: string;
}

export class CreateTypeDroitDto {
  @ApiProperty({ maxLength: 50, example: 'DROIT_MENSUEL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ type: () => LibelleBilingueValidated })
  @ValidateNested()
  @Type(() => LibelleBilingueValidated)
  libelle: LibelleBilingueValidated;

  @ApiProperty()
  @IsUUID()
  periodiciteId: string;

  @ApiProperty({ enum: ['EMPLACEMENT', 'ZONE', 'MARCHE'] })
  @IsIn(['EMPLACEMENT', 'ZONE', 'MARCHE'])
  portee: 'EMPLACEMENT' | 'ZONE' | 'MARCHE';

  @ApiPropertyOptional({ enum: ['DROIT', 'TICKET'], default: 'DROIT' })
  @IsOptional()
  @IsIn(['DROIT', 'TICKET'])
  famille?: 'DROIT' | 'TICKET';

  @ApiPropertyOptional({ description: 'Règle de paiement partiel (NULL = non définie, décision C5)' })
  @IsOptional()
  @IsBoolean()
  peutPayerPartiel?: boolean | null;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  reglesRenouvellement?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: () => LibelleBilingueValidated })
  @IsOptional()
  @ValidateNested()
  @Type(() => LibelleBilingueValidated)
  description?: LibelleBilingueValidated | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
