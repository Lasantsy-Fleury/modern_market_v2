import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActiviteCommerciale } from './activite_commerciale.entity';

/**
 * Commerçant — modèle métier cible (Phase P0).
 *
 * Relation à l'utilisateur externe : `userId` (= location.id_user historique).
 * L'affectation à une zone reste portée par distribution_zone existant
 * (réutilisation documentée, aucune FK supplémentaire).
 *
 * DÉCISION C4 (validée) :
 * - le NIF est un identifiant fiscal unique au niveau du contribuable ;
 * - un enregistrement Commercant ne représente PAS nécessairement un
 *   contribuable fiscal unique ;
 * - donc : `nif` NULLable, SANS contrainte UNIQUE (ni globale, ni partielle) ;
 * - évolution future vers une entité `Contribuable` (NIF unique) —
 *   NON implémentée en P0 : modélisation fiscale non nécessaire à P0.
 *
 * Voir docs/modele_metier_cible.md.
 */
@Entity('commercant')
export class Commercant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Identifiant de l'utilisateur externe (gateway utilisateurs).
   * Unicité retenue : 1 fiche commerçant par utilisateur externe.
   */
  @Column({ type: 'uuid', unique: true, nullable: true })
  userId: string | null;

  /** DÉCISION C4 — conservé temporairement pour compatibilité, NULLable, jamais unique. */
  @Column({ type: 'varchar', length: 10, nullable: true })
  nif: string | null;

  @Column({ type: 'uuid', nullable: true })
  activiteId: string | null;

  @ManyToOne(() => ActiviteCommerciale, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'activiteId' })
  activite: ActiviteCommerciale | null;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
