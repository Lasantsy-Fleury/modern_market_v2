import { Test, TestingModule } from '@nestjs/testing';
import { TypeLocalService } from './type_locale.service';

describe('TypeLocaleService', () => {
  let service: TypeLocalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeLocalService],
    }).compile();

    service = module.get<TypeLocalService>(TypeLocalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
