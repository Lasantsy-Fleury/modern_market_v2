import { Module } from '@nestjs/common';
import { DistributionTicketService } from './distribution_ticket.service';
import { DistributionTicketController } from './distribution_ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionTicket } from './entities/distribution_ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DistributionTicket])],
  controllers: [DistributionTicketController],
  providers: [DistributionTicketService],
})
export class DistributionTicketModule {}
