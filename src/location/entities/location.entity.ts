import { Entity, PrimaryColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Paiementlocation } from "src/paiement_location/entities/paiement_location.entity";
import { Local } from "src/local/entities/local.entity";

@Entity('location')
export class Location {
    @PrimaryColumn('uuid')
    id_location: string;

    @Column()
    tarif: number;

    @Column({ length: 10 })
    periodicite: string;

    @Column({ length: 11 })
    id_user: string;

    @Column({ length: 6 })
    nif: string;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    date_debut_loc: Date;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    date_fin_loc: Date;

    @Column({ length: 10 })
    frequence: number;

    @OneToMany(() => Paiementlocation, (tu) => tu.paiement)
    paiement_locations: Paiementlocation[];

    @ManyToOne(() => Local, (local) => local.locations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "localId" })
    local: Local;

    @Column({ length: 20 })
    localId: string;  // clé étrangère vers Local


}
