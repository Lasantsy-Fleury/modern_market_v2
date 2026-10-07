import { ConfigService } from '@nestjs/config';

/**
 * Jeton d'injection de la configuration SIGRNF.
 * La configuration est chargée depuis l'infrastructure existante
 * (@nestjs/config + validation Joi dans app.module.ts).
 */
export const SIGRNF_CONFIG = 'SIGRNF_CONFIG';

export interface SigrnfConfig {
  /** Integration active ou non. false par defaut. */
  enabled: boolean;
  /** URL de base de l'API SIGRNF. Jamais hardcodée, jamais committée. */
  baseUrl: string;
  /** Authentification adaptable (si le contrat officiel l'impose). */
  apiKey?: string;
  /** Timeout des appels HTTP sortants. */
  timeoutMs: number;
  /** Nombre de tentatives d'envoi par cycle de synchronisation. */
  retryAttempts: number;
}

export function loadSigrnfConfig(configService: ConfigService): SigrnfConfig {
  const rawEnabled = configService.get<string | boolean>('SIGRNF_ENABLED');
  const rawBaseUrl = (
    configService.get<string>('SIGRNF_BASE_URL') ?? ''
  ).trim();
  const rawApiKey = (configService.get<string>('SIGRNF_API_KEY') ?? '').trim();

  return {
    enabled: rawEnabled === true || String(rawEnabled).toLowerCase() === 'true',
    baseUrl: rawBaseUrl,
    // Ne jamais journaliser cette valeur.
    apiKey: rawApiKey.length > 0 ? rawApiKey : undefined,
    timeoutMs: Number(configService.get('SIGRNF_TIMEOUT_MS') ?? 10000) || 10000,
    retryAttempts: Number(configService.get('SIGRNF_RETRY_ATTEMPTS') ?? 3) || 3,
  };
}

/** Vrai si l'intégration est suffisamment configurée pour viser l'API réelle. */
export function isSigrnfConfigured(config: SigrnfConfig): boolean {
  return config.baseUrl.length > 0;
}
