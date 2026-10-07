import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Commune — référentiel territorial du modèle métier cible (Phase P0).
 *
 * Miroir local du service territoire : `codeExt` correspond à la valeur
 * historique `zone.municipalityId`. Aucune donnée n'est migrée en P0.
 *
 * Voir docs/modele_metier_cible.md.
 */
@Entity('commune')
export class Commune {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Identifiant externe de la commune (= valeur de zone.municipalityId). */
  @Column({ length: 100, unique: true })
  codeExt: string;

  /** Nom affichable (nullable — renseigné lors de la constitution du référentiel). */
  @Column({ type: 'varchar', length: 255, nullable: true })
  nom: string | null;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
