import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Paiement } from "src/paiement/entities/paiement.entity";
import { Location } from "src/location/entities/location.entity";
@Entity('paiement_location')
export class Paiementlocation {
    @PrimaryGeneratedColumn()
    id_paiement_location: number;

    @ManyToOne(() => Location, (Location) => Location.paiement_locations, { onDelete: 'CASCADE' })
    location: Location;

    @ManyToOne(() => Paiement, (Paiement) => Paiement.paiement_locations, { onDelete: 'CASCADE' })
    paiement: Paiement;

    // @CreateDateColumn({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP', })
    // date_paiement: Date;



}
