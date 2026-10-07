# Intégration SIGRNF — préparation (phase SIGRNF-ready)

> Statut : **préparation uniquement**. Aucun appel réel vers SIGRNF n'est effectué.
> L'intégration est désactivée par défaut (`SIGRNF_ENABLED=false`).

## Principe

```text
Modules métier (zone, local, location, paiement, ...)
        │
        │ événement interne (après succès du paiement)
        ▼
   SigrnfService          (src/sigrnf/sigrnf.service.ts)
        │                  - file d'attente locale sigrnf_sync
        │                  - idempotence par référence locale
        │                  - retry périodique (@nestjs/schedule)
        ▼
   SigrnfAdapter          (interface d'injection SIGRNF_ADAPTER)
        │
        ├── MockSigrnfAdapter   (journalise, aucun appel réseau)
        └── HttpSigrnfAdapter   (skeleton Axios — TODO(SIGRNF))
                │
                ▼
          SIGRNF externe (API officielle, future)
```

Le domaine métier ne dépend **jamais** directement de SIGRNF : il suffit
d'émettre un `RevenueEvent` interne via `SigrnfService.handleRevenueEvent()`.

## Structure

```text
src/sigrnf/
├── sigrnf.module.ts          # Module isolé (aucune dépendance vers le domaine)
├── sigrnf.service.ts         # Événements, file d'attente, idempotence, retry
├── sigrnf.controller.ts      # GET /servicemodernmarket/sigrnf/status
├── sigrnf.config.ts          # Chargement de la configuration (@nestjs/config)
├── sigrnf.service.spec.ts    # Tests de la couche d'intégration
├── sigrnf.controller.spec.ts
├── dto/revenue-event.dto.ts  # DTO interne validable (≠ modèle SIGRNF)
├── interfaces/
│   ├── revenue-event.interface.ts   # Événement de recette INTERNE
│   └── sigrnf-adapter.interface.ts  # Frontière + jeton SIGRNF_ADAPTER
├── adapters/
│   ├── mock-sigrnf.adapter.ts
│   └── http-sigrnf.adapter.ts       # Skeleton, voir TODO(SIGRNF)
└── entities/sigrnf-sync.entity.ts   # Table d'intégration locale
```

## Configuration

Variables (validées par Joi dans `app.module.ts`, documentées dans `.env.example`) :

| Variable              | Défaut   | Rôle                                   |
| --------------------- | -------- | -------------------------------------- |
| `SIGRNF_ENABLED`      | `false`  | Active l'intégration                   |
| `SIGRNF_BASE_URL`     | (vide)   | URL de base future de l'API SIGRNF     |
| `SIGRNF_API_KEY`      | (vide)   | Authentification future (adaptable)    |
| `SIGRNF_TIMEOUT_MS`   | `10000`  | Timeout HTTP sortant                   |
| `SIGRNF_RETRY_ATTEMPTS` | `3`    | Tentatives par cycle de synchronisation|

Aucun secret n'est committé (`.env` est ignoré par Git).

Sélection de l'adaptateur :

- `SIGRNF_ENABLED=true` **et** `SIGRNF_BASE_URL` renseigné → `HttpSigrnfAdapter`
  (échoue explicitement tant que le contrat officiel n'existe pas → statut `FAILED`,
  sans impact local) ;
- sinon → `MockSigrnfAdapter`.

## Flux paiement → SIGRNF

1. `PaiementService.create()` traite le paiement **exactement comme avant**
   (transaction PostgreSQL inchangée) ;
2. après `commitTransaction()`, si `status === 'success'`, un `RevenueEvent`
   interne est émis (bloc isolé try/catch — jamais de régression côté paiement) ;
3. `SigrnfService` crée (ou détecte) une ligne `sigrnf_sync` :
   `PENDING → PROCESSING → SUCCESS | FAILED` ;
4. une tâche `@Cron` (toutes les 5 minutes) reprend les lignes
   `PENDING`/`FAILED` lorsque l'intégration est activée.

## Idempotence

- Clé : `eventType` + `localReference` (référence locale du paiement),
  contrainte d'unicité `UQ_sigrnf_sync_event_reference` ;
- une référence déjà `SUCCESS` n'est jamais réémise ;
- aucune référence SIGRNF n'est inventée.

## Endpoint de diagnostic

```http
GET /servicemodernmarket/sigrnf/status
```

```json
{ "enabled": false, "configured": false }
```

N'expose ni clé, ni jeton, ni URL, ni payload.

## Logs

Format : `[SIGRNF] ...` (et `[SIGRNF MOCK] ...` pour l'adaptateur de simulation).
Jamais de `API_KEY`, `Authorization`, mot de passe, secret, jeton, ni donnée
personnelle détaillée du redevable.

## TODO(SIGRNF) — en attente du contrat officiel

À compléter **uniquement** lors de la réception de la documentation SIGRNF,
sans modifier le domaine métier :

- endpoint réel (dans `HttpSigrnfAdapter`) ;
- authentification ;
- mapping `RevenueEvent` → payload officiel (noms de champs, montants, dates) ;
- codes de recettes / identifiants SIGRNF (via table de mapping dédiée si
  nécessaire — ne jamais ajouter de colonnes `sigrnf*` aux entités métier sans
  justification du contrat) ;
- stratégie d'accusé de réception.

## Tests

```bash
npx jest src/sigrnf
```

Couverture : intégration désactivée, création d'événement, succès
(`PENDING → SUCCESS`), erreur (`PENDING → FAILED`, aucune exception), idempotence,
retry périodique, absence de secrets dans le statut.
