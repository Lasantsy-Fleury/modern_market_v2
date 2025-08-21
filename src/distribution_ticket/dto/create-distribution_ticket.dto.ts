import { ApiProperty } from "@nestjs/swagger";

export class CreateDistributionTicketDto {
    @ApiProperty({description: 'Latitude of distribution ticket'})
    latitude : number ;
    
    @ApiProperty({description: 'Longitude of distribution ticket'})
    longitude : number ;
    
    @ApiProperty({ description: 'date de creation'})
    id_recus : number ;
    
    @ApiProperty({ description: 'date de creation'})
    created_at : Date  ;
}
