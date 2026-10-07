import { NotFoundException } from '@nestjs/common';
import { CommercantService } from './commercant.service';

const mockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('CommercantService', () => {
  let service: CommercantService;
  let commercantRepository: ReturnType<typeof mockRepo>;
  let auditLogRepository: ReturnType<typeof mockRepo>;
  let redevanceRepository: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    commercantRepository = mockRepo();
    auditLogRepository = mockRepo();
    redevanceRepository = mockRepo();

    service = new CommercantService(
      commercantRepository as any,
      mockRepo() as any,
      mockRepo() as any,
      mockRepo() as any,
      redevanceRepository as any,
      mockRepo() as any,
      mockRepo() as any,
      auditLogRepository as any,
      mockRepo() as any,
      { get: jest.fn() } as any,
      { get: jest.fn().mockReturnValue('http://gateway') } as any,
    );
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  it("findOne lève NotFoundException si le commerçant n'existe pas", async () => {
    commercantRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne('inconnu')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findOne retourne le commerçant avec son activité', async () => {
    const commercant = { id: 'c1', activite: { id: 'a1' } };
    commercantRepository.findOne.mockResolvedValue(commercant);
    await expect(service.findOne('c1')).resolves.toEqual(commercant);
    expect(commercantRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'c1' },
      relations: ['activite'],
    });
  });

  it('getSituationFinanciere agrège montants et restant dû', async () => {
    commercantRepository.findOne.mockResolvedValue({ id: 'c1' });
    redevanceRepository.find.mockResolvedValue([
      { montantDu: '100', montantRegle: '40', statut: 'PARTIELLE' },
      { montantDu: '50', montantRegle: '50', statut: 'SOLDEE' },
    ]);
    const res = await service.getSituationFinanciere('c1');
    expect(res.totaux).toEqual({ montantDu: 150, montantRegle: 90, restantDu: 60 });
    expect(res.redevances).toHaveLength(2);
  });

  it("getHistorique retourne les entrées d'audit du commerçant, les plus récentes d'abord", async () => {
    commercantRepository.findOne.mockResolvedValue({ id: 'c1' });
    const items = [{ action: 'MODIFICATION' }, { action: 'CREATION' }];
    auditLogRepository.find.mockResolvedValue(items);
    await expect(service.getHistorique('c1')).resolves.toEqual(items);
    expect(auditLogRepository.find).toHaveBeenCalledWith({
      where: { tableName: 'commercant', recordId: 'c1' },
      order: { createdAt: 'DESC' },
    });
  });
});
