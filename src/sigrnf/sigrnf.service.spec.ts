import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SigrnfService, SIGRNF_EVENT_REVENUE_PAYMENT } from './sigrnf.service';
import { SigrnfSync } from './entities/sigrnf-sync.entity';
import { SIGRNF_ADAPTER } from './interfaces/sigrnf-adapter.interface';
import { RevenueEvent } from './interfaces/revenue-event.interface';
import { SIGRNF_CONFIG, SigrnfConfig } from './sigrnf.config';

describe('SigrnfService', () => {
  let service: SigrnfService;

  const repository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const adapter = {
    name: 'mock',
    sendRevenueEvent: jest.fn(),
  };
  /** Instantanés de chaque save(), le mock de create renvoyant l'objet source. */
  let savedStates: SigrnfSync[] = [];
  const config: SigrnfConfig = {
    enabled: true,
    baseUrl: 'https://sigrnf.example',
    timeoutMs: 10000,
    retryAttempts: 1,
  };

  const event: RevenueEvent = {
    reference: 'REC-2026-000145',
    amount: 10000,
    paymentDate: new Date('2026-10-07T00:00:00.000Z'),
    metadata: { id_paiement: '550e8400-e29b-41d4-a716-446655440003' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    savedStates = [];
    config.enabled = true;
    config.baseUrl = 'https://sigrnf.example';

    repository.findOne.mockResolvedValue(null);
    repository.find.mockResolvedValue([]);
    repository.create.mockImplementation((input: object) => ({ ...input }));
    repository.save.mockImplementation((entity: unknown) => {
      savedStates.push({ ...(entity as SigrnfSync) });
      return Promise.resolve(entity);
    });
    adapter.sendRevenueEvent.mockResolvedValue({ mocked: true });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigrnfService,
        { provide: getRepositoryToken(SigrnfSync), useValue: repository },
        { provide: SIGRNF_CONFIG, useValue: config },
        { provide: SIGRNF_ADAPTER, useValue: adapter },
      ],
    }).compile();

    service = module.get<SigrnfService>(SigrnfService);
  });

  // Test 1 — intégration désactivée
  it('ne fait aucun appel quand SIGRNF est désactivé', async () => {
    config.enabled = false;

    await service.handleRevenueEvent(event);

    expect(repository.findOne).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
    expect(adapter.sendRevenueEvent).not.toHaveBeenCalled();
    expect(service.getStatus()).toEqual({ enabled: false, configured: true });
  });

  // Test 2 — création d'un événement de synchronisation
  it('crée un événement de synchronisation PENDING pour un paiement valide', async () => {
    await service.handleRevenueEvent(event);

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: SIGRNF_EVENT_REVENUE_PAYMENT,
        localReference: 'REC-2026-000145',
        attemptCount: 0,
        payload: event,
      }),
    );
    // Premier enregistrement : PENDING avant tentative d'envoi.
    expect(savedStates[0]).toEqual(
      expect.objectContaining({ status: 'PENDING' }),
    );
  });

  // Test 3 — succès SIGRNF
  it('fait passer un événement de PENDING à SUCCESS quand l’adaptateur répond', async () => {
    await service.handleRevenueEvent(event);

    expect(adapter.sendRevenueEvent).toHaveBeenCalledTimes(1);
    const lastSave = savedStates[savedStates.length - 1];
    expect(lastSave.status).toBe('SUCCESS');
    expect(lastSave.errorMessage).toBeNull();
    expect(lastSave.sentAt).toBeInstanceOf(Date);
  });

  // Test 4 — erreur SIGRNF
  it('marque FAILED sans lever d’exception quand SIGRNF échoue', async () => {
    adapter.sendRevenueEvent.mockRejectedValue(
      new Error('Request failed with status code 503'),
    );

    await expect(service.handleRevenueEvent(event)).resolves.toBeUndefined();

    const lastSave = savedStates[savedStates.length - 1];
    expect(lastSave.status).toBe('FAILED');
    expect(lastSave.errorMessage).toContain('503');
  });

  // Test 5 — idempotence
  it('ne crée pas de deuxième synchronisation pour une référence déjà synchronisée', async () => {
    repository.findOne.mockResolvedValue({
      id: 'sync-1',
      eventType: SIGRNF_EVENT_REVENUE_PAYMENT,
      localReference: 'REC-2026-000145',
      status: 'SUCCESS',
      payload: event,
    });

    await service.handleRevenueEvent(event);

    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
    expect(adapter.sendRevenueEvent).not.toHaveBeenCalled();
  });

  it('réessaie les synchronisations PENDING/FAILED via la tâche périodique', async () => {
    const stale = {
      id: 'sync-2',
      eventType: SIGRNF_EVENT_REVENUE_PAYMENT,
      localReference: 'REC-2026-000146',
      status: 'FAILED',
      attemptCount: 1,
      payload: event,
    };
    repository.find.mockResolvedValue([stale]);

    await service.retryPendingSyncs();

    expect(adapter.sendRevenueEvent).toHaveBeenCalledTimes(1);
    const lastSave = savedStates[savedStates.length - 1];
    expect(lastSave.status).toBe('SUCCESS');
  });

  it('reste inerte quand l’intégration est désactivée (retry)', async () => {
    config.enabled = false;

    await service.retryPendingSyncs();

    expect(repository.find).not.toHaveBeenCalled();
    expect(adapter.sendRevenueEvent).not.toHaveBeenCalled();
  });

  it('n’expose aucun secret dans le statut', () => {
    expect(service.getStatus()).toEqual({ enabled: true, configured: true });
    expect(JSON.stringify(service.getStatus())).not.toContain('api');
    expect(Object.keys(service.getStatus()).sort()).toEqual([
      'configured',
      'enabled',
    ]);
  });
});
