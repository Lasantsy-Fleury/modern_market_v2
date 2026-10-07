import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateTarifDto {
  @ApiProperty()
  @IsUUID()
  typeDroitId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  periodiciteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  typelocalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  marcheId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  localId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  activiteId?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  convention?: string;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montant: number;

  @ApiPropertyOptional({ maxLength: 3, example: 'MGA' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  devise?: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  dateDebut: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsDateString()
  dateFin?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
