import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RevenueEvent } from '../interfaces/revenue-event.interface';

export type SigrnfSyncStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export const SIGRNF_SYNC_STATUSES: SigrnfSyncStatus[] = [
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
];

/**
 * Table d'intégration locale SIGRNF.
 *
 * Elle ne stocke QUE les événements nécessitant une synchronisation avec
 * SIGRNF. Elle n'est pas exposée par l'API et ne fait partie d'aucun
 * domaine métier existant.
 *
 * `sigrnf_sync` est créée automatiquement (glob d'entités + synchronize: true).
 */
@Entity('sigrnf_sync')
@Index('UQ_sigrnf_sync_event_reference', ['eventType', 'localReference'], {
  unique: true,
})
export class SigrnfSync {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Type d'événement INTERNE (pas un identifiant SIGRNF). */
  @Column({ length: 100 })
  eventType: string;

  /** Référence locale de l'opération (ex : référence du paiement). Clé d'idempotence. */
  @Column({ length: 255 })
  localReference: string;

  @Column({
    type: 'enum',
    enum: SIGRNF_SYNC_STATUSES,
    default: 'PENDING',
  })
  status: SigrnfSyncStatus;

  @Column({ type: 'int', default: 0 })
  attemptCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAttemptAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  // type explicite : le type union (string | null) serait réfléchi en "Object".
  @Column({ type: 'varchar', length: 255, nullable: true })
  responseReference: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  /** Événement de recette interne (pas le payload SIGRNF). */
  @Column({ type: 'jsonb' })
  payload: RevenueEvent;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
