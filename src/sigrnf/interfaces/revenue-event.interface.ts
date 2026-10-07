/**
 * Modèle INTERNE d'événement de recette.
 *
 * IMPORTANT :
 * - Ce modèle ne correspond PAS au modèle SIGRNF (contrat officiel inconnu à ce stade).
 * - Le mapping vers le payload SIGRNF est effectué dans l'adaptateur.
 * - Aucun identifiant, code de recette ou règle fiscale SIGRNF n'est représenté ici.
 *
 * TODO(SIGRNF):
 * Ajuster ce modèle uniquement si le contrat officiel SIGRNF démontre qu'une
 * information supplémentaire est nécessaire.
 */
export interface RevenueEvent {
  /** Référence locale de l'opération (ex : référence du paiement). Sert de clé d'idempotence. */
  reference: string;
  /** Montant de la recette, dans la monnaie locale. */
  amount: number;
  /** Date du paiement. */
  paymentDate: Date;
  /** Type de recette (interne). Ce n'est PAS un code recette SIGRNF. */
  revenueType?: string;
  /** Référence du redevable, si disponible localement. */
  taxpayerReference?: string;
  /** Référence de la municipalité. */
  municipalityReference?: string;
  /** Référence du marché. */
  marketReference?: string;
  /** Référence de l'emplacement. */
  placeReference?: string;
  /** Référence locale du commerçant. */
  commercantReference?: string;
  /** Référence locale de l'obligation (redevance). */
  obligationReference?: string;
  /** Référence locale du paiement. */
  paymentReference?: string;
  /** Référence locale de l'agent encaisseur. */
  agentReference?: string;
  /** Référence locale de la quittance. */
  receiptReference?: string;
  /** Données complémentaires internes, jamais de secrets. */
  metadata?: Record<string, unknown>;
}
