import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RevenueEvent } from '../interfaces/revenue-event.interface';

/**
 * Représentation validable de l'événement de recette INTERNE.
 *
 * Ce DTO décrit un événement applicatif local. Il ne prétend pas correspondre
 * au modèle de données SIGRNF. Le mapping vers le payload officiel appartient
 * à l'adaptateur (SigrnfAdapter).
 */
export class RevenueEventDto implements RevenueEvent {
  @ApiProperty({
    description: "Référence locale de l'opération (ex : référence du paiement)",
    example: 'REC-2026-000145',
  })
  @IsString()
  reference: string;

  @ApiProperty({
    description: 'Montant de la recette (monnaie locale)',
    example: 100000,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Date du paiement',
    type: String,
    example: '2026-10-07T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  paymentDate: Date;

  @ApiPropertyOptional({ description: 'Type de recette (interne)' })
  @IsOptional()
  @IsString()
  revenueType?: string;

  @ApiPropertyOptional({
    description: 'Référence du redevable, si disponible localement',
  })
  @IsOptional()
  @IsString()
  taxpayerReference?: string;

  @ApiPropertyOptional({ description: 'Référence de la municipalité' })
  @IsOptional()
  @IsString()
  municipalityReference?: string;

  @ApiPropertyOptional({ description: 'Référence locale du marché' })
  @IsOptional()
  @IsString()
  marketReference?: string;

  @ApiPropertyOptional({ description: 'Référence locale de l\'emplacement' })
  @IsOptional()
  @IsString()
  placeReference?: string;

  @ApiPropertyOptional({ description: 'Référence locale du commerçant' })
  @IsOptional()
  @IsString()
  commercantReference?: string;

  @ApiPropertyOptional({ description: 'Référence locale de l\'obligation (redevance)' })
  @IsOptional()
  @IsString()
  obligationReference?: string;

  @ApiPropertyOptional({ description: 'Référence locale du paiement' })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'Référence locale de l\'agent encaisseur' })
  @IsOptional()
  @IsString()
  agentReference?: string;

  @ApiPropertyOptional({ description: 'Référence locale de la quittance' })
  @IsOptional()
  @IsString()
  receiptReference?: string;

  @ApiPropertyOptional({
    description: 'Données complémentaires internes (jamais de secrets)',
    example: { id_paiement: '550e8400-e29b-41d4-a716-446655440003' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
