import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import type { Geometry } from 'geojson';
import { DistributionTicket } from "src/distribution_ticket/entities/distribution_ticket.entity";
import { DistributionZone } from "src/distribution_zone/entities/distribution_zone.entity";

@Entity('zone')
export class Zone {
    @PrimaryGeneratedColumn()
    id_zone: number;

    @Column({ length: 50 })
    nom: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Polygon',
        srid: 4326
    })
    delimitation: string;

    @Column()
    municipality_id: number;

    @Column({ default: true })
    status: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    created_at: Date;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    updated_at: Date;

    // Une zone peut avoir plusieurs zones de distribution
    @OneToMany(() => DistributionZone, distributionZone => distributionZone.zone)
    distributionZones: DistributionZone[];
}