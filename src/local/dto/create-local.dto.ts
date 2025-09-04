import { ApiProperty } from "@nestjs/swagger";

export class CreateLocalDto {
    @ApiProperty({maxLength : 11})
    numero: string ;

    @ApiProperty({maxLength : 10})
    zoneId: string ;

    @ApiProperty()
    tarif: number;

    @ApiProperty({enum: ['DISPONIBLE', 'LOUE', 'INDISPONIBLE'], default: 'DISPONIBLE'})
    statut: 'DISPONIBLE' | 'LOUE' | 'INDISPONIBLE';

    @ApiProperty({maxLength : 10 })
    typelocalId: number;
}
