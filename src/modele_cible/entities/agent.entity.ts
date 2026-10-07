import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Agent (collecteur / contrôleur) — modèle cible, Phase P0.
 *
 * `userId` : identifiant de l'utilisateur externe (gateway) si l'agent est
 * également utilisateur du système.
 *
 * Zone d'affectation : RÉUTILISATION de la table existante distribution_zone
 * (id_user = agent.userId, zoneId, status) — aucune FK ni table supplémentaire
 * n'est créée en P0 (décision documentée dans docs/modele_metier_cible.md).
 */
@Entity('agent')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Matricule de l'agent (unique). */
  @Column({ length: 50, unique: true })
  matricule: string;

  @Column({ type: 'uuid', unique: true, nullable: true })
  userId: string | null;

  @Column({ length: 255 })
  nomComplet: string;

  /** TODO : domaine de rôles à valider (ex. COLLECTEUR / CONTROLEUR). */
  @Column({ length: 30 })
  role: string;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
