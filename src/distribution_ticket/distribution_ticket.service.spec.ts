import { Test, TestingModule } from '@nestjs/testing';
import { DistributionTicketService } from './distribution_ticket.service';

describe('DistributionTicketService', () => {
  let service: DistributionTicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributionTicketService],
    }).compile();

    service = module.get<DistributionTicketService>(DistributionTicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
