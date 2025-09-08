import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsString, Length, IsInt } from "class-validator";


export class CreateLocalDto {
    @ApiProperty({ maxLength: 11 })
    @IsString()
    numero: string;

    @ApiProperty({ maxLength: 10 })
    @IsUUID()

    zoneId: string;


    // @ApiProperty({enum: ['DISPONIBLE', 'LOUE', 'INDISPONIBLE'], default: 'DISPONIBLE'})
    // statut: 'DISPONIBLE' | 'LOUE' | 'INDISPONIBLE';

    @ApiProperty({ maxLength: 10 })
    @IsInt()
    typelocalId: number;
}
