import { ApiProperty } from "@nestjs/swagger";

export class CreatePaiementDto {
    @ApiProperty({ maxLength: 25 })
    reference: string;

    @ApiProperty({ maxLength: 25 })
    status: string;

    @ApiProperty({ maxLength: 25 })
    raison: string;

    @ApiProperty()
    paiementId: number;
}
