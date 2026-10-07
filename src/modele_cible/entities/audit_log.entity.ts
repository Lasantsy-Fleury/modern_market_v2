import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Journal d'audit / traçabilité du modèle cible.
 *
 * Trace les opérations d'écriture (CREATION / MODIFICATION / SUPPRESSION)
 * sur les tables métier. Aucun workflow n'écrit encore dans cette table :
 * elle est créée vide, prête à être alimentée par une phase dédiée
 * (middleware / subscriber TypeORM ou service d'audit explicite).
 */
@Entity('audit_log')
@Index('IX_audit_log_table_record', ['tableName', 'recordId'])
@Index('IX_audit_log_created', ['createdAt'])
@Check(
  'CK_audit_log_action',
  `"action" IN ('CREATION', 'MODIFICATION', 'SUPPRESSION')`,
)
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  tableName: string;

  @Column({ type: 'uuid' })
  recordId: string;

  @Column({ type: 'varchar', length: 20 })
  action: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION';

  /** Opération métier sensible distinctive (création, validation, annulation, ...). */
  @Column({ type: 'varchar', length: 30, nullable: true })
  operation: string | null;

  /** Identifiant de l'acteur (utilisateur / agent), nullable si système. */
  @Column({ type: 'uuid', nullable: true })
  acteurId: string | null;

  /** État avant modification (null pour une création). */
  @Column({ type: 'jsonb', nullable: true })
  ancienEtat: Record<string, unknown> | null;

  /** État après modification (null pour une suppression). */
  @Column({ type: 'jsonb', nullable: true })
  nouvelEtat: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
