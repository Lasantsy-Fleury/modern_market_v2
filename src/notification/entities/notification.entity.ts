import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('notification')
export class Notification {
    @PrimaryGeneratedColumn()
    id_paiement_location: number;

    @Column({ length: 255 })
    type: string;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    date_paiement: Date;

    @Column({ length: 10 })
    paiementId: number;



}
