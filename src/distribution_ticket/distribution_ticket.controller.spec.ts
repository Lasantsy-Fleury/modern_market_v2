import { Test, TestingModule } from '@nestjs/testing';
import { DistributionTicketController } from './distribution_ticket.controller';
import { DistributionTicketService } from './distribution_ticket.service';

describe('DistributionTicketController', () => {
  let controller: DistributionTicketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionTicketController],
      providers: [DistributionTicketService],
    }).compile();

    controller = module.get<DistributionTicketController>(DistributionTicketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
