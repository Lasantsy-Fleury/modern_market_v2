import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('distribution_zone')
export class DistributionZone {
    @PrimaryGeneratedColumn('uuid')
    id_distribution_zone : string;

    @Column({ length: 20})
    id_controlleur : string

    @Column({ length: 20})
    zoneId: string; 
}
