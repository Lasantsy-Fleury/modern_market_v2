import { Entity, PrimaryGeneratedColumn, Column, OneToMany,CreateDateColumn } from "typeorm";
import { Paiementlocation } from "src/paiement_location/entities/paiement_location.entity";

@Entity('paiement')
export class Paiement {
    @PrimaryGeneratedColumn("uuid")
    id_paiement: string;

    @Column({ length: 255,unique:true })
    reference: string;

    @Column({  type: 'enum', 
    enum: ['success', 'failed',],
    
 })
    status: string;

    @Column({ length: 255 })
    raison: string;

    @Column({type: 'uuid', unique:true })
    paiementId: string;

    @OneToMany(() => Paiementlocation, (pl) => pl.paiement)
    paiement_locations: Paiementlocation[];

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP' })
    date_creation: Date;
}