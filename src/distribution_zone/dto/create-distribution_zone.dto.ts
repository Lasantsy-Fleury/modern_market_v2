import { ApiProperty } from "@nestjs/swagger";

export class CreateDistributionZoneDto {
    @ApiProperty({description: 'Identifiant unique d\'utilisateur'})
    id_user: string;

    @ApiProperty({ description: 'Identifiant unique de la zone' })
    zoneId: string;

    @ApiProperty({ description: 'Identifiant de la municipalité', type: Number })
    municipalityId: number;
}
