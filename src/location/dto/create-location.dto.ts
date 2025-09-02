import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, IsDateString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ description: 'ID unique de la location (UUID)' })
  @IsUUID()
  id_location: string;  // tu peux le générer côté service si nécessaire

  @ApiProperty({ description: 'Tarif de la location' })
  @IsNumber()
  tarif: number;

  @ApiProperty({ description: 'Périodicité de la location, ex: mensuel, annuel' })
  @IsString()
  periodicite: string;

  @ApiProperty({ description: 'ID de l’utilisateur qui loue' })
  @IsString()
  id_user: string;

  @ApiProperty({ description: 'NIF du locataire' })
  @IsString()
  nif: string;

  @ApiProperty({ description: 'Date de début de la location (YYYY-MM-DD)' })
  @IsDateString()
  date_debut_loc: Date;

  @ApiProperty({ description: 'Date de fin de la location (YYYY-MM-DD)' })
  @IsDateString()
  date_fin_loc: Date;

  @ApiProperty({ description: 'Fréquence de paiement ou autre info numérique' })
  @IsNumber()
  frequence: number;

  @ApiProperty({ description: 'ID du local associé (UUID)' })
  @IsUUID()
  localId: string;
}
