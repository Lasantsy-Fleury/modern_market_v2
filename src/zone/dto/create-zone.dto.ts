import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateZoneDto {
  @ApiProperty({ description: 'Nom de la zone' })
  @IsString()
  nom: string;

  // @ApiProperty({ description: 'Statut de la zone (true = actif, false= inactif)' })
  // @IsBoolean()
  // status: boolean;

  @ApiProperty({ description: 'ID de la municipalité' })
  @IsNumber()
  municipality_id: number;

  // @ApiProperty({ description: 'ID de la municipalité' })
  // @IsNumber()
  // zoneId: number;
}
