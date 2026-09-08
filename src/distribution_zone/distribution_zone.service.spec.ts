import { Test, TestingModule } from '@nestjs/testing';
import { DistributionZoneService } from './distribution_zone.service';

describe('DistributionZoneService', () => {
  let service: DistributionZoneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributionZoneService],
    }).compile();

    service = module.get<DistributionZoneService>(DistributionZoneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
