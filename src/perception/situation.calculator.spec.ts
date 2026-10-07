import {
  calculerTotaux,
  evaluerSituation,
  SituationFinanciere,
} from './situation.calculator';

describe('evaluerSituation — calcul centralisé', () => {
  const base = { dateReference: '2026-10-07' };

  it('redevance annulée → NON_APPLICABLE', () => {
    expect(
      evaluerSituation({ montantDu: 1000, montantRegle: 0, statut: 'ANNULEE', ...base }),
    ).toBe(SituationFinanciere.NON_APPLICABLE);
  });

  it('dette à zéro → NON_APPLICABLE', () => {
    expect(
      evaluerSituation({ montantDu: 0, montantRegle: 0, statut: 'OUVERTE', ...base }),
    ).toBe(SituationFinanciere.NON_APPLICABLE);
  });

  it('totalement réglée → PAYEE', () => {
    expect(
      evaluerSituation({ montantDu: 1000, montantRegle: 1000, statut: 'SOLDEE', ...base }),
    ).toBe(SituationFinanciere.PAYEE);
  });

  it('partiellement réglée et échéance non passée → PARTIELLEMENT_PAYEE', () => {
    expect(
      evaluerSituation({
        montantDu: 1000, montantRegle: 400, statut: 'PARTIELLE',
        dateEcheance: '2026-10-31', ...base,
      }),
    ).toBe(SituationFinanciere.PARTIELLEMENT_PAYEE);
  });

  it('reste dû + échéance passée → EN_RETARD', () => {
    expect(
      evaluerSituation({
        montantDu: 1000, montantRegle: 400, statut: 'PARTIELLE',
        dateEcheance: '2026-09-30', ...base,
      }),
    ).toBe(SituationFinanciere.EN_RETARD);
  });

  it('rien réglé + échéance passée → EN_RETARD', () => {
    expect(
      evaluerSituation({
        montantDu: 1000, montantRegle: 0, statut: 'OUVERTE',
        dateEcheance: '2026-09-15', ...base,
      }),
    ).toBe(SituationFinanciere.EN_RETARD);
  });

  it('rien réglé + échéance à venir → A_ECHEANCE', () => {
    expect(
      evaluerSituation({
        montantDu: 1000, montantRegle: 0, statut: 'OUVERTE',
        dateEcheance: '2026-10-20', ...base,
      }),
    ).toBe(SituationFinanciere.A_ECHEANCE);
  });

  it('rien réglé + pas de date d\'échéance → IMPAYEE', () => {
    expect(
      evaluerSituation({ montantDu: 1000, montantRegle: 0, statut: 'OUVERTE', ...base }),
    ).toBe(SituationFinanciere.IMPAYEE);
  });

  it('calculerTotaux agrège les lignes', () => {
    const t = calculerTotaux([
      { montantDu: 1000, montantRegle: 400 },
      { montantDu: 500, montantRegle: 500 },
    ]);
    expect(t).toEqual({ montantDu: 1500, montantRegle: 900, restantDu: 600 });
  });
});
