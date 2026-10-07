import { RevenueEvent } from '../interfaces/revenue-event.interface';
import { toMockPayload } from '../sigrnf-payload.mapper';
import { SigrnfAdapter } from '../interfaces/sigrnf-adapter.interface';

/**
 * Adaptateur de développement / simulation.
 *
 * Il ne contacte aucun système externe : il journalise l'événement reçu
 * (le mapping structurel interne reste celui du modèle, voir mapper).
 * Aucune donnée sensible ni donnée personnelle détaillée n'est journalisée.
 */
export class MockSigrnfAdapter implements SigrnfAdapter {
  readonly name = 'mock' as const;

  sendRevenueEvent(event: RevenueEvent): Promise<unknown> {
    const payload = toMockPayload(event);
    console.log(
      `[SIGRNF MOCK] revenue event received reference=${payload.reference} amount=${payload.amount}`,
    );
    // Retour interne uniquement : ce n'est pas un accusé de réception SIGRNF.
    return Promise.resolve({ mocked: true });
  }
}

