import { Zone } from "src/zone/entities/zone.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('distribution_zone')
export class DistributionZone {
    @PrimaryGeneratedColumn('uuid')
    id_distribution_zone : string;

    @Column({ type: 'uuid' })
    id_user : string

    @Column({ type: 'uuid' })
    zoneId: string; 

    @ManyToOne(() => Zone, zone => zone.distributionZones)
    @JoinColumn({ name: 'zoneId' }) // Assurez-vous que 'zoneId' est le bon nom de la colonne de clé étrangère
    zone: Zone;
}
