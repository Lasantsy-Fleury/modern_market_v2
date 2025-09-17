import { IsUUID, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaiementLocationDto {
  @ApiProperty({
    description: "L'ID de la location associée au paiement.",
    example: "8a94b59c-8f43-4a1b-9d7a-1e649d27a1b3",
  })
  @IsUUID()
  locationId: string;


  @IsUUID()
  paiementId: string;

  @ApiProperty({
    description: "Le nombre de loyers payés pour cette location.",
    example: 1,
  })
  @IsNumber()
  nombre_paye: number;

  @IsNotEmpty()
  @IsNumber()
  montant_paye: number; // Ajoutez cette ligne pour le montant payé
}