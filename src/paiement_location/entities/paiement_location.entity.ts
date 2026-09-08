import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paiement } from "src/paiement/entities/paiement.entity";
import { Location } from "src/location/entities/location.entity";
@Entity('paiement_location')
export class Paiementlocation {
    @PrimaryGeneratedColumn("uuid")
    id_paiement_location: string;

    @Column()
    locationId: string;

    @Column()
    nombre_paye: number;

    // Paiementlocation.entity.ts
    @ManyToOne(() => Location, (location) => location.paiement_locations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'locationId' })
    location: Location;


    @ManyToOne(() => Paiement, (Paiement) => Paiement.paiement_locations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'paiementId' })
    paiement: Paiement;

    @CreateDateColumn({ type: "timestamp" })
    date_debut: Date;

    @CreateDateColumn({ type: "timestamp", })
    date_fin: Date;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    date_paiement: Date;

    @Column() 
    montant_paye: number;
}