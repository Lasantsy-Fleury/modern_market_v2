import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Paiement } from '../../paiement/entities/paiement.entity';
import { Redevance } from './redevance.entity';

/**
 * Imputation paiement → redevance (modèle cible, Phase P0).
 *
 * Table d'affectation permettant, le cas échéant :
 * - d'imputer un paiement à plusieurs redevances ;
 * - d'imputer un montant partiel sur une redevance (le paiement partiel
 *   reste soumis à la règle type_droit.peutPayerPartiel — DÉCISION C5,
 *   aucune vérification n'est implémentée en P0).
 *
 * Contraintes : 1 imputation par couple (paiement, redevance),
 * montantImpute strictement positif.
 */
@Entity('paiement_redevance')
@Index('UQ_paiement_redevance', ['paiementId', 'redevanceId'], { unique: true })
@Check('CK_paiement_redevance_montant', '"montantImpute" > 0')
export class PaiementRedevance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  paiementId: string;

  @ManyToOne(() => Paiement, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'paiementId' })
  paiement: Paiement;

  @Column({ type: 'uuid' })
  redevanceId: string;

  @ManyToOne(() => Redevance, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'redevanceId' })
  redevance: Redevance;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montantImpute: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
