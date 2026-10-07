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
import { Commercant } from './commercant.entity';
import { Local } from '../../local/entities/local.entity';

/**
 * Affectation d'un commerçant à un emplacement (local) sur une période —
 * socle du modèle cible.
 *
 * Une même affectation ne peut pas être déclarée deux fois (contrainte
 * d'unicité sur le triplet commerçant/emplacement/début de période).
 * La date de fin, nullable, marque une affectation encore ouverte.
 *
 * Table vide à la mise en place (aucun backfill implicite).
 */
@Entity('affectation')
@Index('UQ_affectation_commercant_local_debut', ['commercantId', 'localId', 'dateDebut'], { unique: true })
@Index('IX_affectation_local', ['localId'])
@Index('IX_affectation_commercant', ['commercantId'])
@Check('CK_affectation_montant', '"montantTheoriqueMensuel" IS NULL OR "montantTheoriqueMensuel" >= 0')
@Check(
  'CK_affectation_dates',
  '"dateFin" IS NULL OR "dateDebut" <= "dateFin"',
)
@Check(
  'CK_affectation_statut',
  `"statut" IN ('ACTIVE', 'TERMINEE', 'RESILIEE')`,
)
export class Affectation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  commercantId: string;

  @ManyToOne(() => Commercant, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'commercantId' })
  commercant: Commercant;

  @Column({ type: 'uuid' })
  localId: string;

  @ManyToOne(() => Local, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'localId' })
  local: Local;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date', nullable: true })
  dateFin: Date | null;

  /**
   * Statut de l'affectation — domaine validé :
   * ACTIVE (en cours), TERMINEE (arrivée à échéance), RESILIEE (rompue
   * anticipativement). Aucune valeur implicite en dehors de ACTIVE par
   * défaut explicite de la ligne.
   */
  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  statut: 'ACTIVE' | 'TERMINEE' | 'RESILIEE';

  /** Motif éventuel (résiliation, transfert, ...). */
  @Column({ type: 'varchar', length: 255, nullable: true })
  motif: string | null;

  /** Montant contractuel de référence (aucune règle métier implicite). */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  montantTheoriqueMensuel: number | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
