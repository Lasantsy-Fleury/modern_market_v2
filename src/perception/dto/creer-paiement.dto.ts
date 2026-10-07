import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreerPaiementDto {
  @ApiProperty({ description: 'Commerçant concerné' })
  @IsUUID()
  commercantId: string;

  @ApiProperty({ description: 'Obligation concernée (redevance)' })
  @IsUUID()
  redevanceId: string;

  @ApiProperty({ minimum: 0, exclusiveMinimum: true })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  montant: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  modePaiementId?: string;

  @ApiPropertyOptional({ description: 'Agent encaisseur' })
  @IsOptional()
  @IsUUID()
  agentId?: string;

  @ApiPropertyOptional({ enum: ['BUREAU', 'TERRAIN'] })
  @IsOptional()
  @IsIn(['BUREAU', 'TERRAIN'])
  canal?: 'BUREAU' | 'TERRAIN';

  @ApiProperty({ enum: ['TERRAIN', 'BUREAU', 'API_EXTERNE', 'IMPORT_HISTORIQUE'] })
  @IsIn(['TERRAIN', 'BUREAU', 'API_EXTERNE', 'IMPORT_HISTORIQUE'])
  source: 'TERRAIN' | 'BUREAU' | 'API_EXTERNE' | 'IMPORT_HISTORIQUE';

  @ApiProperty({ description: 'Référence unique du paiement (espèces = reçu ; Mobile Money = txId)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reference: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  raison?: string;

  @ApiPropertyOptional({ description: 'Date du paiement (défaut : maintenant)' })
  @IsOptional()
  @IsDateString()
  datePaiement?: string;
}

export class UpdatePaiementDto {
  @ApiPropertyOptional({ enum: ['failed'] })
  @IsOptional()
  @IsIn(['failed'])
  status?: 'failed';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  raison?: string;
}
