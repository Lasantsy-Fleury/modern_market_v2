import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,OneToMany } from "typeorm";
import { Local } from "src/local/entities/local.entity";

@Entity('type_local')
export class Typelocal {
    @PrimaryGeneratedColumn()
    id_type_local: number;

    @Column({ length: 30 })
    type: string;

    @Column({ length: 150 })
    description: string;

    @OneToMany(() => Local, (local) => local.typelocal)
    locaux: Local[];

}
