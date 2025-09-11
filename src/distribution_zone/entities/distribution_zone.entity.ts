import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('distribution_zone')
export class DistributionZone {
    @PrimaryGeneratedColumn('uuid')
    id_distribution_zone : string;

    @Column({ length: 20})
    id_user : string

    @Column({ length: 20})
    zoneId: string; 
}
