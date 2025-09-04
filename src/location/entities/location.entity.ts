import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Paiementlocation } from "src/paiement_location/entities/paiement_location.entity";
import { Local } from "src/local/entities/local.entity";

export enum Periodicite {
    JOURNALIER = 'JOURNALIER',
    MENSUEL = 'MENSUEL',
}

@Entity('location')
export class Location {
    @PrimaryGeneratedColumn('uuid')
    id_location: string;

    @Column({ type: 'int' })
    tarif: number;

    @Column({
        type: 'enum',
        enum: Periodicite,
        default: Periodicite.MENSUEL, // valeur par défaut si tu veux
    })
    periodicite: Periodicite;

    @Column({ length: 11 })
    id_user: string;

    @Column({ length: 6 })
    nif: string;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    date_debut_loc: Date;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    date_fin_loc: Date;

    @Column({ type: 'int', nullable: true })
    frequence: number;


    @OneToMany(() => Paiementlocation, (paiementLocation) => paiementLocation.location)
//   @JoinColumn({ name: "PaiementLocationId" })
    paiement_locations: Paiementlocation[];


    @ManyToOne(() => Local, (local) => local.locations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "localId" })
    local: Local;

    @Column({})
    localId: string;  // clé étrangère vers Local
}