import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,OneToMany } from "typeorm";
import { Local } from "src/local/entities/local.entity";

@Entity('type_locale')
export class Typelocal {
    // @Column({ type: 'json', nullable: true })
    // name: { mg: string; fr: string };
    
    @PrimaryGeneratedColumn('uuid')
    id_type_local: string;

    @Column()
    municipalityId : number;

    @Column({ length: 50 })
    typeLoc : string;
    
    @Column()
    tarif: number;

    @Column({ length: 150,nullable:true })
    description: string;

    @Column({ nullable : true })
    type_contrat : string ;
    
    @OneToMany(() => Local, (local) => local.typelocal)
    locaux: Local[];
  name: any;
}