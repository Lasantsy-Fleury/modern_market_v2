import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QueryCommercantDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Recherche plein texte sur NIF / identifiant' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: "Filtrer par type d'activité" })
  @IsOptional()
  @IsUUID()
  activiteId?: string;

  @ApiPropertyOptional({ description: 'Filtrer sur l\'état de la fiche' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  actif?: boolean;

  @ApiPropertyOptional({ description: 'Filtrer par marché (via emplacements)' })
  @IsOptional()
  @IsUUID()
  marcheId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par zone (via emplacements)' })
  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par type de local (via emplacements)' })
  @IsOptional()
  @IsUUID()
  typelocalId?: string;

  @ApiPropertyOptional({ enum: ['JOURNALIER', 'MENSUEL'] })
  @IsOptional()
  @IsIn(['JOURNALIER', 'MENSUEL'])
  periodicite?: 'JOURNALIER' | 'MENSUEL';
}
