import { Test, TestingModule } from '@nestjs/testing';
import { TypeLocaleController } from './type_locale.controller';
import { TypeLocaleService } from './type_locale.service';

describe('TypeLocaleController', () => {
  let controller: TypeLocaleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeLocaleController],
      providers: [TypeLocaleService],
    }).compile();

    controller = module.get<TypeLocaleController>(TypeLocaleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
