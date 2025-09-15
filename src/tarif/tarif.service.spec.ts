import { Test, TestingModule } from '@nestjs/testing';
import { TarifService } from './tarif.service';

describe('TarifService', () => {
  let service: TarifService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TarifService],
    }).compile();

    service = module.get<TarifService>(TarifService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
