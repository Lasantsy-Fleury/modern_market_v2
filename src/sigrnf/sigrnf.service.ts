import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SigrnfSync, SigrnfSyncStatus } from './entities/sigrnf-sync.entity';
import {
  SigrnfAdapter,
  SIGRNF_ADAPTER,
} from './interfaces/sigrnf-adapter.interface';
import { RevenueEvent } from './interfaces/revenue-event.interface';
import { SIGRNF_CONFIG, SigrnfConfig } from './sigrnf.config';

/**
 * Type d'événement INTERNE (pas un identifiant ou un code SIGRNF).
 * TODO(SIGRNF): affiner si le contrat officiel impose une typologie différente.
 */
export const SIGRNF_EVENT_REVENUE_PAYMENT = 'REVENUE_PAYMENT';

const MAX_ERROR_MESSAGE_LENGTH = 500;
const RETRY_BATCH_SIZE = 50;

/**
 * Service d'intégration SIGRNF.
 *
 * Rôle :
 *  - recevoir les événements de recette émis par le domaine métier ;
 *  - les persister dans la table d'intégration `sigrnf_sync` (idempotence) ;
 *  - les transmettre via SigrnfAdapter (mock ou HTTP) ;
 *  - réessayer les synchronisations PENDING/FAILED par une tâche périodique.
 *
 * Garanties :
 *  - désactivée par défaut (SIGRNF_ENABLED=false) ;
 *  - aucune dépendance du domaine métier : les méthodes publiques ne lèvent
 *    jamais d'exception vers l'appelant (une panne SIGRNF ne casse jamais un
 *    paiement local) ;
 *  - aucun secret journalisé.
 */
@Injectable()
export class SigrnfService {
  constructor(
    @InjectRepository(SigrnfSync)
    private readonly syncRepository: Repository<SigrnfSync>,
    @Inject(SIGRNF_CONFIG)
    private readonly config: SigrnfConfig,
    @Inject(SIGRNF_ADAPTER)
    private readonly adapter: SigrnfAdapter,
  ) {}

  isEnabled(): boolean {
    return this.config.enabled;
  }

  isConfigured(): boolean {
    return this.config.baseUrl.length > 0;
  }

  /** Statut administratif. Ne retourne ni secret ni donnée sensible. */
  getStatus(): { enabled: boolean; configured: boolean } {
    return {
      enabled: this.isEnabled(),
      configured: this.isConfigured(),
    };
  }

  /**
   * Point d'entrée unique depuis le domaine métier.
   *
   * Ne lève jamais d'exception : si la file d'attente locale échoue,
   * l'opération métier appelante continue normalement.
   */
  async handleRevenueEvent(event: RevenueEvent): Promise<void> {
    if (!this.config.enabled) {
      console.log('[SIGRNF] integration disabled');
      return;
    }

    try {
      // Idempotence : une même référence ne crée jamais deux synchronisations.
      const existing = await this.syncRepository.findOne({
        where: {
          eventType: SIGRNF_EVENT_REVENUE_PAYMENT,
          localReference: event.reference,
        },
      });

      if (existing) {
        if (existing.status === 'SUCCESS') {
          console.log(
            `[SIGRNF] revenue event already synchronized reference=${event.reference}`,
          );
        } else {
          console.log(
            `[SIGRNF] revenue event already queued reference=${event.reference} status=${existing.status}`,
          );
        }
        return;
      }

      const sync = this.syncRepository.create({
        eventType: SIGRNF_EVENT_REVENUE_PAYMENT,
        localReference: event.reference,
        status: 'PENDING' as SigrnfSyncStatus,
        attemptCount: 0,
        payload: event,
      });
      await this.syncRepository.save(sync);
      console.log(`[SIGRNF] revenue event queued reference=${event.reference}`);

      await this.processSync(sync);
    } catch (error) {
      // Course possible avec un index unique : dans tous les cas, ne jamais
      // faire échouer l'opération métier appelante.
      console.error(
        `[SIGRNF] failed to queue revenue event reference=${event.reference}: ${this.extractErrorMessage(error)}`,
      );
    }
  }

  /**
   * Tâche périodique de retry (@nestjs/schedule déjà actif dans le projet).
   * Reprend les synchronisations PENDING/FAILED et les relance.
   * Inerte lorsque l'intégration est désactivée.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryPendingSyncs(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      const pending = await this.syncRepository.find({
        where: { status: In(['PENDING', 'FAILED'] as SigrnfSyncStatus[]) },
        order: { createdAt: 'ASC' },
        take: RETRY_BATCH_SIZE,
      });

      if (pending.length === 0) {
        return;
      }

      console.log(`[SIGRNF] retry cycle started pending=${pending.length}`);
      for (const sync of pending) {
        await this.processSync(sync);
      }
    } catch (error) {
      console.error(
        `[SIGRNF] retry cycle failed: ${this.extractErrorMessage(error)}`,
      );
    }
  }

  /**
   * Tente l'envoi d'une synchronisation via l'adaptateur.
   * Jamais d'exception propagée : l'échec est matérialisé par le statut FAILED.
   */
  private async processSync(sync: SigrnfSync): Promise<void> {
    try {
      sync.status = 'PROCESSING';
      sync.attemptCount = (sync.attemptCount ?? 0) + 1;
      sync.lastAttemptAt = new Date();
      await this.syncRepository.save(sync);

      const maxAttempts = Math.max(1, this.config.retryAttempts);
      let lastErrorMessage: string | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(
            `[SIGRNF] synchronization started reference=${sync.localReference} attempt=${attempt}/${maxAttempts}`,
          );
          await this.adapter.sendRevenueEvent(sync.payload);
          sync.status = 'SUCCESS';
          sync.sentAt = new Date();
          sync.errorMessage = null;
          // TODO(SIGRNF): extraire la référence de réponse SIGRNF selon le
          // contrat officiel. Aucune référence externe n'est inventée ici.
          sync.responseReference = null;
          await this.syncRepository.save(sync);
          console.log(
            `[SIGRNF] synchronization succeeded reference=${sync.localReference}`,
          );
          return;
        } catch (error) {
          lastErrorMessage = this.extractErrorMessage(error);
          console.warn(
            `[SIGRNF] synchronization attempt failed reference=${sync.localReference} attempt=${attempt}: ${lastErrorMessage}`,
          );
        }
      }

      sync.status = 'FAILED';
      sync.errorMessage = lastErrorMessage;
      await this.syncRepository.save(sync);
      console.error(
        `[SIGRNF] synchronization failed reference=${sync.localReference}`,
      );
    } catch (error) {
      // Dernier rempart : aucune exception ne doit remonter au domaine métier.
      console.error(
        `[SIGRNF] synchronization processing failed reference=${sync.localReference}: ${this.extractErrorMessage(error)}`,
      );
    }
  }

  /**
   * Extrait uniquement un message d'erreur court.
   * Ne journalise jamais les en-têtes, jetons, payloads ni réponses complètes.
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message.slice(0, MAX_ERROR_MESSAGE_LENGTH);
    }
    if (typeof error === 'string') {
      return error.slice(0, MAX_ERROR_MESSAGE_LENGTH);
    }
    return 'unknown error';
  }
}
