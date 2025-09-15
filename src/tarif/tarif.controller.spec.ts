import { Test, TestingModule } from '@nestjs/testing';
import { TarifController } from './tarif.controller';
import { TarifService } from './tarif.service';

describe('TarifController', () => {
  let controller: TarifController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarifController],
      providers: [TarifService],
    }).compile();

    controller = module.get<TarifController>(TarifController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
