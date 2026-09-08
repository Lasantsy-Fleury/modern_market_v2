import { Test, TestingModule } from '@nestjs/testing';
import { TypeLocalController } from './type_locale.controller';
import { TypeLocalService } from './type_locale.service';

describe('TypeLocaleController', () => {
  let controller: TypeLocalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeLocalController],
      providers: [TypeLocalService],
    }).compile();

    controller = module.get<TypeLocalController>(TypeLocalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
