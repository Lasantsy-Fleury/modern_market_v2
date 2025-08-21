import { Column, Entity, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Zone } from "src/zone/entities/zone.entity";

@Entity('distribution_zone')
export class DistributionZone {
    @PrimaryGeneratedColumn()
    id_distribution_zone: number;

    @Column()
    id_user_role: number;

    @Column({default:true})
    isActual: boolean;

    // Une zone de distribution appartient à une seule zone géographique
    @ManyToOne(() => Zone, zone => zone.distributionZones)
    @JoinColumn({ name: 'id_zone' }) // La colonne de clé étrangère dans la table 'distribution_zone' sera 'id_zone'
    zone: Zone; // Ceci est l'objet Zone lié

    @Column({
        type: 'json',
    })
    nombre_ticket: { id_ticket_initial: number; id_ticket_final: number };

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    created_at: Date;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    date_fin: Date;
}