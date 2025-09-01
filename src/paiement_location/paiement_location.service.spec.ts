import { Test, TestingModule } from '@nestjs/testing';
import { PaiementLocationService } from './paiement_location.service';

describe('PaiementLocationService', () => {
  let service: PaiementLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaiementLocationService],
    }).compile();

    service = module.get<PaiementLocationService>(PaiementLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
