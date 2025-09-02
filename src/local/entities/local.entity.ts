import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Zone } from "src/zone/entities/zone.entity";
import { Typelocal } from "src/type_local/entities/type_local.entity";
import { Location } from "src/location/entities/location.entity";

@Entity('local')
export class Local {
    @PrimaryGeneratedColumn()
    id_local: number;

    @Column({ length: 11 })
    numero: string;

    @Column({ })
    zoneId: number;   // ici tu stockes directement l’ID de la zone

    @Column({  })
    typelocalId: number;

    @ManyToOne(() => Zone, (zone) => zone.locaux, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "zoneId" })  // fait le lien entre zoneId et Zone
    zone: Zone;

    @ManyToOne(() => Typelocal, (typelocal) => typelocal.locaux, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "typelocalId" })  // fait le lien entre TypelocalId et Typelocal
    typelocal: Typelocal;

    @OneToMany(() => Location, (location) => location.local)
    locations: Location[];


}
