import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,OneToMany } from "typeorm";
import { Local } from "src/local/entities/local.entity";

@Entity('type_locale')
export class Typelocal {
    @PrimaryGeneratedColumn('uuid')
    id_type_local: string;

    @Column()
    municipalityId : string;

    @Column({ type: 'jsonb', nullable: false })
    typeLoc: { mg: string; fr: string };

    @Column({ type: 'enum', enum: ['JOURNALIER', 'ANNUEL'], default:'ANNUEL'})
    type_contrat : 'JOURNALIER' | 'ANNUEL' ;

    @Column()
    longueur: number;

    @Column()
    largeur: number;

    @Column({ type: 'jsonb', nullable: true })
    description: { mg: string; fr: string };

    @Column()
    tarif : number;
    
    @OneToMany(() => Local, (local) => local.typelocal)
    locaux: Local[];
}