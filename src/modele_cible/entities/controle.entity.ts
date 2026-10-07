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
import { Agent } from './agent.entity';
import { Zone } from '../../zone/entities/zone.entity';
import { Local } from '../../local/entities/local.entity';
import { Commercant } from './commercant.entity';
import { Presence } from './presence.entity';

/** Statut du contrôle — domaine validé (aucune transition implicite). */

/**
 * Contrôle terrain — modèle cible, Phase P0.
 *
 * Constate un état des lieux : agent, zone (et emplacement), commerçant
 * concerné, présence éventuellement observée, observations.
 *
 * TODO : aucun code d'anomalie ni décision/sanction n'est modélisé —
 * le rattachement « présence hors zone autorisée » (presence.zoneId vs
 * zones de l'affectation) sera une règle de calcul, pas une contrainte
 * de structure (paramètre CODES_ANOMALIE_CONTROLE, valeur non validée).
 *
 * Table vide en P0.
 */
@Entity('controle')
@Check('CK_controle_statut', `"statut" IS NULL OR "statut" IN ('OUVERT', 'CLOTURE')`)
@Check(
  'CK_controle_resultat',
  `"resultat" IS NULL OR "resultat" IN ('CONFORME', 'ANOMALIE', 'HORS_ZONE', 'GPS_INDISPONIBLE', 'FAIBLE_PRECISION', 'SANS_EMPLACEMENT_FIXE', 'CONTROLE_MANUEL')`,
)
export class Controle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @ManyToOne(() => Agent, { nullable: false })
  @JoinColumn({ name: 'agentId' })
  agent: Agent;

  @Column({ type: 'timestamp' })
  dateControle: Date;

  /** Position GPS du contrôleur (preuve technique, jamais preuve juridique). */
  @Column({ type: 'decimal', precision: 12, scale: 6, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 6, nullable: true })
  longitude: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  precisionGps: number | null;

  /** Résultat du contrôle — domaine validé (voir controle.service). */
  @Column({ type: 'varchar', length: 30, nullable: true })
  resultat: string | null;

  /** Indique si la comparaison position réelle / emplacement attendu était autorisée. */
  @Column({ type: 'boolean', default: true })
  comparerPosition: boolean;

  @Column({ type: 'uuid' })
  zoneId: string;

  @ManyToOne(() => Zone, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'zoneId' })
  zone: Zone;

  @Column({ type: 'uuid', nullable: true })
  localId: string | null;

  @ManyToOne(() => Local, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'localId' })
  local: Local | null;

  @Column({ type: 'uuid', nullable: true })
  commercantId: string | null;

  @ManyToOne(() => Commercant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'commercantId' })
  commercant: Commercant | null;

  @Column({ type: 'uuid', nullable: true })
  presenceId: string | null;

  @ManyToOne(() => Presence, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'presenceId' })
  presence: Presence | null;

  /** TODO : codes d'anomalie à valider — aucune liste codée en dur. */
  @Column({ type: 'varchar', length: 50, nullable: true })
  typeAnomalie: string | null;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  /** TODO : décision / état du contrôle à valider — aucune sanction modélisée. */
  @Column({ type: 'varchar', length: 30, nullable: true })
  statut: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
