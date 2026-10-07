import { RevenueEvent } from './interfaces/revenue-event.interface';

/**
 * Mapping EXPLICIT et UNIQUE entre le modèle interne et le payload vers SIGRNF.
 *
 * IMPORTANT : ce mapping est un PLACEHOLDER structurel. Le contrat officiel
 * SIGRNF n'étant pas disponible, aucun endpoint, nom de champ, code ou format
 * n'est supposé figé ici. Lorsque le contrat officiel sera fourni, seul ce
 * mapper (et l'endpoint/auth de l'adapteur HTTP) devra être adapté — le
 * domaine métier ne changera pas.
 *
 * Le modèle interne reste indépendant : le payload généré ici est interne aux
 * adaptateurs et n'est jamais exposé aux développeurs du domaine.
 */

/**
 * Adaptateur mock : conserve simplement le modèle interne tel quel.
 */
export function toMockPayload(event: RevenueEvent): RevenueEvent {
  return event;
}

/**
 * Adaptateur HTTP : structure déterministe (interne) transmise à l'adapteur.
 * TODO(SIGRNF): remplacer par le payload officiel dès réception du contrat.
 */
export function toHttpPayload(event: RevenueEvent): {
  internalReference: string;
  amount: number;
  paymentDate: string;
  revenueType?: string;
  taxpayerReference?: string;
  municipalityReference?: string;
  marketReference?: string;
  placeReference?: string;
  commercantReference?: string;
  obligationReference?: string;
  paymentReference?: string;
  agentReference?: string;
  receiptReference?: string;
  metadata?: Record<string, unknown>;
} {
  return {
    internalReference: event.reference,
    amount: event.amount,
    paymentDate: new Date(event.paymentDate).toISOString(),
    revenueType: event.revenueType,
    taxpayerReference: event.taxpayerReference,
    municipalityReference: event.municipalityReference,
    marketReference: event.marketReference,
    placeReference: event.placeReference,
    commercantReference: event.commercantReference,
    obligationReference: event.obligationReference,
    paymentReference: event.paymentReference,
    agentReference: event.agentReference,
    receiptReference: event.receiptReference,
    metadata: event.metadata,
  };
}
