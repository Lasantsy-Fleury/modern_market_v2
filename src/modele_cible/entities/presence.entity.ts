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
import { Zone } from '../../zone/entities/zone.entity';
import { Local } from '../../local/entities/local.entity';

/**
 * Présence du commerçant (traçabilité)
 */
@Entity('presence')
@Index('IX_presence_commercant_date', ['commercantId', 'datePresence'])
@Index('IX_presence_zone_date', ['zoneId', 'datePresence'])
@Check('CK_presence_source', `"source" IN ('GPS', 'MANUEL', 'SCAN')`)
export class Presence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  commercantId: string;

  @ManyToOne(() => Commercant, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'commercantId' })
  commercant: Commercant;

  @Column({ type: 'date' })
  datePresence: Date;

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

  @Column({ type: 'varchar', length: 30 })
  source: string;

  @Column({ type: 'decimal', precision: 12, scale: 6, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 6, nullable: true })
  longitude: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  precisionGps: number | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  horodatage: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
