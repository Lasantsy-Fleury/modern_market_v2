import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,OneToMany } from "typeorm";
import { Local } from "src/local/entities/local.entity";
import { TypeEnum } from "../enum/type.enum";

@Entity('type_locale')
export class Typelocal {
    // @Column({ type: 'json', nullable: true })
    // name: { mg: string; fr: string };
    
    @PrimaryGeneratedColumn('uuid')
    id_type_local: string;

    @Column({ 
        type: 'enum',
        enum : TypeEnum,
        default : TypeEnum.Marquage,
    })
    typeLoc : TypeEnum;
    
    @Column()
    tarif: number;

    @Column({ length: 150,nullable:true })
    description: string;

    @Column({ nullable : true })
    type_contrat : string ;
    
    @OneToMany(() => Local, (local) => local.typelocal)
    locaux: Local[];
}