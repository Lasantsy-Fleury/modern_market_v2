import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,OneToMany } from "typeorm";
import { Local } from "src/local/entities/local.entity";

@Entity('type_local')
export class Typelocal {
    @PrimaryGeneratedColumn()
    id_type_local: number;

    @Column({ length: 255 })
    type: string;

    @Column({ length: 255 })
    description: string;

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    date_paiement: Date;

    @OneToMany(() => Local, (local) => local.typelocal)
    locaux: Local[];

}
