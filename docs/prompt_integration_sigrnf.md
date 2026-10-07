# PROMPT — Préparation minimale à l'intégration SIGRNF

## Contexte

Je travaille sur un backend NestJS de gestion de marchés communaux / locaux commerciaux.

Le backend existant utilise :

- TypeScript
- NestJS 11
- Node.js
- PostgreSQL
- PostGIS
- TypeORM
- `@nestjs/config`
- Joi pour la validation des variables d'environnement
- Axios pour les appels HTTP externes
- Socket.IO pour les événements temps réel
- Swagger pour la documentation API
- `@nestjs/schedule` pour les tâches planifiées

L'architecture actuelle est organisée par domaines métier :

```text
src/
├── app.module.ts
├── main.ts
├── Database/
├── zone/
├── local/
├── location/
├── type_local/
├── paiement/
├── paiement_location/
├── distribution_zone/
├── notification/
├── socket/
└── ...
```

Les entités principales sont notamment :

- `Zone`
- `Typelocal`
- `Local`
- `Location`
- `Paiement`
- `Paiementlocation`
- `Notification`
- `DistributionZone`

Le backend gère déjà les zones, locaux, locations, paiements, notifications et communications avec des services externes.

La documentation existante indique notamment que le backend utilise Axios pour les appels HTTP externes et dispose déjà d'une couche Socket.IO utilisée pour des échanges avec des services tiers. Ne pas recréer inutilement ces mécanismes. 

## Objectif

Préparer le backend à une future intégration avec **SIGRNF**, avec le minimum de modifications possible.

À ce stade :

- l'API exacte de SIGRNF peut ne pas encore être connue ;
- les endpoints SIGRNF définitifs ne doivent pas être inventés ;
- les formats exacts des payloads SIGRNF ne doivent pas être inventés ;
- aucune dépendance externe inutile ne doit être ajoutée ;
- aucune modification fonctionnelle visible ne doit être introduite dans les applications existantes ;
- le comportement actuel des modules `zone`, `local`, `location`, `paiement`, etc. doit rester inchangé.

L'objectif est uniquement de créer une **couche d'intégration isolée et désactivable**, qui pourra être complétée lorsque le contrat/API SIGRNF sera disponible.

---

# 1. Principe architectural obligatoire

Créer un module dédié :

```text
src/
└── sigrnf/
    ├── sigrnf.module.ts
    ├── sigrnf.service.ts
    ├── sigrnf.controller.ts
    ├── sigrnf.config.ts
    ├── dto/
    │   └── ...
    ├── interfaces/
    │   └── ...
    └── adapters/
        └── ...
```

Le module doit être indépendant des modules métier existants.

Architecture cible :

```text
Modules métier existants
        │
        │ événements / appels internes
        ▼
SigrnfService
        │
        ▼
SigrnfAdapter
        │
        ▼
SIGRNF externe
```

Ne pas faire :

```text
PaiementService
      │
      └──────► API SIGRNF directement
```

Faire :

```text
PaiementService
      │
      ▼
événement / service d'intégration
      │
      ▼
SigrnfService
      │
      ▼
SigrnfAdapter
      │
      ▼
SIGRNF
```

Cette séparation doit permettre de modifier ultérieurement l'API SIGRNF sans modifier toute la logique métier.

---

# 2. Ne pas modifier les entités métier existantes inutilement

NE PAS ajouter immédiatement des champs SIGRNF dans :

- `Zone`
- `Local`
- `Location`
- `Paiement`
- `Paiementlocation`
- `Typelocal`

sauf si une information officielle du contrat SIGRNF démontre qu'elle est nécessaire.

Éviter par exemple d'ajouter arbitrairement :

```text
sigrnfId
sigrnfReference
sigrnfCode
```

dans toutes les entités.

Si une correspondance SIGRNF devient nécessaire plus tard, privilégier :

1. une table de mapping dédiée ;
2. ou une table d'intégration dédiée ;
3. ou une extension minimale et justifiée d'une entité existante.

Ne pas polluer le modèle métier actuel avec des détails techniques du système externe.

---

# 3. Créer une configuration SIGRNF isolée

Ajouter les variables d'environnement nécessaires à la future intégration.

Exemple :

```env
SIGRNF_ENABLED=false
SIGRNF_BASE_URL=
SIGRNF_API_KEY=
SIGRNF_TIMEOUT_MS=10000
SIGRNF_RETRY_ATTEMPTS=3
```

Important :

- `SIGRNF_ENABLED=false` par défaut.
- Ne jamais mettre de valeur réelle ou de secret dans le dépôt Git.
- Ne jamais hardcoder l'URL SIGRNF.
- Ne jamais hardcoder un token.
- Ne pas supposer que SIGRNF utilise obligatoirement une API Key : prévoir une configuration adaptable.

Si le projet possède déjà une stratégie centralisée de configuration, l'utiliser au lieu de créer une deuxième stratégie.

Le backend utilise déjà `@nestjs/config` et Joi pour les variables d'environnement : réutiliser cette infrastructure existante.

---

# 4. Créer un client/adapter SIGRNF

Créer une abstraction du type :

```ts
export interface SigrnfAdapter {
  sendRevenueEvent(event: unknown): Promise<unknown>;
}
```

ou une abstraction équivalente adaptée à l'architecture existante.

L'objectif n'est PAS de définir maintenant le contrat métier définitif de SIGRNF.

Prévoir uniquement une frontière claire :

```text
Application
    ↓
SigrnfService
    ↓
SigrnfAdapter
    ↓
HTTP / API SIGRNF
```

Le client HTTP doit utiliser **Axios**, déjà présent dans le projet.

Ne pas installer une nouvelle bibliothèque HTTP sans justification.

---

# 5. Créer un modèle interne d'événement de recette

Créer un DTO/interface interne représentant une opération pouvant éventuellement être transmise à SIGRNF.

Exemple conceptuel uniquement :

```ts
interface RevenueEvent {
  reference: string;
  amount: number;
  paymentDate: Date;
  revenueType?: string;
  taxpayerReference?: string;
  municipalityReference?: string;
  marketReference?: string;
  placeReference?: string;
  metadata?: Record<string, unknown>;
}
```

IMPORTANT :

Ce modèle est interne à l'application.

Il ne faut PAS prétendre qu'il correspond déjà au modèle SIGRNF.

Le mapping doit être fait dans l'adapter :

```text
RevenueEvent interne
        ↓
SigrnfAdapter
        ↓
Payload SIGRNF
```

Ainsi, lorsque la spécification officielle SIGRNF sera disponible, seul le mapping pourra évoluer.

---

# 6. Préparer la transmission des paiements

Le premier cas d'usage à préparer est :

```text
Paiement validé
      ↓
événement de recette
      ↓
intégration SIGRNF
```

Le module `paiement` existant doit continuer à fonctionner exactement comme avant.

NE PAS remplacer :

```text
PaiementService
```

par une logique dépendante de SIGRNF.

Ajouter seulement un point d'intégration après la réussite du paiement.

Exemple conceptuel :

```ts
await paiementService.processPayment(...);

// seulement après succès
await sigrnfService.handleRevenueEvent(...);
```

Mais si cet appel rend le paiement dépendant de la disponibilité de SIGRNF, utiliser une stratégie asynchrone.

Le paiement local ne doit pas échouer uniquement parce que SIGRNF est temporairement indisponible.

---

# 7. Prévoir une stratégie de synchronisation fiable

La première version peut rester simple.

Créer une table locale d'intégration uniquement si nécessaire, par exemple :

```text
sigrnf_sync
```

avec conceptuellement :

```text
id
event_type
local_reference
status
attempt_count
last_attempt_at
sent_at
response_reference
error_message
payload
created_at
updated_at
```

Statuts possibles :

```text
PENDING
PROCESSING
SUCCESS
FAILED
```

Cette table doit être utilisée uniquement pour les événements nécessitant une synchronisation avec SIGRNF.

Ne pas créer une table pour chaque ressource SIGRNF.

Objectif :

```text
Paiement
   ↓
SigrnfSync PENDING
   ↓
Tentative d'envoi
   ↓
SUCCESS / FAILED
```

Cela évite qu'une panne temporaire de SIGRNF bloque les opérations locales.

---

# 8. Préparer une tâche de retry

Le projet utilise déjà `@nestjs/schedule`.

Réutiliser cette dépendance.

Prévoir éventuellement une tâche périodique :

```text
toutes les X minutes
        ↓
chercher les synchronisations FAILED/PENDING
        ↓
réessayer
        ↓
mettre à jour le statut
```

Ne pas activer un système complexe de queue/message broker pour cette première préparation.

Ne pas ajouter Redis, RabbitMQ, Kafka ou BullMQ uniquement pour cette intégration tant qu'un besoin réel n'est pas démontré.

---

# 9. Idempotence obligatoire

Une même recette ne doit jamais être envoyée plusieurs fois comme plusieurs recettes.

Utiliser la référence locale existante du paiement lorsque cela est possible.

Exemple :

```text
reference paiement
REC-2026-000145
```

Cette référence doit permettre de déterminer qu'un événement a déjà été synchronisé.

Prévoir une contrainte unique locale si une table de synchronisation est créée.

Objectif :

```text
REC-2026-000145
        ↓
SYNC SUCCESS

nouvelle tentative
        ↓
détecter déjà synchronisé
        ↓
ne pas créer une deuxième recette
```

Ne pas inventer le format d'une éventuelle référence SIGRNF.

---

# 10. Ne pas supposer les endpoints SIGRNF

Tant que la documentation officielle n'est pas fournie, NE PAS créer arbitrairement :

```text
POST /api/revenues
POST /api/taxpayers
POST /api/payments
```

ou d'autres endpoints supposés.

Créer plutôt une interface/adaptateur avec une implémentation temporaire.

Exemple :

```text
SigrnfAdapter
     │
     ├── HttpSigrnfAdapter
     │
     └── MockSigrnfAdapter
```

En développement, le mock peut simplement journaliser :

```text
[SIGRNF MOCK]
Revenue event received
reference=REC-2026-000145
amount=10000
```

Lorsque le contrat officiel est disponible :

```text
HttpSigrnfAdapter
```

sera complété.

---

# 11. Ajouter un endpoint interne de diagnostic

Ajouter éventuellement un endpoint administratif minimal :

```text
GET /servicemodernmarket/sigrnf/status
```

Il doit retourner quelque chose comme :

```json
{
  "enabled": false,
  "configured": false
}
```

Il ne doit PAS exposer :

- API key
- token
- mot de passe
- secrets
- payloads sensibles

Objectif :

permettre de vérifier rapidement si l'intégration est activée/configurée.

Si l'architecture de sécurité actuelle ne permet pas d'exposer ce endpoint, ne pas créer un endpoint public : utiliser simplement des logs ou une méthode interne.

---

# 12. Logs

Créer des logs structurés et sobres.

Exemples :

```text
[SIGRNF] integration disabled
[SIGRNF] revenue event queued
[SIGRNF] synchronization started
[SIGRNF] synchronization succeeded
[SIGRNF] synchronization failed
```

NE JAMAIS logger :

```text
API_KEY
Authorization
password
secret
token
```

Éviter également de logger inutilement toutes les données personnelles du redevable.

---

# 13. Gestion des erreurs

Une panne SIGRNF ne doit pas casser les opérations locales.

Exemple :

```text
Utilisateur
   ↓
Paiement
   ↓
Paiement local SUCCESS
   ↓
SIGRNF indisponible
   ↓
SYNC = FAILED
   ↓
Retry ultérieur
```

et NON :

```text
SIGRNF indisponible
   ↓
Paiement local FAILED
```

sauf si une future spécification institutionnelle impose explicitement une validation synchrone.

Pour la préparation actuelle, privilégier la résilience.

---

# 14. Swagger

Documenter uniquement les endpoints locaux créés par l'intégration.

Ne pas documenter comme réels les endpoints SIGRNF encore inconnus.

Ajouter une section Swagger :

```text
SIGRNF Integration
```

uniquement si cela respecte la convention actuelle du projet.

---

# 15. Tests minimums

Ajouter uniquement les tests nécessaires à la nouvelle couche.

Minimum recommandé :

### Test 1 — intégration désactivée

```text
SIGRNF_ENABLED=false
```

Le paiement fonctionne normalement.

Aucun appel externe SIGRNF n'est effectué.

### Test 2 — création d'un événement

Un paiement valide génère un événement de synchronisation.

### Test 3 — succès SIGRNF

```text
PENDING → SUCCESS
```

### Test 4 — erreur SIGRNF

```text
PENDING → FAILED
```

Le paiement local reste réussi.

### Test 5 — idempotence

Le même paiement ne génère pas deux synchronisations réussies.

---

# 16. Modifications autorisées

Les seules modifications nécessaires devraient être proches de :

```text
src/
├── sigrnf/
│   ├── sigrnf.module.ts
│   ├── sigrnf.service.ts
│   ├── sigrnf.controller.ts
│   ├── sigrnf.config.ts
│   ├── dto/
│   ├── interfaces/
│   └── adapters/
│
├── app.module.ts
│   └── import SigrnfModule
│
├── paiement/
│   └── ajouter uniquement le point d'émission d'événement nécessaire
│
└── ...
```

Et éventuellement :

```text
Database
└── nouvelle entité/table de synchronisation SIGRNF
```

si cette persistance est réellement nécessaire.

---

# 17. Modifications interdites

NE PAS :

- réécrire les modules existants ;
- renommer les entités existantes ;
- modifier les routes existantes ;
- modifier les réponses API existantes ;
- modifier le fonctionnement actuel des paiements ;
- modifier les règles de location ;
- modifier les relations `Zone → Local → Location → Paiement` ;
- remplacer TypeORM ;
- remplacer Axios ;
- remplacer Socket.IO ;
- introduire une nouvelle architecture microservices ;
- ajouter un broker de messages ;
- ajouter Redis uniquement pour SIGRNF ;
- ajouter une nouvelle base de données ;
- créer des endpoints SIGRNF imaginaires ;
- inventer des identifiants SIGRNF ;
- inventer des règles fiscales ;
- inventer des codes de recettes ;
- inventer le format d'authentification SIGRNF ;
- rendre SIGRNF obligatoire au démarrage ;
- rendre un paiement dépendant de la disponibilité de SIGRNF ;
- exposer des secrets dans les logs.

---

# 18. Règle importante concernant le contrat SIGRNF

Si une information nécessaire à l'intégration n'est pas connue :

**NE PAS DEVINER.**

Créer une abstraction et laisser un TODO explicite :

```ts
// TODO(SIGRNF):
// Remplacer par le endpoint officiel fourni par SIGRNF.
```

ou :

```ts
// TODO(SIGRNF):
// Mapper cette propriété selon le contrat officiel SIGRNF.
```

Les éléments suivants doivent rester configurables jusqu'à réception de la documentation officielle :

- URL ;
- authentification ;
- endpoints ;
- noms des champs ;
- identifiants ;
- codes de recettes ;
- format des dates ;
- format des montants ;
- gestion des erreurs ;
- stratégie d'accusé de réception.

---

# 19. Vérification avant modification

Avant d'écrire du code :

1. Inspecter `app.module.ts`.
2. Inspecter la configuration actuelle de `@nestjs/config`.
3. Inspecter la validation Joi existante.
4. Inspecter `paiement` et `paiement_location`.
5. Inspecter l'utilisation actuelle d'Axios.
6. Inspecter `socket`.
7. Inspecter l'utilisation de `@nestjs/schedule`.
8. Vérifier les conventions de nommage existantes.
9. Vérifier la stratégie actuelle de tests.
10. Vérifier si une table d'événements ou de synchronisation existe déjà.

**Ne pas créer une deuxième solution si une solution équivalente existe déjà.**

---

# 20. Ordre d'implémentation

Procéder dans cet ordre :

### Étape 1

Créer la configuration :

```text
SIGRNF_ENABLED
SIGRNF_BASE_URL
SIGRNF_TIMEOUT_MS
SIGRNF_RETRY_ATTEMPTS
```

avec validation.

### Étape 2

Créer :

```text
SigrnfModule
SigrnfService
SigrnfAdapter
```

### Étape 3

Créer le modèle interne `RevenueEvent`.

### Étape 4

Créer un `MockSigrnfAdapter`.

### Étape 5

Brancher uniquement le paiement réussi sur la génération d'un événement, sans modifier son comportement.

### Étape 6

Si nécessaire, persister les événements à synchroniser.

### Étape 7

Ajouter retry avec `@nestjs/schedule`.

### Étape 8

Ajouter tests.

### Étape 9

Ajouter documentation technique.

### Étape 10

Arrêter l'implémentation à ce stade.

Ne pas implémenter le véritable appel SIGRNF tant que sa documentation/API officielle n'est pas fournie.

---

# 21. Critères d'acceptation

L'intégration préparatoire est considérée comme terminée lorsque :

- [ ] le backend démarre avec `SIGRNF_ENABLED=false` ;
- [ ] aucun appel SIGRNF réel n'est effectué ;
- [ ] les fonctionnalités existantes fonctionnent comme avant ;
- [ ] le paiement fonctionne sans SIGRNF ;
- [ ] un événement interne de recette peut être généré ;
- [ ] le mock SIGRNF peut recevoir cet événement ;
- [ ] une future implémentation HTTP peut remplacer le mock sans modifier le domaine métier ;
- [ ] les erreurs SIGRNF ne cassent pas les paiements locaux ;
- [ ] l'idempotence est prévue ;
- [ ] les secrets ne sont jamais exposés ;
- [ ] aucun endpoint SIGRNF fictif n'est présenté comme réel ;
- [ ] aucune règle métier SIGRNF non documentée n'est inventée ;
- [ ] les modifications du projet existant restent minimales ;
- [ ] les tests existants continuent de passer.

---

# 22. Résultat attendu

À la fin, l'architecture doit ressembler à :

```text
                       ┌──────────────────────┐
                       │       SIGRNF         │
                       │ API officielle       │
                       │ (future)             │
                       └──────────▲───────────┘
                                  │
                            HTTP / Adapter
                                  │
                       ┌──────────┴───────────┐
                       │ SigrnfAdapter        │
                       └──────────▲───────────┘
                                  │
                       ┌──────────┴───────────┐
                       │ SigrnfService        │
                       │                      │
                       │ - événements         │
                       │ - synchronisation    │
                       │ - idempotence        │
                       └──────────▲───────────┘
                                  │
                     ┌────────────┴────────────┐
                     │                         │
              PaiementService             Retry Job
                     │                         │
                     ▼                         ▼
                Paiement                Sync Pending
                     │
                     ▼
               Base PostgreSQL


Modules existants :
Zone
Local
Location
Typelocal
Paiement
Notification
DistributionZone
Socket
        │
        └── restent indépendants de SIGRNF
```

## Principe final

Le projet doit être **SIGRNF-ready**, mais pas encore **SIGRNF-dependent**.

Autrement dit :

```text
Aujourd'hui :

Application
    ↓
PostgreSQL
    ↓
Fonctionne normalement


Après préparation :

Application
    ↓
PostgreSQL
    ↓
Sigrnf Integration
    ↓
SIGRNF (désactivé)


Après réception du contrat officiel :

Application
    ↓
PostgreSQL
    ↓
Sigrnf Integration
    ↓
SIGRNF API officielle
```

La priorité est la **compatibilité future avec un minimum de changements**, pas l'implémentation prématurée de SIGRNF.
