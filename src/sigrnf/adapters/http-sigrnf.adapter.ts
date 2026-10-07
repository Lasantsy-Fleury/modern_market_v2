import { HttpService } from '@nestjs/axios';
import { RevenueEvent } from '../interfaces/revenue-event.interface';
import { SigrnfAdapter } from '../interfaces/sigrnf-adapter.interface';
import { SigrnfConfig } from '../sigrnf.config';
import { toHttpPayload } from '../sigrnf-payload.mapper';

/**
 * Adaptateur HTTP vers l'API SIGRNF (Axios via @nestjs/axios, déjà utilisé
 * dans le projet).
 *
 * Ce skeleton est volontairement incomplet : le contrat officiel SIGRNF n'a pas
 * encore été fourni. Aucun endpoint, format de payload, mécanisme
 * d'authentification ni format de montant/date n'a été inventé.
 *
 * TODO(SIGRNF):
 * Remplacer par le endpoint officiel fourni par SIGRNF.
 *
 * TODO(SIGRNF):
 * Mapper RevenueEvent vers le payload officiel SIGRNF (noms des champs,
 * format des montants, format des dates, codes de recettes).
 *
 * TODO(SIGRNF):
 * Définir l'authentification officielle (API Key, jeton, autre) et la
 * stratégie d'accusé de réception.
 */
export class HttpSigrnfAdapter implements SigrnfAdapter {
  readonly name = 'http' as const;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: SigrnfConfig,
  ) {}

  sendRevenueEvent(event: RevenueEvent): Promise<unknown> {
    // Construit le mapping structurel interne (mapper unique) ; le payload
    // sera remplacé par le contrat officiel. AUCUN appel n'est émis tant
    // que le contrat n'est pas disponible.
    void toHttpPayload(event);
    return Promise.reject(
      new Error(
        `SIGRNF : contrat officiel non disponible, envoi HTTP non implémenté (reference=${event.reference}, voir TODO(SIGRNF)).`,
      ),
    );
  }
}
