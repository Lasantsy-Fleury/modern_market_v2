import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Local } from "src/local/entities/local.entity";


@Entity('zone')
export class Zone {
    @PrimaryGeneratedColumn('uuid')
    id_zone: string;

    @Column({ length: 50 })
    nom: string;

    @Column({ type: 'boolean', default: false })
    status: boolean;

    @Column({ length: 10 })
    municipality_id: number;

    @OneToMany(() => Local, (local) => local.zone)
    locaux: Local[];


}