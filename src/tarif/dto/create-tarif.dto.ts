import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UsageDto {
    @ApiProperty({
        description: "Usage en malgache",
        example: 'fivarotana', // commercial
    })
    @IsNotEmpty()
    mg: string;

    @ApiProperty({
        description: "Usage en français",
        example: 'commercial',
    })
    @IsNotEmpty()
    fr: string;
}


export class CreateTarifDto {
    @ApiProperty({
        description: 'Identifiant du type de local (pavillon, hangar, etc.)',
        example: 'a4c5d2e1-1234-4bcd-8a9f-0a123456789b',
    })
    @IsUUID()
    @IsNotEmpty()
    typelocalId: string;

    @ApiProperty({
        description: 'Identifiant de la zone où se situe le local',
        example: 'b2d3c4e5-6789-4abc-9d12-34567890abcd',
    })
    @IsUUID()
    @IsNotEmpty()
    zoneId: string;

    @ApiProperty({
        description: "Usage prévu du local en JSON (mg, fr)",
        example: { mg: 'fivarotana akanjo', fr: 'vente de vetement' },
    })
    @IsNotEmpty()
    @IsObject()
    @ValidateNested()
    @Type(() => UsageDto)
    usage: UsageDto;

    @ApiProperty({
        description: 'surface max',
        example: 10,
    })
    @IsNumber()

    surface_min: number;

    @ApiProperty({
        description: 'surface max',
        example: 10,
    })
    @IsNumber()

    surface_max: number;

    @ApiProperty({
        description: 'Montant du tarif en Ariary',
        example: 500000,
    })
    @IsNumber()
    @Min(0)
    montant: number;
}
