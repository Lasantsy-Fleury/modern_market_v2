import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Paiementlocation } from "src/paiement_location/entities/paiement_location.entity";

@Entity('paiement')
export class Paiement {
    @PrimaryGeneratedColumn("uuid")
    id_paiement: string;

    @Column({ length: 255 })
    reference: string;

    @Column({ length: 25 })
    status: string;

    @Column({ length: 255 })
    raison: string;

    @Column()
    paiementId: number;

    @OneToMany(() => Paiementlocation, (tu) => tu.location)
    paiement_locations: Paiementlocation[];
}