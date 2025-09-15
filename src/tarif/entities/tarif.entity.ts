import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Typelocal } from "src/type_local/entities/type_locale.entity";
import { Zone } from "src/zone/entities/zone.entity";

@Entity('tarif')
export class Tarif {
    @PrimaryGeneratedColumn('uuid')
    id_tarif: string;

    @ManyToOne(() => Typelocal, (typelocal) => typelocal.tarifs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "typelocalId" })
    typelocal: Typelocal;

    @Column()
    typelocalId: string;  // hangar, pavillon, etc.

    @ManyToOne(() => Zone, (zone) => zone.tarifs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "zoneId" })
    zone: Zone;

    @Column()
    zoneId: string;


    @Column({ type: 'json', nullable: false, })
    usage: { mg: string; fr: string };  // "commercial", "stockage", "bureau", etc.

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    surface_min: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    surface_max: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    montant: number;  // tarif appliqué
}
