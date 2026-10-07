import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Paiement } from '../../paiement/entities/paiement.entity';
import { ModePaiement } from './mode_paiement.entity';

/** Canal d'encaissement — domaine validé : BUREAU / TERRAIN. */

/**
 * Recette — écriture de recette liée à un paiement encaissé (modèle cible, P0).
 *
 * 1 ligne de recette par paiement (paiementId unique). Les agrégats
 * (recettes par jour, par canal, par droit...) sont dérivés par requête —
 * les règles d'exercice / de date de recette restent TODO (non validées).
 *
 * Table vide en P0 : aucun flux existant n'écrit dans cette table.
 */
@Entity('recette')
@Check('CK_recette_montant', '"montant" >= 0')
@Check('CK_recette_canal', `"canal" IS NULL OR "canal" IN ('BUREAU', 'TERRAIN')`)
export class Recette {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  paiementId: string;

  @ManyToOne(() => Paiement, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'paiementId' })
  paiement: Paiement;

  @Column({ type: 'date' })
  dateRecette: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montant: number;

  @Column({ type: 'uuid', nullable: true })
  modePaiementId: string | null;

  @ManyToOne(() => ModePaiement, { nullable: true })
  @JoinColumn({ name: 'modePaiementId' })
  modePaiement: ModePaiement | null;

  /** Canal d'encaissement (TODO : domaine à valider — BUREAU / TERRAIN). */
  @Column({ type: 'varchar', length: 20, nullable: true })
  canal: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
