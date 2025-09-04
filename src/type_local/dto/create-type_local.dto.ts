import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTypeLocalDto {
  @ApiProperty({ description: 'Nom du type de local' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Tarif du type de local' })
  tarif: number;

  @ApiProperty({ description: 'Description du type de local' })
  @IsString()
  description: string;
}
