import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, Check } from "typeorm";
import { Paiementlocation } from "src/paiement_location/entities/paiement_location.entity";
import { Local } from "src/local/entities/local.entity";
import { Commercant } from "src/modele_cible/entities/commercant.entity";
import { UUID } from "typeorm/driver/mongodb/bson.typings";

export enum Periodicite {
    JOURNALIER = 'JOURNALIER',
    MENSUEL = 'MENSUEL',
}

@Entity('location')
@Check('CK_location_dates_coherentes', '"date_debut_loc" <= "date_fin_loc"')
export class Location {
    @PrimaryGeneratedColumn('uuid')
    id_location: string;

    @Column({
        type: 'enum',
        enum: Periodicite,
        default: Periodicite.MENSUEL, // valeur par défaut si tu veux
    })
    periodicite: Periodicite;

    @Column({ type: 'uuid' })
    id_user: string;

    @Column({ length: 10 })
    nif: string;

    /**
     * P0 — relation préparatoire vers l'entité Commercant (modèle cible) :
     * nullable, aucun backfill (id_user reste la référence existante).
     * ON DELETE SET NULL : ne bloque ni ne supprime jamais une location existante.
     */
    @Column({ type: 'uuid', nullable: true })
    commercantId: string | null;

    @ManyToOne(() => Commercant, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'commercantId' })
    commercant: Commercant | null;

    @Column({ type: 'date' })
    date_debut_loc: Date;

    @Column({ type: 'date' })
    date_fin_loc: Date;


    @Column({ type: 'int', nullable: true })
    frequence: number;

    @Column({nullable: true})
    usage: string;


    @OneToMany(() => Paiementlocation, (paiementLocation) => paiementLocation.location)
//   @JoinColumn({ name: "PaiementLocationId" })
    paiement_locations: Paiementlocation[];


    @ManyToOne(() => Local, (local) => local.locations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "localId" })
    local: Local;

    @Column({ type: 'uuid' })
    localId: string;  // clé étrangère vers Local
}