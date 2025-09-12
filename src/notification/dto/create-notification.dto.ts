import {
  IsUUID,
  IsString,
  IsBoolean,
  IsOptional,
  IsObject,
  IsDate,
  IsIn,
  MaxLength,
  IsEnum,
  IsNotEmpty,
  IsDateString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// --------------------
// ENUMS
// --------------------
export enum LocationNotificationType {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

export enum PaymentNotificationType {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

class ChannelsDto {
  @ApiProperty({ example: true, description: 'Notification via application interne' })
  @IsBoolean()
  inApp: boolean;

  @ApiProperty({ example: false, description: 'Notification par email' })
  @IsBoolean()
  email: boolean;

  @ApiProperty({ example: false, description: 'Notification par SMS' })
  @IsBoolean()
  sms: boolean;

  @ApiProperty({ example: true, description: 'Notification push' })
  @IsBoolean()
  push: boolean;
}
// --------------------
// DTOs
// --------------------

// Location
export class CreateLocationNotificationDto {
  @ApiProperty({
    description: "Identifiant de l'utilisateur concerné",
    example: 'c1f3a730-75aa-4f4f-bb09-1e62b6e333fb',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  
  @ApiProperty({
    description: "Type de notification de location : CONFIRMED | CANCELLED | PENDING",
    enum: LocationNotificationType,
    example: LocationNotificationType.CONFIRMED,
  })
  @IsEnum(LocationNotificationType)
  type: LocationNotificationType;

  @ApiProperty({
    description: "Données contextuelles liées à la location",
    example: { id_location: "00b70203-4c6d-4c92-bce0-de7f2df4e0df",localId:"00b70203-4c6d-4c92-bce0-de7f2df4e0df"},
  })
  @IsNotEmpty()
  @IsObject()
  data: any;



}

// Payment
export class CreatePaymentNotificationDto {
  @ApiProperty({
    description: "Identifiant de l'utilisateur concerné",
    example: 'c1f3a730-75aa-4f4f-bb09-1e62b6e333fb',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Type de notification de paiement:SUCCESS|FAILED|PENDING",
    enum: PaymentNotificationType,
    example: PaymentNotificationType.SUCCESS,
  })
  @IsEnum(PaymentNotificationType)
  type: PaymentNotificationType;

  @ApiProperty({
    description: "Données contextuelles liées au paiement",
    example: { id_paiement: "789", montant: 150000, },
  })
  @IsNotEmpty()
  @IsObject()
  data: any;

  @ApiProperty({
    type: ChannelsDto,
    description: 'Canaux de diffusion de la notification',
    default: { inApp: true, email: false, sms: false, push: false },
  })
  @ValidateNested()
  @Type(() => ChannelsDto)
  channels: ChannelsDto;
}

// Reminder
export class CreateReminderNotificationDto {
  @ApiProperty({
    description: "Identifiant de l'utilisateur concerné",
    example: 'c1f3a730-75aa-4f4f-bb09-1e62b6e333fb',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Date et heure programmée de l'envoi de la notification",
    example: '2025-09-20T10:00:00.000Z',
  })
  @IsDateString()
  scheduledAt: Date;

  @ApiProperty({
    description: "Données contextuelles liées au rappel",
    example: { id_event: "E123", description: "Rappel de paiement" },
  })
  @IsNotEmpty()
  @IsObject()
  data: any;

  @ApiProperty({
    type: ChannelsDto,
    description: 'Canaux de diffusion de la notification',
    default: { inApp: true, email: false, sms: false, push: false },
  })
  @ValidateNested()
  @Type(() => ChannelsDto)
  channels: ChannelsDto;
}

// Marquer comme lu
export class MarkAsReadDto {
  @ApiProperty({
    description: "Identifiant de l'utilisateur qui lit la notification",
    example: 'c1f3a730-75aa-4f4f-bb09-1e62b6e333fb',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

// Filtres (GET notifications)
export class GetUserNotificationsDto {
  @ApiProperty({
    description: "Page de résultats (pagination)",
    example: 1,
    required: false,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: "Nombre de résultats par page (pagination)",
    example: 20,
    required: false,
  })
  @IsOptional()
  limit?: number;

  // @ApiProperty({
  //   description: "Catégorie de notifications à filtrer",
  //   example: "PAIEMENT",
  //   required: false,
  // })
  // @IsOptional()
  // category?: string;

  @ApiProperty({
    description: "Filtrer uniquement les notifications lues ou non lues",
    example: false,
    required: false,
  })
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({
    description: "Filtrer par priorité",
    example: "HIGH",
    required: false,
  })
  @IsOptional()
  priority?: string;
}

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
