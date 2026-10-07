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
import { Agent } from './agent.entity';

/**
 * Quittance — preuve numérique du paiement (modèle cible, Phase P0).
 *
 * 1 quittance par paiement (paiementId unique), numéro unique.
 * TODO : format du numéro de quittance — par défaut proposé (non acté) :
 * reprendre paiement.reference pour la compatibilité avec l'historique.
 * TODO : document_url / qr_token dépendent du contrat de remise non fourni.
 *
 * Table vide en P0 : aucune émission de quittance.
 */
@Entity('quittance')
@Check('CK_quittance_montant', '"montant" >= 0')
@Check(
  'CK_quittance_statut',
  `"statut" IN ('EMISE', 'ANNULEE', 'REMPLACEE')`,
)
export class Quittance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** TODO : format du numéro (règle non validée). */
  @Column({ length: 50, unique: true })
  numero: string;

  @Column({ type: 'uuid', unique: true })
  paiementId: string;

  @ManyToOne(() => Paiement, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'paiementId' })
  paiement: Paiement;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montant: number;

  /** Pas de valeur par défaut : date écrite par le futur code d'émission. */
  @Column({ type: 'timestamp' })
  dateEmission: Date;

  /** TODO : domaine de statuts à valider (ex. EMISE / ANNULEE / REMPLACEE). */
  @Column({ length: 30 })
  statut: string;

  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @ManyToOne(() => Agent, { nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent: Agent | null;

  /** TODO : contrat de remise du document non fourni. */
  @Column({ type: 'varchar', length: 500, nullable: true })
  documentUrl: string | null;

  /** TODO : contrat de remise du document non fourni. */
  @Column({ type: 'varchar', length: 100, nullable: true })
  qrToken: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
