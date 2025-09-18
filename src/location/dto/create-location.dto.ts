import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, IsDateString, IsEnum,  } from 'class-validator';


export enum Periodicite {
  JOURNALIER = 'JOURNALIER',
  MENSUEL = 'MENSUEL',
}

export class CreateLocationDto {

  @ApiProperty({ description: 'ID de l’utilisateur qui loue' })
  @IsString()
  id_user: string;

  @ApiProperty({ description: 'NIF du locataire' })
  @IsString()
  nif: string;

  @ApiProperty({ description: 'ID du local associé (UUID)' })
  @IsUUID()
  localId: string;

  @ApiProperty({ description: 'Usage de la location' })
  @IsString()
  usage: string;


  @ApiProperty({
    description: 'Périodicité de la location',
    enum: Periodicite,
    example: Periodicite.MENSUEL
  })
  @IsEnum(Periodicite, { message: 'La périodicité doit être soit JOURNALIER soit MENSUEL' })
  periodicite: Periodicite;



  @ApiProperty({ description: 'Date de début de la location' })
  @IsDateString()
  date_debut_loc: Date;
  date_fin_loc: string | number | Date;

  // @ApiProperty({ description: 'Date de fin de la location' })
  // @IsDateString()
  // date_fin_loc: Date;

  // @ApiProperty({ description: 'Fréquence de paiement ou autre info numérique' })
  // @IsNumber()
  // frequence: number;


}
