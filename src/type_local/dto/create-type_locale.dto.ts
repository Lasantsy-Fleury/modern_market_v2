import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateTypeLocalDto {
  @ApiProperty({
    description: 'Nom du type de local traduit',
    example: { mg: "Langara", fr: "Hangar" }
  })
  @IsObject()
  typeLoc: { mg: string; fr: string };

  @ApiProperty({ description: 'Municipalité id' })
  @IsNumber()
  municipalityId: number;

  @ApiProperty({
    description: 'Description traduite du type de local',
    example: { mg: "Famaritana amin’ny teny Malagasy", fr: "Description en français" }
  })
  @IsObject()
  description: { mg: string; fr: string };

  @ApiProperty({ description: 'Tarif du type de local' })
  @IsNumber()
  tarif: number;

  @ApiProperty({ description: 'Type du contrat ' })
  @IsOptional()
  @IsString()
  type_contrat: string;
}