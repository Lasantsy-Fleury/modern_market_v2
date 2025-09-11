import { IsUUID, IsString, IsEnum, IsBoolean, IsOptional, IsObject, IsDate, IsIn, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

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
  type: string;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string = 'MEDIUM';

  @IsOptional()
  @IsObject()
  channels?: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;
}
