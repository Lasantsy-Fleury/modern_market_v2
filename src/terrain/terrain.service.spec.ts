import { TerrainService } from './terrain.service';
import { distanceMetresGPS } from './geo.util';

const mockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

describe('TerrainService — évaluations de contrôle', () => {
  let service: TerrainService;
  let presenceRepository: ReturnType<typeof mockRepo>;
  let controleRepository: ReturnType<typeof mockRepo>;
  let commercantRepository: ReturnType<typeof mockRepo>;
  let zoneRepository: ReturnType<typeof mockRepo>;
  let localRepository: ReturnType<typeof mockRepo>;
  let callAgentRepository: ReturnType<typeof mockRepo>;
  let parametreRepository: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    presenceRepository = mockRepo();
    controleRepository = mockRepo();
    commercantRepository = mockRepo();
    zoneRepository = mockRepo();
    localRepository = mockRepo();
    callAgentRepository = mockRepo();
    parametreRepository = mockRepo();

    service = new TerrainService(
      presenceRepository as any,
      controleRepository as any,
      commercantRepository as any,
      zoneRepository as any,
      localRepository as any,
      callAgentRepository as any,
      parametreRepository as any,
    );

    // Stubs de validation d'existence — agent/zone/commercant présents
    callAgentRepository.findOne.mockResolvedValue({ id: 'a1' });
    zoneRepository.findOne.mockResolvedValue({ id_zone: 'z1' });
    commercantRepository.findOne.mockResolvedValue({ id: 'c1' });
    controleRepository.save.mockImplementation((x) => Promise.resolve(x));
    controleRepository.create.mockImplementation((x) => x);
    parametreRepository.findOne.mockResolvedValue(null);
  });

  it('GPS indisponible → résultat GPS_INDISPONIBLE', async () => {
    const res = await service.createControle({ agentId: 'a1', zoneId: 'z1' } as any);
    expect(res.resultat).toBe('GPS_INDISPONIBLE');
  });

  it('faible précision → FAIBLE_PRECISION', async () => {
    const res = await service.createControle({
      agentId: 'a1', zoneId: 'z1', latitude: -18.9, longitude: 47.5, precisionGps: 500,
    } as any);
    expect(res.resultat).toBe('FAIBLE_PRECISION');
  });

  it('comparaison non autorisée → CONTROLE_MANUEL (preuve GPS non utilisée)', async () => {
    const res = await service.createControle({
      agentId: 'a1', zoneId: 'z1', latitude: -18.9, longitude: 47.5,
      comparerPosition: false,
    } as any);
    expect(res.resultat).toBe('CONTROLE_MANUEL');
  });

  it('commerçant sans emplacement fixe → SANS_EMPLACEMENT_FIXE', async () => {
    const res = await service.createControle({
      agentId: 'a1', zoneId: 'z1', latitude: -18.9, longitude: 47.5,
    } as any);
    expect(res.resultat).toBe('SANS_EMPLACEMENT_FIXE');
  });

  it('position concordante → CONFORME', async () => {
    localRepository.findOne.mockResolvedValue({
      id_local: 'l1', latitude: -18.90001, longitude: 47.50001,
    });
    const res = await service.createControle({
      agentId: 'a1', zoneId: 'z1', localId: 'l1', latitude: -18.9, longitude: 47.5,
    } as any);
    expect(res.resultat).toBe('CONFORME');
    expect(res.typeAnomalie).toBeNull();
  });

  it('emplacement différent → HORS_ZONE avec anomalie', async () => {
    localRepository.findOne.mockResolvedValue({
      id_local: 'l1', latitude: -18.0, longitude: 47.0,
    });
    const res = await service.createControle({
      agentId: 'a1', zoneId: 'z1', localId: 'l1', latitude: -18.9, longitude: 47.5,
    } as any);
    expect(res.resultat).toBe('HORS_ZONE');
    expect(res.typeAnomalie).toBe('HORS_ZONE');
  });

  it('distance haversine deux points proches ≈ 1,3 km', () => {
    const d = distanceMetresGPS(-18.9, 47.5, -18.89, 47.5);
    expect(d).toBeGreaterThan(1000);
    expect(d).toBeLessThan(1500);
  });
});
