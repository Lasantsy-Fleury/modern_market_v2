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
import { TypeDroit } from './type_droit.entity';
import { Typelocal } from '../../type_local/entities/type_locale.entity';
import { Zone } from '../../zone/entities/zone.entity';
import { Marche } from './marche.entity';
import { Local } from '../../local/entities/local.entity';
import { ActiviteCommerciale } from './activite_commerciale.entity';
import { Periodicite } from './periodicite.entity';

/**
 * Tarif — configuration chiffrée d'un droit (modèle cible).
 *
 * Dimensions configurables (conformes à la demande) :
 * - marché (marcheId)
 * - zone (zoneId)
 * - emplacement/local (localId)
 * - type d'activité (activiteId)
 * - type de droit (typeDroitId) — obligatoire
 * - périodicité (periodiciteId)
 * - convention éventuelle (convention)
 *
 * Politique de portée : au moins l'une des dimensions territoriales/contextuelles
 * doit être renseignée (CK_tarif_portee). Cette contrainte est intentionnellement
 * souple (P0) pour permettre une évolution progressive sans casser les données.
 * Aucun montant arbitraire codé en dur.
 */
@Entity('tarif')
@Check(
  'CK_tarif_portee',
  '"typelocalId" IS NOT NULL OR "zoneId" IS NOT NULL OR "marcheId" IS NOT NULL OR "localId" IS NOT NULL OR "activiteId" IS NOT NULL',
)
@Check('CK_tarif_montant_positif', '"montant" >= 0')
@Check(
  'CK_tarif_dates',
  '"dateFin" IS NULL OR "dateDebut" <= "dateFin"',
)
@Index('IX_tarif_droit', ['typeDroitId'])
@Index('IX_tarif_zone', ['zoneId'])
@Index('IX_tarif_marche', ['marcheId'])
@Index('IX_tarif_local', ['localId'])
@Index('IX_tarif_typelocal', ['typelocalId'])
@Index('IX_tarif_activite', ['activiteId'])
@Index('IX_tarif_periodicite', ['periodiciteId'])
@Index('IX_tarif_dates', ['dateDebut', 'dateFin'])
export class Tarif {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  typeDroitId: string;

  @ManyToOne(() => TypeDroit, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'typeDroitId' })
  typeDroit: TypeDroit;

  @Column({ type: 'uuid', nullable: true })
  periodiciteId: string | null;

  @ManyToOne(() => Periodicite, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'periodiciteId' })
  periodicite: Periodicite | null;

  @Column({ type: 'uuid', nullable: true })
  typelocalId: string | null;

  @ManyToOne(() => Typelocal, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'typelocalId' })
  typelocal: Typelocal | null;

  @Column({ type: 'uuid', nullable: true })
  zoneId: string | null;

  @ManyToOne(() => Zone, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'zoneId' })
  zone: Zone | null;

  @Column({ type: 'uuid', nullable: true })
  marcheId: string | null;

  @ManyToOne(() => Marche, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'marcheId' })
  marche: Marche | null;

  @Column({ type: 'uuid', nullable: true })
  localId: string | null;

  @ManyToOne(() => Local, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'localId' })
  local: Local | null;

  @Column({ type: 'uuid', nullable: true })
  activiteId: string | null;

  @ManyToOne(() => ActiviteCommerciale, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'activiteId' })
  activite: ActiviteCommerciale | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  convention: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montant: number;

  @Column({ type: 'varchar', length: 3, nullable: true })
  devise: string | null;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date', nullable: true })
  dateFin: Date | null;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
