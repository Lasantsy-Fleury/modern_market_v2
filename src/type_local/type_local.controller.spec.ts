import { Test, TestingModule } from '@nestjs/testing';
import { TypeLocalController } from './type_local.controller';
import { TypeLocalService } from './type_local.service';

describe('TypeLocalController', () => {
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
