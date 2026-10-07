import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DroitsService } from './droits.service';

const mockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('DroitsService', () => {
  let service: DroitsService;
  let periodiciteRepository: ReturnType<typeof mockRepo>;
  let typeDroitRepository: ReturnType<typeof mockRepo>;
  let tarifRepository: ReturnType<typeof mockRepo>;
  let activiteRepository: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    periodiciteRepository = mockRepo();
    typeDroitRepository = mockRepo();
    tarifRepository = mockRepo();
    activiteRepository = mockRepo();

    service = new DroitsService(
      periodiciteRepository as any,
      typeDroitRepository as any,
      tarifRepository as any,
      activiteRepository as any,
    );
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  it('createPeriodicite refuse un code déjà utilisé', async () => {
    periodiciteRepository.findOne.mockResolvedValue({ id: 'p1' });
    await expect(
      service.createPeriodicite({ code: 'MENSUELLE' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('createTypeDroit refuse une périodicité inactive', async () => {
    periodiciteRepository.findOne.mockResolvedValue({ id: 'p1', code: 'MENSUELLE', actif: false });
    await expect(
      service.createTypeDroit({ code: 'D1', periodiciteId: 'p1' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createTarif refuse un type de droit inactif', async () => {
    typeDroitRepository.findOne.mockResolvedValue({ id: 't1', code: 'D1', actif: false });
    await expect(
      service.createTarif({ typeDroitId: 't1' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createTarif exige une dimension de portée', async () => {
    typeDroitRepository.findOne.mockResolvedValue({ id: 't1', code: 'D1', actif: true });
    await expect(
      service.createTarif({
        typeDroitId: 't1',
        montant: 100,
        dateDebut: '2026-01-01',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createTarif refuse dateDebut > dateFin', async () => {
    typeDroitRepository.findOne.mockResolvedValue({ id: 't1', code: 'D1', actif: true });
    await expect(
      service.createTarif({
        typeDroitId: 't1',
        montant: 100,
        zoneId: 'z1',
        dateDebut: '2026-12-31',
        dateFin: '2026-01-01',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createTarif refuse le doublon chevauchant la même portée/période', async () => {
    typeDroitRepository.findOne.mockResolvedValue({ id: 't1', code: 'D1', actif: true });
    tarifRepository.find.mockResolvedValue([
      {
        id: 'x',
        actif: true,
        dateDebut: new Date('2026-01-01'),
        dateFin: new Date('2026-06-30'),
      },
    ]);
    await expect(
      service.createTarif({
        typeDroitId: 't1',
        zoneId: 'z1',
        montant: 100,
        dateDebut: '2026-03-01',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('createTarif accepte une dimension valide sans chevauchement', async () => {
    typeDroitRepository.findOne.mockResolvedValue({ id: 't1', code: 'D1', actif: true });
    tarifRepository.find.mockResolvedValue([
      {
        id: 'x',
        actif: true,
        dateDebut: new Date('2026-01-01'),
        dateFin: new Date('2026-06-30'),
      },
    ]);
    const cree = { id: 'new' };
    tarifRepository.create.mockReturnValue(cree);
    tarifRepository.save.mockResolvedValue(cree);
    await expect(
      service.createTarif({
        typeDroitId: 't1',
        zoneId: 'z1',
        montant: 100,
        dateDebut: '2026-07-01',
      } as any),
    ).resolves.toEqual(cree);
  });

  it('resoudreTarifs filtre actif=true et la période de validité', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 't1' }]),
    };
    tarifRepository.createQueryBuilder.mockReturnValue(qb);
    await expect(service.resoudreTarifs({ date: '2026-10-07' } as any)).resolves.toEqual([{ id: 't1' }]);
    expect(qb.where).toHaveBeenCalledWith('t.actif = :actif', { actif: true });
    expect(qb.andWhere).toHaveBeenCalledWith('t.dateDebut <= :date', expect.any(Object));
    expect(qb.andWhere).toHaveBeenCalledWith('(t.dateFin IS NULL OR t.dateFin >= :date)', expect.any(Object));
  });

  it('updateTypeDroit refuse de modifier vers un code existant', async () => {
    typeDroitRepository.findOne
      .mockResolvedValueOnce({ id: 't1', code: 'D1', periodicite: {} }) // findOneTypeDroit
      .mockResolvedValueOnce({ id: 't2', code: 'D2' }); // doublon
    await expect(
      service.updateTypeDroit('t1', { code: 'D2' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findOnePeriodicite lève NotFoundException si absente', async () => {
    periodiciteRepository.findOne.mockResolvedValue(null);
    await expect(service.findOnePeriodicite('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
