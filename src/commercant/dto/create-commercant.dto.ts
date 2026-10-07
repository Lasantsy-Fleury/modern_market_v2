import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCommercantDto {
  @ApiPropertyOptional({ description: "Identifiant de l'utilisateur externe (serviceauth)" })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'NIF fiscal (jamais unique — décision C4)', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  nif?: string;

  @ApiPropertyOptional({ description: "Identifiant de l'activité commerciale principale" })
  @IsOptional()
  @IsUUID()
  activiteId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
