import { SuiviService } from './suivi.service';

const makeQb = (rawOne: any = { t: 0, n: 0 }, rawMany: any[] = []) => {
  const qb: any = {
    select: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue(rawOne),
    getRawMany: jest.fn().mockResolvedValue(rawMany),
    getCount: jest.fn().mockResolvedValue(rawMany.length),
    getMany: jest.fn().mockResolvedValue(rawMany),
    getManyAndCount: jest.fn().mockResolvedValue([rawMany, rawMany.length]),
  };
  return qb;
};

describe('SuiviService — agrégations backend', () => {
  let service: SuiviService;
  let recetteRepository: any;
  let redevanceRepository: any;
  let paiementRepository: any;
  let quittanceRepository: any;
  let presenceRepository: any;
  let controleRepository: any;
  let commercantRepository: any;
  let echeanceRepository: any;

  beforeEach(() => {
    recetteRepository = { createQueryBuilder: jest.fn(), count: jest.fn() };
    redevanceRepository = { createQueryBuilder: jest.fn() };
    paiementRepository = { createQueryBuilder: jest.fn() };
    quittanceRepository = { createQueryBuilder: jest.fn() };
    presenceRepository = { createQueryBuilder: jest.fn() };
    controleRepository = { createQueryBuilder: jest.fn() };
    commercantRepository = { count: jest.fn().mockResolvedValue(12) };
    echeanceRepository = { createQueryBuilder: jest.fn() };

    service = new SuiviService(
      recetteRepository,
      redevanceRepository,
      paiementRepository,
      quittanceRepository,
      presenceRepository,
      controleRepository,
      commercantRepository,
      echeanceRepository,
    );
  });

  it('getRecettesAgregat retourne jour/mois/année depuis SUM(montant)', async () => {
    let call = 0;
    const values = [{ total: 3000 }, { total: 15000 }, { total: 200000 }];
    recetteRepository.createQueryBuilder.mockImplementation(() => {
      const qb = makeQb(values[call++] ?? { total: 0 });
      return qb;
    });
    const res = await service.getRecettesAgregat({});
    expect(res).toEqual({ jour: 3000, mois: 15000, annee: 200000 });
  });

  it('getSituationFinanciere classe impayés/retards/partiels via le calcul centralisé', async () => {
    redevanceRepository.createQueryBuilder.mockImplementation(() =>
      makeQb(null, []).getMany ? {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { montantDu: 1000, montantRegle: 1000, statut: 'SOLDEE', echeance: {} },
          { montantDu: 1000, montantRegle: 400, statut: 'PARTIELLE', echeance: { dateEcheance: new Date('2026-09-30') } }, // retard
          { montantDu: 1000, montantRegle: 0, statut: 'OUVERTE', echeance: { dateEcheance: new Date('2026-12-31') } },   // à échéance
          { montantDu: 1000, montantRegle: 400, statut: 'PARTIELLE', echeance: { dateEcheance: new Date('2026-12-31') } }, // partiel
        ]),
      } : null as any,
    );
    const res = await service.getSituationFinanciere({});
    expect(res.montantAttendu).toBe(4000);
    expect(res.montantEncaisse).toBe(1800);
    expect(res.retards.nombre).toBe(1);
    expect(res.retards.montant).toBe(600);
    expect(res.paiementsPartiels.nombre).toBe(1);
    expect(res.impayes.nombre).toBe(1);
  });

  it('getActivite compte distincts pour présences/contrôles et quittances émises', async () => {
    presenceRepository.createQueryBuilder.mockImplementation(() => makeQb({ n: '7' }));
    controleRepository.createQueryBuilder.mockImplementation(() => makeQb({ n: '5' }));
    echeanceRepository.createQueryBuilder.mockImplementation(() => ({
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(3),
    } as any));
    quittanceRepository.createQueryBuilder.mockImplementation(() => {
      const qb: any = makeQb(null);
      qb.getCount = jest.fn().mockResolvedValue(9);
      return qb;
    });
    const res = await service.getActivite({});
    expect(res).toEqual({
      nombreCommercants: 12,
      commercantsPresents: 7,
      commercantsControles: 5,
      ticketsDelivres: 3,
      quittancesEmises: 9,
    });
  });

  it('getRapprochement compare 4 agrégats et signale la cohérence', async () => {
    let pCall = 0;
    paiementRepository.createQueryBuilder.mockImplementation(() => makeQb({ t: 5000 }));
    quittanceRepository.createQueryBuilder.mockImplementation(() => makeQb({ t: 5000 }));
    recetteRepository.createQueryBuilder.mockImplementation(() => makeQb({ t: 5000 }));
    const res = await service.getRapprochement({});
    expect(res.paiementsEnregistres).toBe(5000);
    expect(res.quittances).toBe(5000);
    expect(res.recettes).toBe(5000);
    expect(res.coherent).toBe(true);
  });

  it('getRecettesDetails pagine', async () => {
    const qb: any = makeQb(null, [{ montant: 10 }, { montant: 20 }]);
    recetteRepository.createQueryBuilder.mockImplementation(() => qb);
    const res = await service.getRecettesDetails({ page: 2, limit: 2 });
    expect(res.page).toBe(2);
    expect(res.limit).toBe(2);
    expect(res.total).toBe(2);
  });
});
