import { Test, TestingModule } from '@nestjs/testing';
import { DistributionZoneController } from './distribution_zone.controller';
import { DistributionZoneService } from './distribution_zone.service';

describe('DistributionZoneController', () => {
  let controller: DistributionZoneController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionZoneController],
      providers: [DistributionZoneService],
    }).compile();

    controller = module.get<DistributionZoneController>(DistributionZoneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
