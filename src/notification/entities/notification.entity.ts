import { Entity, PrimaryGeneratedColumn, Column, OneToMany,CreateDateColumn ,UpdateDateColumn,ManyToOne,JoinColumn} from "typeorm";

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id_notification: string;

  // Utilisateur concerné
  @Column({ type: 'uuid' })
  userId: string;

  // Type de notification
  @Column({ 
    type: 'enum', 
    enum: [
      'LOCATION CONFIRMEE', 
      'LOCATION ANNULEE',
      'PAIEMENT REUSSIE', 
      'PAIEMENT NON REUSSIE',
      'PAIEMENT EN ATTENTE',
      'RAPPELLE DE PAIEMENT',
      'RAPPELLE D EVENEMENT',
      'STATUT MIS A JOUR',
      'SYSTEM_MAINTENANCE'
    ]
  })
  type: string;

  // Titre court
  @Column({ length: 100 })
  title: string;

  // Message détaillé
  @Column({ type: 'text' })
  message: string;

  // Données contextuelles (JSON)
  @Column({ type: 'jsonb', nullable: true })
  data: {
    id_location?: string;
    id_paiement?: string;
    id_paiement_location?:string;
    localId?: string;
    montant?: number;
    dueDate?: string;
    [key: string]: any;
  };

  // Statuts
  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  // Priorité
  @Column({ 
    type: 'enum', 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  })
  priority: string;

  // Canaux de diffusion
  @Column({ type: 'jsonb', default: { inApp: true, email: false, sms: false } })
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };


  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date; // Pour les notifications programmées

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


}