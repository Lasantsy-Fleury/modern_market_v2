import { ApiProperty } from "@nestjs/swagger";

export class CreateDistributionZoneDto {
    @ApiProperty({ maxLength: 20 })
    id_user: string;

    @ApiProperty({ maxLength: 20 })
    zoneId: string;

    @ApiProperty({ type: Number })
    municipalityId: number;
}
