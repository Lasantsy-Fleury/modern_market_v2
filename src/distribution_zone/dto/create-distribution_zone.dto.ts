import { ApiProperty } from "@nestjs/swagger";

export class CreateDistributionZoneDto {
    @ApiProperty({description: 'Identifiant unique d\'utilisateur'})
    id_user: string;

    @ApiProperty({ description: 'Identifiant unique de la zone' })
    zoneId: string;

    @ApiProperty({ description: 'Statut de la zone de distribution', default: true })
    status?: boolean; // Optionnel, par défaut true

    @ApiProperty({ description: 'Date de création'})
    createdAt?: Date;

    @ApiProperty({ description: 'Date de mise à jour'})
    updatedAt?: Date;
}
