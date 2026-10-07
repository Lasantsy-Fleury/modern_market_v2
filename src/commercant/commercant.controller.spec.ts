import { Test, TestingModule } from '@nestjs/testing';
import { CommercantController } from './commercant.controller';
import { CommercantService } from './commercant.service';

describe('CommercantController', () => {
  let controller: CommercantController;
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    getHistorique: jest.fn(),
    getActivite: jest.fn(),
    getEmplacements: jest.fn(),
    getPresences: jest.fn(),
    getSituationFinanciere: jest.fn(),
    getPaiements: jest.fn(),
    getQuittances: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommercantController],
      providers: [{ provide: CommercantService, useValue: service }],
    }).compile();

    controller = module.get<CommercantController>(CommercantController);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  it('fournit les 12 endpoints du commerçant', () => {
    const id = 'uuid-1';
    controller.create({} as any);
    controller.findAll({} as any);
    controller.findOne(id);
    controller.update(id, {} as any);
    controller.getHistorique(id);
    controller.getActivite(id);
    controller.getEmplacements(id);
    controller.getPresences(id);
    controller.getSituationFinanciere(id);
    controller.getPaiements(id);
    controller.getQuittances(id);

    expect(service.create).toHaveBeenCalled();
    expect(service.findAll).toHaveBeenCalled();
    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(service.update).toHaveBeenCalled();
    expect(service.getHistorique).toHaveBeenCalledWith(id);
    expect(service.getActivite).toHaveBeenCalledWith(id);
    expect(service.getEmplacements).toHaveBeenCalledWith(id);
    expect(service.getPresences).toHaveBeenCalledWith(id);
    expect(service.getSituationFinanciere).toHaveBeenCalledWith(id);
    expect(service.getPaiements).toHaveBeenCalledWith(id);
    expect(service.getQuittances).toHaveBeenCalledWith(id);
  });
});
