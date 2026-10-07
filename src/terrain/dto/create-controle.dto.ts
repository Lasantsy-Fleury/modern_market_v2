import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateControleDto {
  @ApiProperty({ description: 'Agent réalisant le contrôle' })
  @IsUUID()
  agentId: string;

  @ApiProperty()
  @IsUUID()
  zoneId: string;

  @ApiPropertyOptional({ description: 'Emplacement ATTENDU du commerçant (localId)' })
  @IsOptional()
  @IsUUID()
  localId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  commercantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  presenceId?: string;

  @ApiPropertyOptional({ description: 'Date/heure du contrôle (défaut : maintenant)' })
  @IsOptional()
  @IsDateString()
  dateControle?: string;

  @ApiPropertyOptional({ description: 'Latitude GPS mesurée' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude GPS mesurée' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Précision GPS en mètres si disponible' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precisionGps?: number;

  @ApiPropertyOptional({
    description: 'La comparaison position réelle / emplacement attendu est-elle autorisée par la règle de contrôle ?',
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  comparerPosition?: boolean;

  @ApiPropertyOptional({ description: 'Rayon de conformité en mètres (défaut configurable)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rayonMetres?: number;

  @ApiPropertyOptional({ description: 'Seuil de précision GPS acceptable en mètres (défaut configurable)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  seuilPrecisionMetres?: number;

  @ApiPropertyOptional({ description: 'Code d\'anomalie (libre/configurable)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  typeAnomalie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;
}

export class UpdateControleDto {
  @ApiPropertyOptional({ enum: ['OUVERT', 'CLOTURE'] })
  @IsOptional()
  @IsIn(['OUVERT', 'CLOTURE'])
  statut?: 'OUVERT' | 'CLOTURE';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  typeAnomalie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({ enum: ['CONFORME', 'ANOMALIE', 'HORS_ZONE', 'GPS_INDISPONIBLE', 'FAIBLE_PRECISION', 'SANS_EMPLACEMENT_FIXE', 'CONTROLE_MANUEL'] })
  @IsOptional()
  @IsIn(['CONFORME', 'ANOMALIE', 'HORS_ZONE', 'GPS_INDISPONIBLE', 'FAIBLE_PRECISION', 'SANS_EMPLACEMENT_FIXE', 'CONTROLE_MANUEL'])
  resultat?: string;
}
