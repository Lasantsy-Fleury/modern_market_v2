import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTypeLocalDto {
  @ApiProperty({description: 'Municipalité id'})
  @IsNumber()
  municipalityId: number;

  @ApiProperty({description: 'Nom du type de local'})
  typeLoc: string;

  @ApiProperty({ description: 'Tarif du type de local' })
  @IsNumber()
  tarif: number;

  @ApiProperty({ description: 'Description du type de local' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type du contrat '})
  @IsOptional()
  @IsString()
  type_contrat : string ; 
}