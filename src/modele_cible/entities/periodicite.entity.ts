import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Périodicité — table de référence configurable (modèle cible, Phase P0).
 *
 * Remplace à terme la lecture de l'enum location.periodicite (JOURNALIER /
 * MENSUEL) et couvre type_locale.type_contrat (JOURNALIER / ANNUEL) :
 * les valeurs initiales à grainer sont documentées dans
 * docs/modele_metier_cible.md — AUCUNE graine en P0.
 */
@Entity('periodicite')
@Check('CK_periodicite_unites', '"nbUnites" > 0')
@Check(
  'CK_periodicite_unite',
  `"unite" IN ('JOUR', 'SEMAINE', 'MOIS', 'ANNEE')`,
)
export class Periodicite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Code (unique) — ex. JOURNALIER, MENSUEL, ANNUEL. TODO : valider le domaine. */
  @Column({ length: 20, unique: true })
  code: string;

  @Column({ length: 100 })
  libelle: string;

  /** Unité d'articulation — domaine valide : JOUR / SEMAINE / MOIS / ANNEE. */
  @Column({ length: 10 })
  unite: string;

  /** Nombre d'unités par période (ex. 1 MOIS, 12 MOIS pour l'annuel). */
  @Column({ type: 'int' })
  nbUnites: number;

  /** Permet de désactiver une périodicité sans la supprimer. */
  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
