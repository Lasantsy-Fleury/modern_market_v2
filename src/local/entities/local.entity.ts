import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Zone } from "src/zone/entities/zone.entity";
import { Location } from "src/location/entities/location.entity";
import { Typelocal } from "src/type_local/entities/type_locale.entity";

@Entity('local')
export class Local {
    @PrimaryGeneratedColumn("uuid")
    id_local: string;

    @Column({ length: 11 })
    numero: string;

    @Column({type: 'enum', enum: ['DISPONIBLE', 'LOUE', 'INDISPONIBLE'], default: 'DISPONIBLE'})
    statut: 'DISPONIBLE' | 'LOUE' | 'INDISPONIBLE';

    @Column({type: 'uuid' })
    zoneId: string;   // ici tu stockes directement l’ID de la zone

    @Column()
    typelocalId: string;

    @Column({nullable:true})
    surface: number;

    @ManyToOne(() => Zone, (zone) => zone.locaux, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "zoneId" })  // fait le lien entre zoneId et Zone
    zone: Zone;

    @ManyToOne(() => Typelocal, (typelocal) => typelocal.locaux, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "typelocalId" })  // fait le lien entre TypelocalId et Typelocal
    typelocal: Typelocal;

    @OneToMany(() => Location, (location) => location.local)
    locations: Location[];
}
