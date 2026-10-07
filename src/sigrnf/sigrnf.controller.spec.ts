import { Test, TestingModule } from '@nestjs/testing';
import { SigrnfController } from './sigrnf.controller';
import { SigrnfService } from './sigrnf.service';

describe('SigrnfController', () => {
  let controller: SigrnfController;

  const service = {
    getStatus: jest.fn(() => ({ enabled: false, configured: false })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SigrnfController],
      providers: [{ provide: SigrnfService, useValue: service }],
    }).compile();

    controller = module.get<SigrnfController>(SigrnfController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('retourne uniquement enabled/configured', () => {
    expect(controller.getStatus()).toEqual({
      enabled: false,
      configured: false,
    });
    expect(service.getStatus).toHaveBeenCalled();
    expect(Object.keys(controller.getStatus()).sort()).toEqual([
      'configured',
      'enabled',
    ]);
  });
});
