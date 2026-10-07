import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Commune } from './commune.entity';

/**
 * Marché — hiérarchie cible : Commune → Marché → Zone → Emplacement (Phase P0).
 *
 * Aucune donnée n'est migrée en P0 : `zone.marcheId` reste NULL tant que la
 * stratégie de backfill n'est pas validée (voir docs/modele_metier_cible.md).
 *
 * Aucune suppression de commune/marché n'existe dans les flux actuels :
 * la FK reste donc en mode protecteur (NO ACTION par défaut).
 */
@Entity('marche')
@Index('UQ_marche_commune_nom', ['communeId', 'nom'], { unique: true })
export class Marche {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  communeId: string;

  @ManyToOne(() => Commune, { nullable: false })
  @JoinColumn({ name: 'communeId' })
  commune: Commune;

  @Column({ length: 255 })
  nom: string;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
