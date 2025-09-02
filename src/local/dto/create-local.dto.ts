import { ApiProperty } from "@nestjs/swagger";

export class CreateLocalDto {
    @ApiProperty({maxLength : 11})
    numero: string ;

    @ApiProperty({maxLength : 10})
    zoneId: number ;

    @ApiProperty({maxLength : 10 })
    typelocalId: number;
}
