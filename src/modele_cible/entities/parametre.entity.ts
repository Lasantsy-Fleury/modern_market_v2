import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Paramètre (règle métier configurable) — modèle cible, Phase P0.
 *
 * AUCUNE graine en P0 : les clés candidates sont documentées dans
 * docs/modele_metier_cible.md (DEVISE_DEFAUT, HORIZON_GENERATION_ECHEANCES,
 * MODES_PAIEMENT_AUTORISES, CANAL_AUTORISE_AGENT, CODES_ANOMALIE_CONTROLE,
 * PRIORITE_TARIF) — toutes sans valeurs, tant que non validées.
 *
 * NOTE : la règle de paiement partiel n'est PAS une clé de cette table —
 * c'est la colonne type_droit.peutPayerPartiel (DÉCISION C5).
 *
 * `scopeId` : sentinelle '' = sans portée particulière (évite l'ambiguïté
 * des index uniques sur colonnes NULL). `portee` : TODO domaine à valider
 * (ex. GLOBAL / COMMUNE / MARCHE).
 */
@Entity('parametre')
@Index('UQ_parametre_cle_portee_scope', ['cle', 'portee', 'scopeId'], {
  unique: true,
})
export class Parametre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  cle: string;

  @Column({ length: 20 })
  portee: string;

  @Column({ length: 50, default: '' })
  scopeId: string;

  @Column({ type: 'jsonb' })
  valeur: unknown;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
