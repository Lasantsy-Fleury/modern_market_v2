import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreatePresenceDto {
  @ApiProperty()
  @IsUUID()
  commercantId: string;

  @ApiProperty()
  @IsUUID()
  zoneId: string;

  @ApiPropertyOptional({ description: 'Emplacement réel observé' })
  @IsOptional()
  @IsUUID()
  localId?: string;

  @ApiProperty({ enum: ['GPS', 'MANUEL', 'SCAN'] })
  @IsIn(['GPS', 'MANUEL', 'SCAN'])
  source: 'GPS' | 'MANUEL' | 'SCAN';

  @ApiPropertyOptional({ description: 'Date de présence (défaut : aujourd\'hui)' })
  @IsOptional()
  @IsDateString()
  datePresence?: string;

  @ApiPropertyOptional({ description: 'Latitude GPS — null si indisponible' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude GPS — null si indisponible' })
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
}
