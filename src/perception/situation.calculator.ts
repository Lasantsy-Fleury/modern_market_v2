/**
 * Calcul centralisé de la situation d'une obligation/redevance.
 *
 * Backend = source de vérité : les controllers/frontend ne doivent PAS
 * recalculer ces états. Les montants sont comparés à des dates ; aucun
 * montant métier arbitraire n'est codé ici.
 */
export enum SituationFinanciere {
  PAYEE = 'PAYEE',
  PARTIELLEMENT_PAYEE = 'PARTIELLEMENT_PAYEE',
  IMPAYEE = 'IMPAYEE',
  EN_RETARD = 'EN_RETARD',
  A_ECHEANCE = 'A_ECHEANCE',
  NON_APPLICABLE = 'NON_APPLICABLE',
}

export interface DonneesSituation {
  montantDu: number;
  montantRegle: number;
  /** Statut de persistance (OUVERTE/PARTIELLE/SOLDEE/ANNULEE). */
  statut: string;
  /** Date de l'échéance théorique si connue. */
  dateEcheance?: Date | string | null;
  /** Date de référence du calcul (défaut : aujourd'hui). */
  dateReference?: Date | string;
}

export function evaluerSituation(d: DonneesSituation): SituationFinanciere {
  if (d.statut === 'ANNULEE') {
    return SituationFinanciere.NON_APPLICABLE;
  }

  const du = Number(d.montantDu) || 0;
  const regle = Number(d.montantRegle) || 0;

  if (du === 0 && regle === 0) {
    return SituationFinanciere.NON_APPLICABLE;
  }
  if (regle >= du && du > 0) {
    return SituationFinanciere.PAYEE;
  }

  const reste = du - regle;
  const reference = d.dateReference ? new Date(d.dateReference) : new Date();
  const echeance = d.dateEcheance ? new Date(d.dateEcheance) : null;

  if (reste > 0 && echeance !== null && echeance < reference) {
    return SituationFinanciere.EN_RETARD;
  }
  if (regle > 0) {
    return SituationFinanciere.PARTIELLEMENT_PAYEE;
  }
  if (echeance !== null) {
    return SituationFinanciere.A_ECHEANCE;
  }
  return SituationFinanciere.IMPAYEE;
}

export function calculerTotaux(
  situations: { montantDu: number; montantRegle: number }[],
): { montantDu: number; montantRegle: number; restantDu: number } {
  return situations.reduce(
    (acc: { montantDu: number; montantRegle: number; restantDu: number }, s) => {
      const du = Number(s.montantDu) || 0;
      const regle = Number(s.montantRegle) || 0;
      acc.montantDu += du;
      acc.montantRegle += regle;
      acc.restantDu += Math.max(du - regle, 0);
      return acc;
    },
    { montantDu: 0, montantRegle: 0, restantDu: 0 },
  );
}
