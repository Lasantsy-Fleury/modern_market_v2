import { Test, TestingModule } from '@nestjs/testing';
import { TypeLocaleService } from './type_locale.service';

describe('TypeLocaleService', () => {
  let service: TypeLocaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeLocaleService],
    }).compile();

    service = module.get<TypeLocaleService>(TypeLocaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
