import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

/**
 * Critères de résolution d'un tarif applicable. Les dimensions fournies doivent
 * correspondre exactement aux dimensions renseignées sur le tarif ; un tarif
 * inactif ou hors période de validité n'est jamais retourné.
 */
export class ResoudreTarifQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() typeDroitId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() periodiciteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() typelocalId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() zoneId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() marcheId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() localId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() activiteId?: string;
  @ApiPropertyOptional({ example: '2026-10-07' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
