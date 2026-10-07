import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class SuiviFiltresDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() communeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() marcheId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() zoneId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() typeDroitId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() periodiciteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() agentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() modePaiementId?: string;
  @ApiPropertyOptional({ example: '2026-01-01' }) @IsOptional() @IsDateString() dateDebut?: string;
  @ApiPropertyOptional({ example: '2026-12-31' }) @IsOptional() @IsDateString() dateFin?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
