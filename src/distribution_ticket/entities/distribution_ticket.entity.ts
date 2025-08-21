import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('Distribution_ticket')
export class DistributionTicket {
    @PrimaryGeneratedColumn()
    id_distribution_ticket : number ;

    @Column('decimal' , {precision: 9 , scale: 6 })
    latitude : number ;

    @Column('decimal' , {precision:9 , scale: 6 })
    longitude : number ;

    @Column()
    id_recus : number ;

    @Column({ type: 'timestamp'} )
    created_at : Date ;
}
