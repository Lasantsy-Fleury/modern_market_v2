import { ApiProperty } from "@nestjs/swagger";

export class CreateDistributionZoneDto {
    @ApiProperty({ maxLength: 20})
    id_controlleur : string

    @ApiProperty({ maxLength: 20})
    zoneId: string; 
}
