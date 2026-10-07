import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PerceptionService } from './perception.service';

const mockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

const mockManager = {
  create: jest.fn((_e: any, v: any) => v),
  save: jest.fn((v: any) => Promise.resolve(v)),
};

describe('PerceptionService.enregistrerPaiement — protections', () => {
  let service: PerceptionService;
  let paiementRepository: ReturnType<typeof mockRepo>;
  let redevanceRepository: ReturnType<typeof mockRepo>;
  let paiementRedevanceRepository: ReturnType<typeof mockRepo>;
  let recetteRepository: ReturnType<typeof mockRepo>;
  let quittanceRepository: ReturnType<typeof mockRepo>;
  let modePaiementRepository: ReturnType<typeof mockRepo>;
  let commercantRepository: ReturnType<typeof mockRepo>;
  let typeDroitRepository: ReturnType<typeof mockRepo>;
  let parametreRepository: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    paiementRepository = mockRepo();
    redevanceRepository = mockRepo();
    paiementRedevanceRepository = mockRepo();
    recetteRepository = mockRepo();
    quittanceRepository = mockRepo();
    modePaiementRepository = mockRepo();
    commercantRepository = mockRepo();
    typeDroitRepository = mockRepo();
    parametreRepository = mockRepo();

    service = new PerceptionService(
      paiementRepository as any,
      redevanceRepository as any,
      mockRepo() as any,
      paiementRedevanceRepository as any,
      recetteRepository as any,
      quittanceRepository as any,
      modePaiementRepository as any,
      commercantRepository as any,
      typeDroitRepository as any,
      parametreRepository as any,
      { manager: { transaction: (cb: any) => cb(mockManager) } } as any,
    );

    commercantRepository.findOne.mockResolvedValue({ id: 'c1', actif: true });
    modePaiementRepository.findOne.mockResolvedValue({ id: 'm1', code: 'ESPECES', actif: true });
  });

  const baseDto = {
    commercantId: 'c1',
    redevanceId: 'r1',
    montant: 100,
    source: 'TERRAIN',
    reference: 'REF-001',
  };

  it('redevance absente → NotFoundException', async () => {
    redevanceRepository.findOne.mockResolvedValue(null);
    await expect(service.enregistrerPaiement(baseDto as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('redevance déjà soldée → ConflictException (double paiement)', async () => {
    redevanceRepository.findOne.mockResolvedValue({
      id: 'r1', commercantId: 'c1', statut: 'SOLDEE', montantDu: 1000, montantRegle: 1000,
    });
    await expect(service.enregistrerPaiement(baseDto as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('redevance annulée → BadRequestException', async () => {
    redevanceRepository.findOne.mockResolvedValue({
      id: 'r1', commercantId: 'c1', statut: 'ANNULEE', montantDu: 1000, montantRegle: 0,
    });
    await expect(service.enregistrerPaiement(baseDto as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('typeDe Droit inactif → BadRequestException', async () => {
    redevanceRepository.findOne.mockResolvedValue({
      id: 'r1', commercantId: 'c1', statut: 'OUVERTE', montantDu: 1000, montantRegle: 0,
      echeance: { dateEcheance: new Date(), typeDroit: { actif: false } },
    });
    await expect(service.enregistrerPaiement(baseDto as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('surpaiement interdit par défaut → BadRequestException', async () => {
    redevanceRepository.findOne.mockResolvedValue({
      id: 'r1', commercantId: 'c1', statut: 'OUVERTE', montantDu: 150, montantRegle: 100,
    });
    parametreRepository.findOne.mockResolvedValue(null);
    await expect(service.enregistrerPaiement({ ...baseDto, montant: 100 } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('surpaiement autorisé via paramètre AUTISER_SURPAIEMENT=true', async () => {
    redevanceRepository.findOne.mockResolvedValue({
      id: 'r1', commercantId: 'c1', statut: 'OUVERTE', montantDu: 150, montantRegle: 100,
    });
    parametreRepository.findOne.mockResolvedValue({ cle: 'AUTISER_SURPAIEMENT', valeur: { valeur: true } });
    paiementRepository.findOne.mockResolvedValue(null);
    const p = { ...baseDto, montant: 100 };
    await service.enregistrerPaiement(p as any);
    expect(mockManager.save).toHaveBeenCalled();
  });

  it('référence dupliquée → ConflictException', async () => {
    redevanceRepository.findOne.mockResolvedValue({
      id: 'r1', commercantId: 'c1', statut: 'OUVERTE', montantDu: 1000, montantRegle: 0,
    });
    paiementRepository.findOne.mockResolvedValue({ id_paiement: 'p1' });
    await expect(service.enregistrerPaiement(baseDto as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('paiement validé immuable → ForbiddenException au PATCH', async () => {
    paiementRepository.findOne.mockResolvedValue({ id_paiement: 'p1', status: 'success' });
    paiementRepository.update = jest.fn();
    await expect(
      service.updatePaiement('p1', { status: 'success' } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
