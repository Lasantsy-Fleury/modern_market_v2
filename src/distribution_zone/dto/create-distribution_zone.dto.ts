import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsObject, ValidateNested } from 'class-validator'; // Ajout de validateurs pour une meilleure validation
import { Type } from 'class-transformer'; // Pour la transformation des objets imbriqués

class NombreTicketDto {
    @ApiProperty({ description: 'Numéro de ticket initial' })
    @IsNumber()
    @IsNotEmpty()
    id_ticket_initial: number;

    @ApiProperty({ description: 'Numéro de ticket final' })
    @IsNumber()
    @IsNotEmpty()
    id_ticket_final: number;
}

export class CreateDistributionZoneDto {
    @ApiProperty({ description: 'ID de l\'utilisateur percepteur responsable de cette distribution zone' })
    @IsNumber()
    @IsNotEmpty()
    id_user_role: number;

    @ApiProperty({ description: 'ID de la zone géographique à laquelle on assigne cette distribution zone' })
    @IsNumber()
    @IsNotEmpty()
    id_zone: number; // Toujours un nombre, car c'est l'ID de la Zone liée



    @ApiProperty({
        description: 'Les plages de numéro de ticket distribué à ce percepteur',
        type: NombreTicketDto, // Utilisation du DTO imbriqué
        example: { id_ticket_initial: 0, id_ticket_final: 100 },
    })
    @IsObject()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => NombreTicketDto) // Indique à class-transformer comment instancier l'objet imbriqué
    nombre_ticket: NombreTicketDto; // Utilisation du DTO imbriqué
}