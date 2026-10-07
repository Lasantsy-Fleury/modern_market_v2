import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn, Check } from "typeorm";
import { Paiementlocation } from "src/paiement_location/entities/paiement_location.entity";
import { ModePaiement } from "src/modele_cible/entities/mode_paiement.entity";
import { Agent } from "src/modele_cible/entities/agent.entity";
import { Commercant } from "src/modele_cible/entities/commercant.entity";
import { Redevance } from "src/modele_cible/entities/redevance.entity";

@Entity('paiement')
@Check('CK_paiement_montant_positif', '"montant" IS NULL OR "montant" >= 0')
@Check('CK_paiement_canal', `"canal" IS NULL OR "canal" IN ('BUREAU', 'TERRAIN')`)
@Check(
  'CK_paiement_source',
  `"source" IS NULL OR "source" IN ('TERRAIN', 'BUREAU', 'API_EXTERNE', 'IMPORT_HISTORIQUE')`,
)
export class Paiement {
    @PrimaryGeneratedColumn("uuid")
    id_paiement: string;

    @Column({ length: 255,unique:true })
    reference: string;

    @Column({  type: 'enum', 
        enum: ['success', 'failed',],
    })
    status: string;

    @Column({ length: 255 })
    raison: string;

    /**
     * P0 — colonnes préparatoires du modèle cible, toutes NULLable et sans
     * valeur par défaut : l'historique existant reste tel quel (montant NULL
     * = ligne historique dont le montant est lu dans paiement_location).
     * Aucun flux, DTO ou endpoint existant n'est modifié.
     */

    /** Montant total du paiement — aucune valeur déduite en P0. */
    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    montant: number | null;

    /** Mode d'encaissement (table mode_paiement, vide en P0). */
    @Column({ type: 'uuid', nullable: true })
    modePaiementId: string | null;

    @ManyToOne(() => ModePaiement, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'modePaiementId' })
    modePaiement: ModePaiement | null;

    /** Canal d'encaissement — TODO : domaine à valider (BUREAU / TERRAIN). */
    @Column({ type: 'varchar', length: 20, nullable: true })
    canal: string | null;

    /** Agent encaisseur (table agent, vide en P0). */
    @Column({ type: 'uuid', nullable: true })
    agentId: string | null;

    @ManyToOne(() => Agent, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'agentId' })
    agent: Agent | null;

    /** Commerçant concerné par ce paiement (cycle de perception). */
    @Column({ type: 'uuid', nullable: true })
    commercantId: string | null;

    @ManyToOne(() => Commercant, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'commercantId' })
    commercant: Commercant | null;

    /** Obligation concernée (redevance) — lien direct principal. */
    @Column({ type: 'uuid', nullable: true })
    redevanceId: string | null;

    @ManyToOne(() => Redevance, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'redevanceId' })
    redevance: Redevance | null;

    /**
     * Source du paiement : TERRAIN/BUREAU (canaux physiques), API_EXTERNE
     * (Mobile Money via gateway), IMPORT_HISTORIQUE. Domaine borné, extensible
     * uniquement par migration (CHECK ci-dessus).
     */
    @Column({ type: 'varchar', length: 20, nullable: true })
    source: string | null;

    @OneToMany(() => Paiementlocation, (pl) => pl.paiement, { cascade: true })
    paiement_locations: Paiementlocation[];

    @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP' })
    date_creation: Date;
}