import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('notification')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id_notification: string;

    @Column({ length: 255 })
    type: string;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    date_paiement: Date;

    @Column()
    paiementId: number;
}