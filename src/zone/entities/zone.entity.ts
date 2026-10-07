import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Local } from "src/local/entities/local.entity";
import { DistributionZone } from "src/distribution_zone/entities/distribution_zone.entity";
import { Marche } from "src/modele_cible/entities/marche.entity";


@Entity('zone')
export class Zone {
    @PrimaryGeneratedColumn('uuid')
    id_zone: string;

    @Column({ length: 50, unique: true })
    nom: string;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @Column()
    formatted_id: string;

    @Column()
    municipalityId: string;

    /**
     * DÉCISION C6 — hiérarchie cible Commune → Marché → Zone → Emplacement.
     * P0 : nullable, AUCUN backfill (migration de données non validée).
     * L'unicité future UNIQUE(marcheId, nom) remplacera UNIQUE(nom) UNIQUEMENT
     * après backfill validé + analyse de doublons — la contrainte actuelle
     * UQ(zone.nom) est conservée telle quelle en P0.
     * ON DELETE SET NULL : ne bloque ni ne supprime jamais une zone existante.
     */
    @Column({ type: 'uuid', nullable: true })
    marcheId: string | null;

    @ManyToOne(() => Marche, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'marcheId' })
    marche: Marche | null;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Polygon',
        srid: 4326
    })
    delimitation: string;

    @OneToMany(() => Local, (local) => local.zone)
    locaux: Local[];

    @OneToMany(() => DistributionZone, distributionZone => distributionZone.zone)
    distributionZones: DistributionZone[];
}
