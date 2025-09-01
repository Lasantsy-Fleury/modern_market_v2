import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Paiementlocation } from "src/paiement_location/entities/paiement_location.entity";
import { Local } from "src/local/entities/local.entity";

@Entity('location')
export class Location {
    @PrimaryGeneratedColumn()
    id_location: number;

    @Column({ length: 10 })
    tarif: number;

    @Column({ length: 25 })
    periodicite: string;

    @Column({ length: 11 })
    id_user: string;

    @OneToMany(() => Paiementlocation, (tu) => tu.paiement)
    paiement_locations: Paiementlocation[];

    @ManyToOne(() => Local, (local) => local.locations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "localId" })
    local: Local;

    @Column()
    localId: number;  // clé étrangère vers Local



}
