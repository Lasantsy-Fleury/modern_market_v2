import { ApiProperty } from "@nestjs/swagger";
import { CreatePaiementLocationDto } from "src/paiement_location/dto/create-paiement_location.dto";
import { IsString, IsNumber, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
export class CreatePaiementDto {
    @ApiProperty({ maxLength: 25 })
    reference: string;

    @ApiProperty({ maxLength: 25 })
    status: string;

    @ApiProperty({ maxLength: 25 })
    raison: string;

    @ApiProperty()
    @IsUUID()
    paiementId: string;
    @ApiProperty({
        type: [CreatePaiementLocationDto],
        description: "Liste des locations concernées par ce paiement."
    })

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePaiementLocationDto)
    paiement_locations: CreatePaiementLocationDto[];
}
