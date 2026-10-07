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
import { Periodicite } from './periodicite.entity';

/**
 * Type de droit / ticket — modèle métier cible (Phase P0).
 *
 * Représente un droit d'occupation facturable (ticket journalier, droit
 * mensuel, droit annuel, ...) défini par sa périodicité et sa portée.
 *
 * DÉCISION C5 (validée) — `peutPayerPartiel` :
 * - TRUE  = le paiement partiel est explicitement autorisé ;
 * - FALSE = le paiement partiel est explicitement interdit ;
 * - NULL  = la règle n'est pas définie — NULL ne doit JAMAIS être interprété
 *   comme TRUE ni comme FALSE ;
 * - la règle est rattachée à la configuration du droit (et non au commerçant) ;
 * - la P0 n'implémente AUCUN comportement d'encaissement fondé sur cette
 *   colonne (lecture/branchement reportés à une phase validée).
 *
 * Voir docs/modele_metier_cible.md.
 */
@Entity('type_droit')
@Check('CK_type_droit_portee', `"portee" IN ('EMPLACEMENT', 'ZONE', 'MARCHE')`)
@Check('CK_type_droit_famille', `"famille" IN ('DROIT', 'TICKET')`)
export class TypeDroit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Code interne (unique) — TODO : correspondance avec les codes officiels. */
  @Column({ length: 50, unique: true })
  code: string;

  /** Libellé bilingue (même format que type_locale.typeLoc). */
  @Column({ type: 'jsonb' })
  libelle: { mg: string; fr: string };

  @Column({ type: 'uuid' })
  periodiciteId: string;

  @ManyToOne(() => Periodicite, { nullable: false })
  @JoinColumn({ name: 'periodiciteId' })
  periodicite: Periodicite;

  /** Portée du droit — TODO : domaine à valider (EMPLACEMENT / ZONE / MARCHE). */
  @Column({ length: 20 })
  portee: string;

  /** DÉCISION C5 — boolean tri-valué, NULL = règle non définie (jamais de défaut). */
  @Column({ type: 'boolean', nullable: true })
  peutPayerPartiel: boolean | null;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @Column({ type: 'jsonb', nullable: true })
  description: { mg: string; fr: string } | null;

  /**
   * Distinction type de droit / type de ticket (configurable par
   * l'administration — aucun libellé juridique imposé).
   * Défaut DROIT ; TICKET pour les tickets journaliers/occasionnels…
   */
  @Column({ type: 'varchar', length: 10, default: 'DROIT' })
  famille: 'DROIT' | 'TICKET';

  /**
   * Règles de renouvellement — objet JSON configurable, sans schéma figé
   * tant que la convention n'est pas validée. Exemple de structure possible :
   * { "mode": "AUTO" | "MANUEL", "delaiJoursAvantEcheance": number }.
   */
  @Column({ type: 'jsonb', nullable: true })
  reglesRenouvellement: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
