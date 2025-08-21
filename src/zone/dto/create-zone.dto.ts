import { ApiProperty } from "@nestjs/swagger";
import type { Geometry } from 'geojson';

export class CreateZoneDto {
    @ApiProperty({ description: 'nom pour identifier le zone', maxLength: 50 })
    nom: string;

    @ApiProperty({ description: 'petite description de la zone.ex:en face du bureau fkt', nullable: true })
    description: string;

    @ApiProperty({
        description: 'Limite géométrique de la zone sur la carte (format GeoJSON ou WKT)',
        example: {
            type: 'Polygon',
            coordinates: [
                [
                    [-1.5, 48.5],
                    [-1.5, 48.6],
                    [-1.4, 48.6],
                    [-1.4, 48.5],
                    [-1.5, 48.5]
                ]
            ]
        }
    })
    delimitation: any;

    @ApiProperty({ description: 'Id de la commune actuelle' })
    municipality_id: number;

}
