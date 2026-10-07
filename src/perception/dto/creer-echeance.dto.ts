import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreerEcheanceDto {
  @ApiProperty()
  @IsUUID()
  locationId: string;

  @ApiProperty()
  @IsUUID()
  commercantId: string;

  @ApiProperty()
  @IsUUID()
  typeDroitId: string;

  @ApiProperty({ example: '2026-10-01' })
  @IsDateString()
  periodeDebut: string;

  @ApiProperty({ example: '2026-10-31' })
  @IsDateString()
  periodeFin: string;

  @ApiProperty({ example: '2026-10-05' })
  @IsDateString()
  dateEcheance: string;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montantTheorique: number;

  @ApiProperty({ example: 'PLANIFIEE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  statut: string;

  @ApiProperty({ example: 'MANUEL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  source: string;
}
