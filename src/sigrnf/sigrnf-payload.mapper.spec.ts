import { toHttpPayload, toMockPayload } from './sigrnf-payload.mapper';
import { RevenueEvent } from './interfaces/revenue-event.interface';

describe('sigrnf-payload.mapper', () => {
  const event: RevenueEvent = {
    reference: 'REC-001',
    amount: 50000,
    paymentDate: new Date('2026-10-07T00:00:00.000Z'),
    revenueType: 'DROIT_MENSUEL',
    commercantReference: 'c1',
    obligationReference: 'r1',
    paymentReference: 'p1',
    agentReference: 'a1',
    receiptReference: 'q1',
    marketReference: 'm1',
    municipalityReference: 'mu1',
    placeReference: 'l1',
  };

  it('toMockPayload conserve le modèle interne', () => {
    expect(toMockPayload(event)).toBe(event);
  });

  it('toHttpPayload produit une structure déterministe, sans secrets', () => {
    const p1 = toHttpPayload(event);
    const p2 = toHttpPayload(event);
    expect(p1).toEqual(p2);
    expect(p1.internalReference).toBe('REC-001');
    expect(p1.paymentDate).toBe('2026-10-07T00:00:00.000Z');
    expect(JSON.stringify(p1)).not.toContain('password');
    expect(JSON.stringify(p1)).not.toContain('token');
  });
});
