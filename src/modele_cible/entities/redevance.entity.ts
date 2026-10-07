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
import { Echeance } from './echeance.entity';
import { Location } from '../../location/entities/location.entity';
import { Commercant } from './commercant.entity';

/**
 * Redevance (dette à payer) — modèle cible, Phase P0.
 *
 * Créance concrète issue d'une échéance (echeanceId, 0..1 : peut aussi être
 * ouverte manuellement à titre rectificatif). `montantRegle` est alimenté
 * par les imputations de paiement (paiement_redevance) — AUCUN encaissement
 * n'est géré en P0.
 *
 * Intégrité financière (contrainte table) :
 *   montantDu >= 0, montantRegle >= 0, montantRegle <= montantDu.
 *
 * FK location/echeance en cascade : préserve les flux de suppression
 * existants (suppression en chaîne via local).
 */
@Entity('redevance')
@Check(
  'CK_redevance_montants',
  '"montantDu" >= 0 AND "montantRegle" >= 0 AND "montantRegle" <= "montantDu"',
)
@Check(
  'CK_redevance_dates',
  '"dateCloture" IS NULL OR "dateOuverture" <= "dateCloture"',
)
@Check(
  'CK_redevance_statut',
  `"statut" IN ('OUVERTE', 'PARTIELLE', 'SOLDEE', 'ANNULEE')`,
)
export class Redevance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 0..1 : redevance issue d'une échéance planifiée ou ouverte manuellement. */
  @Column({ type: 'uuid', unique: true, nullable: true })
  echeanceId: string | null;

  @ManyToOne(() => Echeance, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'echeanceId' })
  echeance: Echeance | null;

  @Column({ type: 'uuid', nullable: true })
  locationId: string | null;

  @ManyToOne(() => Location, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'locationId' })
  location: Location | null;

  @Column({ type: 'uuid' })
  commercantId: string;

  @ManyToOne(() => Commercant, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'commercantId' })
  commercant: Commercant;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montantDu: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montantRegle: number;

  /** TODO : domaine de statuts à valider (ex. OUVERTE / PARTIELLE / SOLDEE / ANNULEE). */
  @Column({ length: 30 })
  statut: string;

  @Column({ type: 'date' })
  dateOuverture: Date;

  @Column({ type: 'date', nullable: true })
  dateCloture: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motif: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
