import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Mode de paiement — table de référence configurable (modèle cible, Phase P0).
 *
 * Couvre les cas demandés : espèces, Mobile Money, ... — le jeu de valeurs
 * EST à grainer lors d'une phase validée (docs/modele_metier_cible.md),
 * AUCUNE graine ni comportement d'encaissement en P0.
 */
@Entity('mode_paiement')
export class ModePaiement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Code (unique) — ex. ESPECES, MOBILE_MONEY. TODO : valider le domaine. */
  @Column({ length: 30, unique: true })
  code: string;

  @Column({ length: 100 })
  libelle: string;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
