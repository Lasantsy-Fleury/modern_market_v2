import { IsOptional, IsUUID, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterNotificationDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum([
    'LOCATION CONFIRMEE',
    'LOCATION ANNULEE',
    'PAIEMENT REUSSIE',
    'PAIEMENT NON REUSSIE',
    'PAIEMENT EN ATTENTE',
    'RAPPELLE DE PAIEMENT',
    'RAPPELLE D EVENEMENT',
    'STATUT MIS A JOUR',
    'SYSTEM_MAINTENANCE',
  ])
  type?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}
