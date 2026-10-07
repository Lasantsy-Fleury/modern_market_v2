import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { QuittanceService, calculerJetonQuittance } from './quittance.service';

const mockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn((v) => Promise.resolve(v)),
  create: jest.fn((v) => v),
  update: jest.fn(),
});

describe('QuittanceService', () => {
  let service: QuittanceService;
  let quittanceRepository: ReturnType<typeof mockRepo>;
  let paiementRepository: ReturnType<typeof mockRepo>;
  let auditLogRepository: ReturnType<typeof mockRepo>;
  let redevanceRepository: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    quittanceRepository = mockRepo();
    paiementRepository = mockRepo();
    auditLogRepository = mockRepo();
    redevanceRepository = mockRepo();
    service = new QuittanceService(
      quittanceRepository as any,
      paiementRepository as any,
      auditLogRepository as any,
      redevanceRepository as any,
    );
  });

  it('findOne lève NotFoundException si absente', async () => {
    quittanceRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('calculerJetonQuittance est déterministe pour les mêmes données', () => {
    const d = { numero: 'N1', paiementId: 'p1', montant: 100, dateEmission: '2026-10-07T00:00:00.000Z' };
    expect(calculerJetonQuittance(d)).toBe(calculerJetonQuittance(d));
  });

  it('annuler marque la quittance ANNULLEE et écrit un audit', async () => {
    quittanceRepository.findOne.mockResolvedValue({ id: 'q1', statut: 'EMISE', numero: 'N1' });
    const res = await service.annuler('q1', 'erreur de saisie', 'agent1');
    expect(res.statut).toBe('ANNULEE');
    expect(auditLogRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ tableName: 'quittance', recordId: 'q1', action: 'MODIFICATION', operation: 'ANNULATION' }),
    );
  });

  it('annuler deux fois → BadRequestException', async () => {
    quittanceRepository.findOne.mockResolvedValue({ id: 'q1', statut: 'ANNULEE' });
    await expect(service.annuler('q1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('corriger une quittance annulée → ForbiddenException', async () => {
    quittanceRepository.findOne.mockResolvedValue({ id: 'q1', statut: 'ANNULEE' });
    await expect(service.corriger('q1', { documentUrl: 'x' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('historique retourne les entrées d\'audit les plus récentes', async () => {
    quittanceRepository.findOne.mockResolvedValue({ id: 'q1', statut: 'EMISE' });
    auditLogRepository.find.mockResolvedValue([{ operation: 'CREATION' }]);
    await expect(service.historique('q1')).resolves.toEqual([{ operation: 'CREATION' }]);
    expect(auditLogRepository.find).toHaveBeenCalledWith({
      where: { tableName: 'quittance', recordId: 'q1' },
      order: { createdAt: 'DESC' },
    });
  });

  it('verifierAuthenticite : token correct → authentique', async () => {
    const dateEmission = new Date('2026-10-07T00:00:00.000Z');
    quittanceRepository.findOne.mockResolvedValue({
      id: 'q1', numero: 'N1', paiementId: 'p1', montant: 100, dateEmission, statut: 'EMISE',
      qrToken: calculerJetonQuittance({ numero: 'N1', paiementId: 'p1', montant: 100, dateEmission }),
    });
    const attendu = calculerJetonQuittance({ numero: 'N1', paiementId: 'p1', montant: 100, dateEmission });
    const res = await service.verifierAuthenticite('N1', attendu);
    expect(res.authentique).toBe(true);
    expect(res.tokenTransmisValide).toBe(true);
  });
});
