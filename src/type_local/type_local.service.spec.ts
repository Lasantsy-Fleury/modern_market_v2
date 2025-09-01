import { Test, TestingModule } from '@nestjs/testing';
import { TypeLocalService } from './type_local.service';

describe('TypeLocalService', () => {
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
