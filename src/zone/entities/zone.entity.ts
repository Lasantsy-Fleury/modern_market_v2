import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Local } from "src/local/entities/local.entity";
import { DistributionZone } from "src/distribution_zone/entities/distribution_zone.entity";


@Entity('zone')
export class Zone {
    @PrimaryGeneratedColumn('uuid')
    id_zone: string;

    @Column({ length: 50, unique: true })
    nom: string;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @Column()
    formatted_id: string;

    @Column()
    municipalityId: string;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Polygon',
        srid: 4326
    })
    delimitation: string;

    @OneToMany(() => Local, (local) => local.zone)
    locaux: Local[];

    @OneToMany(() => DistributionZone, distributionZone => distributionZone.zone)
    distributionZones: DistributionZone[];
}
