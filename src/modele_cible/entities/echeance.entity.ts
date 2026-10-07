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
import { Location } from '../../location/entities/location.entity';
import { TypeDroit } from './type_droit.entity';
import { Commercant } from './commercant.entity';

/**
 * Échéance — occurrence planifiée d'une obligation (modèle cible, Phase P0).
 *
 * Générée (ultérieurement) à partir d'une affectation + d'un droit +
 * d'une périodicité. L'index unique UQ_echeance_periode garantit
 * l'idempotence de génération (jamais deux échéances pour la même période).
 *
 * Table vide en P0 : AUCUNE génération, AUCUN montant calculé.
 * - montantTheorique : gel du tarif à la génération (règle de gel = TODO) ;
 * - statut / source : domaines de valeurs à valider (TODO), sans défaut
 *   implicite — P0 n'écrit aucune ligne.
 *
 * FK location en cascade : location est supprimable par les flux existants
 * (suppression en chaîne via local) — ne jamais bloquer un flux existant.
 */
@Entity('echeance')
@Index(
  'UQ_echeance_periode',
  ['locationId', 'typeDroitId', 'periodeDebut', 'periodeFin'],
  { unique: true },
)
@Check('CK_echeance_montant_theorique', '"montantTheorique" >= 0')
@Check('CK_echeance_dates', '"periodeDebut" <= "periodeFin"')
@Check(
  'CK_echeance_statut',
  `"statut" IN ('PLANIFIEE', 'PARTIELLE', 'PAYEE', 'EN_RETARD', 'ANNULEE')`,
)
@Check('CK_echeance_source', `"source" IN ('AUTO', 'MANUEL')`)
export class Echeance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  locationId: string;

  @ManyToOne(() => Location, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ type: 'uuid' })
  commercantId: string;

  @ManyToOne(() => Commercant, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'commercantId' })
  commercant: Commercant;

  @Column({ type: 'uuid' })
  typeDroitId: string;

  @ManyToOne(() => TypeDroit, { nullable: false })
  @JoinColumn({ name: 'typeDroitId' })
  typeDroit: TypeDroit;

  @Column({ type: 'date' })
  periodeDebut: Date;

  @Column({ type: 'date' })
  periodeFin: Date;

  @Column({ type: 'date' })
  dateEcheance: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montantTheorique: number;

  /** TODO : domaine de statuts à valider — aucune valeur par défaut (règle non validée). */
  @Column({ length: 30 })
  statut: string;

  /** TODO : domaine à valider (ex. AUTO / MANUEL). */
  @Column({ length: 20 })
  source: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
