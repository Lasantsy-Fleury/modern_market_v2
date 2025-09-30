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
import { IsInt, Min, Max } from 'class-validator';

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
    example: { id_location: "00b70203-4c6d-4c92-bce0-de7f2df4e0df", localId: "00b70203-4c6d-4c92-bce0-de7f2df4e0df" },
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
    description: "Jour du mois où le contribuable doit payer (1 à 31)",
    example: 20,
  })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsNotEmpty()
  dateNormalPaie: number;

  @ApiProperty({
    description: "Données contextuelles liées au rappel",
    example: { id_location: "", montant: "", description: "Rappel de paiement" },
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
export class CreateHistoriqueDto {
  @ApiProperty({
    description: "ID de l'utilisateur concerné",
    example: "00b70203-4c6d-4c92-bce0-de7f2df4e0df",
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: "Données liées à l’historique (flexibles, objet JSON)",
    example: { id_local: "abc123", resultat: "Contrôle effectué" },
  })
  @IsNotEmpty()
  @IsObject()
  data: any;

  @ApiProperty({
    description: "Priorité de l’historique",
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    example: 'HIGH',
  })
  @IsNotEmpty()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export class GetMunicipalityNotificationsDto {

  @ApiProperty({
    description: "municipality Id ",
    required: false,
  })
  @IsOptional()
  municipalityId?: string;

  @ApiProperty({
    description: "L' id de l utilisateur concerne par les notifications",
    required: false,
  })
  @IsOptional()
  userId?: string;

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

  @ApiProperty({
    description: "Filtrer par type",
    example: "HISTORIQUE CONTROLLEUR",
    required: false,
  })
  @IsOptional()
  type?: string;

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

  @ApiProperty({
    description: "Notification created apres cette date",
    required: false,
  })
  @IsOptional()
  dateFrom?: string;

  @ApiProperty({
    description: "Notification created avant cette date",
    required: false,
  })
  @IsOptional()
  dateTo?: string;
}

