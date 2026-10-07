import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePeriodiciteDto {
  @ApiProperty({ maxLength: 20, example: 'MENSUELLE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ maxLength: 100, example: 'Mensuelle' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  libelle: string;

  @ApiProperty({ enum: ['JOUR', 'SEMAINE', 'MOIS', 'ANNEE'] })
  @IsIn(['JOUR', 'SEMAINE', 'MOIS', 'ANNEE'])
  unite: 'JOUR' | 'SEMAINE' | 'MOIS' | 'ANNEE';

  @ApiProperty({ minimum: 1, example: 1 })
  @IsInt()
  @Min(1)
  nbUnites: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
