import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('distribution_zone')
export class DistributionZone {
    @PrimaryGeneratedColumn('uuid')
    id_distribution_zone : string;

    @Column()
    municipalityId : number;

    @Column({ type: 'uuid' })
    id_user : string

    @Column({ type: 'uuid' })
    zoneId: string; 
}
