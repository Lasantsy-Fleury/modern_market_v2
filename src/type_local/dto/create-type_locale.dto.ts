import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsObject, IsIn, IsEnum } from 'class-validator';

export class CreateTypeLocalDto {
  @ApiProperty({
    description: 'Nom du type de local traduit',
    example: { mg: "Langara", fr: "Hangar" }
  })
  @IsObject()
  typeLoc: { mg: string; fr: string };

  @ApiProperty({ description: 'Municipalité id' })
  @IsNumber()
  municipalityId: string;

  @ApiProperty({
    description: 'Description traduite du type de local',
    example: { mg: "Famaritana amin’ny teny Malagasy", fr: "Description en français" }
  })
  @IsObject()
  description: { mg: string; fr: string };


  @ApiProperty({
    description: 'Type du contrat',
    enum: ['JOURNALIER', 'ANNUEL'],
    example: 'ANNUEL ou JOURNALIER',
  })
  @IsOptional()
  @IsEnum(['JOURNALIER', 'ANNUEL'])
  type_contrat: 'JOURNALIER' | 'ANNUEL';

  @ApiProperty({ description: 'Longueur du local' })
  @IsNumber()
  longueur: number;

  @ApiProperty({ description: 'Largeur du local' })
  @IsNumber()
  largeur: number;

  @ApiProperty({ description: 'Tarif du local' })
  @IsNumber()
  tarif: number;
}
