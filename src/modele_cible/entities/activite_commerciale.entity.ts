import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Activité commerciale — modèle métier cible (Phase P0).
 *
 * Table de référence vide en P0 (aucune graine) : le jeu de valeurs sera
 * constitué lors d'une phase validée (voir docs/modele_metier_cible.md).
 */
@Entity('activite_commerciale')
export class ActiviteCommerciale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Code interne (unique) — TODO : correspondance avec les libellés officiels. */
  @Column({ length: 50, unique: true })
  code: string;

  /** Libellé bilingue (même format que type_locale.typeLoc). */
  @Column({ type: 'jsonb' })
  libelle: { mg: string; fr: string };

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
