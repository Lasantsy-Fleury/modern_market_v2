import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TypeEnum } from '../enum/type.enum';

export class CreateTypeLocalDto {
  @ApiProperty({ 
    description: 'Nom du type de local',
    enum : TypeEnum,
    default : TypeEnum.Marquage
  })
  @IsEnum(TypeEnum)
  typeLoc?: TypeEnum;

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