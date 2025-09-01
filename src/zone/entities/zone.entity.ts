import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Local } from "src/local/entities/local.entity";


@Entity('zone')
export class Zone {
    @PrimaryGeneratedColumn()
    id_zone: number;

    @Column({ length: 50 })
    nom: string;

    @Column({ length: 10 })
    status: number;


    @Column({ length: 10 })
    municipality_id: number;

    @OneToMany(() => Local, (local) => local.zone)
    locaux: Local[];


}