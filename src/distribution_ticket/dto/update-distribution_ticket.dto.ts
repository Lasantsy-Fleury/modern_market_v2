import { PartialType } from '@nestjs/mapped-types';
import { CreateDistributionTicketDto } from './create-distribution_ticket.dto';

export class UpdateDistributionTicketDto extends PartialType(CreateDistributionTicketDto) {}
