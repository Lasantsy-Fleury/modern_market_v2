import { Test, TestingModule } from '@nestjs/testing';
import { PaiementLocationController } from './paiement_location.controller';
import { PaiementLocationService } from './paiement_location.service';

describe('PaiementLocationController', () => {
  let controller: PaiementLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaiementLocationController],
      providers: [PaiementLocationService],
    }).compile();

    controller = module.get<PaiementLocationController>(PaiementLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
