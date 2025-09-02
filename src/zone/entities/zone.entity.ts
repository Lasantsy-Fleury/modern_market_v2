import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Local } from "src/local/entities/local.entity";


@Entity('zone')
export class Zone {
    @PrimaryGeneratedColumn()
    id_zone: number;

    @Column({ length: 50 })
    nom: string;

    @Column()
    status: number;

    @Column()
    municipality_id: number;

    @OneToMany(() => Local, (local) => local.zone)
    locaux: Local[];


}