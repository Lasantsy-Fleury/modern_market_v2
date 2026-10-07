import { RevenueEvent } from './revenue-event.interface';

/**
 * Jeton d'injection de l'adaptateur SIGRNF (l'interface étant un type TS,
 * un jeton dédié est nécessaire pour l'injection NestJS).
 */
export const SIGRNF_ADAPTER = 'SIGRNF_ADAPTER';

/**
 * Frontière entre l'application et SIGRNF.
 *
 * Aucun endpoint, format de payload ou mécanisme d'authentification SIGRNF
 * n'est supposé ici. Deux implémentations coexistent :
 *
 *  - MockSigrnfAdapter : journalise l'événement (développement / intégration désactivée).
 *  - HttpSigrnfAdapter : skeleton prêt à recevoir le contrat officiel (Axios via @nestjs/axios).
 *
 * TODO(SIGRNF):
 * Compléter HttpSigrnfAdapter (endpoint, authentification, format du payload,
 * format des montants/dates, accusé de réception) dès réception de la
 * documentation officielle, sans modifier le domaine métier.
 */
export interface SigrnfAdapter {
  /** Nom interne de l'adaptateur sélectionné (aucune donnée SIGRNF). */
  readonly name: 'mock' | 'http';

  /**
   * Transmet un événement de recette à SIGRNF (ou à son simulateur).
   * Lève une erreur en cas d'échec ; l'appelant est responsable du retry.
   */
  sendRevenueEvent(event: RevenueEvent): Promise<unknown>;
}
