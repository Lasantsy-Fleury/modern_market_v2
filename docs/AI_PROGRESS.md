# AI_PROGRESS.md

## Progression : Phase P0 â€” ModÃ¨le mÃ©tier cible

### Objet
Mise en Å“uvre de la **Phase P0** : prÃ©parer le socle structurel du modÃ¨le mÃ©tier cible, sans aucun changement de comportement mÃ©tier. Objectif : ajouter 17 entitÃ©s + 3 modifs additives, sans modifier les flux existants (paiement, location, endpoints, authentification, SIGRNF), en appliquant les dÃ©cisions C4/C5/C6 validÃ©es.

### DÃ©cisions appliquÃ©es
| DÃ©cision | Application |
|---|---|
| **C4 â€” NIF** | `commercant.nif` nullable, **sans contrainte UNIQUE**. Pas d'entitÃ© `Contribuable` en P0 (reportÃ©e si nÃ©cessaire). |
| **C5 â€” Paiement partiel** | `type_droit.peutPayerPartiel` BOOLEAN NULL. TRUE=explicitement autorisÃ©, FALSE=explicitement interdit, **NULL = rÃ¨gle non dÃ©finie (jamais interprÃ©tÃ© comme TRUE/FALSE)**. Aucune logique d'encaissement liÃ©e en P0. |
| **C6 â€” UnicitÃ© des zones** | `zone.marcheId` ajoutÃ© (nullable). **Contrainte `zone.nom` UNIQUE conservÃ©e** en P0. Passage Ã  `UNIQUE(marcheId, nom)` reportÃ© aprÃ¨s backfill + analyse de doublons sur l'environnement cible. |

### Ã‰tapes rÃ©alisÃ©es (P0)

1. [x] **Analyse prÃ©-modification** (schÃ©ma, contraintes, doublons, dÃ©pendances) â€” base vide, 0 doublon.
2. [x] **CrÃ©ation `src/modele_cible/entities/`** : 17 entitÃ©s
   - `commune`, `marche`, `activite_commerciale`, `commercant`, `periodicite`, `mode_paiement`, `type_droit`, `tarif`, `echeance`, `redevance`, `paiement_redevance`, `quittance`, `recette`, `agent`, `presence`, `controle`, `parametre`
3. [x] **Modifications additives existantes** (3 entitÃ©s)
   - `zone`: + `marcheId` (FK â†’ Marche, `ON DELETE SET NULL`) + `marche` relation
   - `location`: + `commercantId` (FK â†’ Commercant, `ON DELETE SET NULL`) + `commercant` relation
   - `paiement`: + `montant`, `modePaiementId` (FK), `canal`, `agentId` (FK) â€” tous NULLable, sans valeur par dÃ©faut
4. [x] **TypeORM typing correction** (`string|number|boolean|Date|null`) â†’ ajout explicite `type:` pour Ã©viter `DataTypeNotSupportedError: Object`
5. [x] **Compilation** â€” `nest build` OK
6. [x] **Synchronisation DB** (`synchronize: true`) â€” crÃ©ation automatique de 17 nouvelles tables (29 tables total)
7. [x] **DÃ©marrage applicatif** â€” `Nest application successfully started` sur `0.0.0.0:3000`
8. [x] **VÃ©rification des anciennes tables** â€” toutes intactes (zone/local/type_locale/location/paiement/paiement_location/distribution_zone/notification/sigrnf_sync)
9. [x] **Endpoints existants** â€” tous mappÃ©s (aucun endpoint supprimÃ©/modifiÃ©)
10. [x] **SIGRNF** â€” `/servicemodernmarket/sigrnf/status` â†’ `{"enabled":false,"configured":false}` ; tests SIGRNF `10/10` verts
11. [x] **Tests globaux** â€” mÃªme baseline (17 failed / 3 passed / 1 failed total) â€” **non rÃ©gressif**
12. [x] **Colonne vÃ©rifiÃ©es** â€” les 6 colonnes additives prÃ©sentes en BD (zone.marcheId, location.commercantId, paiement.montant/modePaiementId/canal/agentId)

### Ã‰tat
**P0 â€” STRUCTUREL COMPLÃ‰TÃ‰, ZÃ‰RO CHANGEMENT COMPORTEMENTAL**

- Aucune route/DTO/service existant modifiÃ©
- Aucun backfill, aucune graine
- Aucune rÃ¨gle d'encaissement, aucun branchement SIGRNF
- ConformitÃ© stricte Ã  C4/C5/C6
- Compilation OK, dÃ©marrage OK, `synchronize` crÃ©e les 17 tables sans erreur

### Prochaine Ã©tape
**P1 â€” Ã€ valider EXPLICITEMENT** : si nÃ©cessaire, backfill rÃ©fÃ©rentiel (commune/marche), alimentation `type_droit`/`tarif`/`periodicite`/`mode_paiement`, rattachement `location.commercantId` depuis `location.id_user`/`nif`, etc. â€” aucun de ces Ã©lÃ©ments n'a Ã©tÃ© exÃ©cutÃ©.
---

## Phase P1 — Modèle de données : contraintes d'intégrité, affectations, audit, migrations (2026-10-07)

### Objet
Finaliser le modèle cible validé : contraintes d'intégrité complètes, nouvelles
tables `affectation` et `audit_log`, passage à de vraies migrations TypeORM
(`synchronize` désactivé), tests de garde sur les métadonnées.

### Changements
1. **Nouvelles entités**
   - `modele_cible/entities/affectation.entity.ts` : affectation commerçant ?
     emplacement sur une période. UQ(commercantId, localId, dateDebut),
     CHECK dates cohérentes, statut ? {ACTIVE, TERMINEE, RESILIEE}, montant >= 0.
   - `modele_cible/entities/audit_log.entity.ts` : traçabilité générique
     (tableName, recordId, action ? {CREATION, MODIFICATION, SUPPRESSION},
     acteurId, ancienEtat/nouvelEtat jsonb, ip). Vide : aucun workflow n'écrit
     encore dedans (branchement reporté à une phase ultérieure).

2. **Contraintes ajoutées sur l'existant** (toutes CHECK additives, aucune
   suppression de colonne/table) :
   - `echeance` : periodeDebut <= periodeFin ; statut ? {PLANIFIEE, PARTIELLE,
     PAYEE, EN_RETARD, ANNULEE} ; source ? {AUTO, MANUEL}.
   - `redevance` : dateOuverture <= dateCloture ; statut ? {OUVERTE, PARTIELLE,
     SOLDEE, ANNULEE}.
   - `tarif` : dateDebut <= dateFin (si dateFin renseignée).
   - `quittance` : statut ? {EMISE, ANNULEE, REMPLACEE}.
   - `controle` : statut ? {OUVERT, CLOTURE} si renseigné.
   - `recette` / `paiement` : canal ? {BUREAU, TERRAIN} ; montant >= 0.
   - `location` : date_debut_loc <= date_fin_loc.
   - `periodicite` : unite ? {JOUR, SEMAINE, MOIS, ANNEE} ; nbUnites > 0 ;
     ajout additif de createdAt/updatedAt. Les périodicités restent extensibles
     par lignes (aucun enum figé) — nouveaux codes = INSERT, pas migration.

3. **Tarifs** : dimensions déjà présentes en P0 conservées — marché, zone,
   emplacement (local), type d'activité, type de droit, périodicité, convention.
   Aucun montant métier codé en dur.

4. **Migrations réelles**
   - `src/data-source.ts` (CLI TypeORM, `synchronize: false`).
   - `src/migrations/1791400984828-InitialSchema.ts` : schéma complet généré et
     appliqué avec succès sur une base vierge de validation (`modernmarket_mig`,
     supprimée depuis) — 29 tables + contraintes FKs/CHECKs/index.
   - `src/Database/database.module.ts` : `synchronize: false`,
     `migrationsRun: false` ; scripts npm `migration:generate|run|revert|show`.
   - Base de dev `modernmarket` : migration marquée exécutée (table
     `migrations`), `migration:show` ? [X]. Aucune donnée existante modifiée.
   - ATTENTION opérationnelle : un serveur de dev obsolète (dist/src/main,
     resté avec l'ancien `synchronize: true`) a été arrêté — il avait déjà
     aligné le schéma de `modernmarket` sur les entités. Sans cela, toute
     évolution future doit passer par `npm run migration:run`.

### Vérifications
- `nest build` : OK.
- Test unitaire nouveau `modele_cible.spec.ts` : 9/9 verts (gardiens des
  contraintes/unicités déclarées dans les métadonnées).
- Suite globale : 17 failed / 20 passed — baseline identique à P0 (les 17
  échecs préexistants sont des specs de modules DI-mockés cassés, non
  régressifs).
- `migration:run` sur base vierge : OK ; `migration:show` : [X] InitialSchema.

### Hors scope
- SIGRNF non modifié (`/sigrnf/status` inchangé).
- Aucun backfill de données, aucune graine, aucune logique d'encaissement.

---

## Module Gestion des commerçants (2026-10-07)

### Objet
Exposer les 12 fonctionnalités attendues autour de la fiche commerçant, en
utilisant uniquement les mécanismes existants (authentification/autorisation
déléguée au serviceauth via GATEWAY_BASE_URL — aucune nouvelle couche d'auth).

### Fichiers
- `src/commercant/commercant.module.ts` (entités injectées : Commercant,
  ActiviteCommerciale, Affectation, Presence, Redevance, Quittance, Paiement,
  AuditLog, Location)
- `src/commercant/commercant.controller.ts` :
  POST /commercants, GET /commercants, GET /commercants/:id,
  PATCH /commercants/:id, GET /commercants/:id/historique,
  GET /commercants/:id/activite, GET /commercants/:id/emplacements,
  GET /commercants/:id/presences, GET /commercants/:id/situation-financiere,
  GET /commercants/:id/paiements, GET /commercants/:id/quittances
- `src/commercant/commercant.service.ts` : vérification utilisateur via
  `/serviceauth/users/:id_user` (mécanisme d'autorisation existant), totaux
  financiers calculés depuis `redevance`, paiements/quittances via
  paiement_location ? location.commercantId, historique via `audit_log`.
- `src/commercant/dto/` : CreateCommercantDto, UpdateCommercantDto
  (PartialType), QueryCommercantDto (page, limit, keyword, activiteId, actif,
  marcheId, zoneId, typelocalId, periodicite) — validation class-validator +
  pipes ValidationPipe(transform, whitelist).
- Tests : `commercant.service.spec.ts` (5), `commercant.controller.spec.ts` (2).

### Compatibilité
- Aucun champ métier inventé ; la fiche agrège les données existantes
  (activité, emplacements, présences, redevances, paiements, quittances,
  audit). La situation de paiement/droit/périodicité s'appuie sur
  `location` + `redevance` telles que modélisées.
- Suite : 17 failed (baseline préexistante) / 27 passed (7 nouveaux verts).
- `nest build` OK ; endpoint `/servicemodernmarket/commercants` vérifié vivant
  (200, 404 propre).

---

## Moteur de configuration des droits/tickets et périodicités (2026-10-07)

### Objet
Permettre à l'administration de configurer droits/tickets, périodicités (JOURNALIERE / MENSUELLE / ANNUELLE à titre cible technique — extensible hors enum), tarifs et leurs dimensions, sans traiter tous les paiements comme des locations. Les montants existants ne sont pas modifiés.

### Entités évolutées
- `type_droit` : + `famille` ('DROIT'|'TICKET', défaut 'DROIT', CHECK), + `reglesRenouvellement` (jsonb nullable — règles configurables, ex. {mode, delaiJoursAvantEcheance}), CHECK `portee IN ('EMPLACEMENT','ZONE','MARCHE')`.
- `periodicite` : + `actif` boolean (défaut true). Unité normalisée (JOUR/SEMAINE/MOIS/ANNEE, nbUnites > 0) — la table reste extensible par lignes, sans enum figé, donc toute nouvelle périodicité = INSERT, pas migration.

### Migration
`src/migrations/1791402444549-ConfigurationDroits.ts` — ALTER TABLE additifs uniquement ; **exécutée** sur `modernmarket` (migration:show ? [X][X]) ; aucun montant, aucune ligne existante modifiée.

### Module `src/droits`
- `DroitsService` + 4 controllers/@` /periodicites, /type-droits, /tarifs, /activites-commerciales` (CRUD complet : créer, consulter, modifier, lister).
- Validation : DTO class-validator (`ValidationPipe` transform+whitelist) ; poids — coût d'un tarif via `@Min(0)`, périodicité avec `nbUnites >= 1`, famille/portée dans des domaines bornés, type de droit lie une périodicité active, une dimension de portée (marché/zone/emplacement/type local/activité) est exigée.
- Règles anti-doublons : unicité friendly sur codes (périodicité/type de droit/activité), blocage des tarifs actifs qui se chevauchent sur la même combinaison (droit, périodicité, portée) et la même période (409 Conflict).
- Résolution sûre : `GET /tarifs/resoudre?date=...&…dimensions` ne retourne que les tarifs ACTIFS et DANS leur période de validité (`dateDebut <= date <= dateFin`) — un tarif inactif ou hors période ne peut donc jamais être utilisé via ce point d'entrée.
- Aucun montant métier codé en dur.

### Tests
`droits.service.spec.ts` : 11/11 verts (doublons, inactifs, dates, portée, résolution active/valide). Suite globale : baseline conservée.

### Hors scope
- Aucun backfill, aucune graine juridique, aucun changement des paiements existants ni des flux SIGRNF.

---

## Présence et contrôle terrain (2026-10-07)

### Entités évolutées
- `presence` : + `latitude`, `longitude`, `precisionGps` (decimals nullable) ; CHECK `source IN ('GPS','MANUEL','SCAN')`.
- `controle` : + `latitude`, `longitude`, `precisionGps` (nullable), + `resultat` (domaine borné), + `comparerPosition` (défaut true).

### Migration
`1791403544628-PresenceControleTerrain.ts` — ALTER additifs ; exécutée (migration:show [X][X][X]).

### Module `src/terrain`
- `POST /presences` : enregistrement manuel / GPS / scan (positionGPS optionnelle, conservée telle quelle ; aucun enregistrement ne se prétend juridique).
- `POST /controles` : agent, zone, emplacement attendu (localId), commerçant, présence associée, date/heure, position GPS si disponible, observation, résultat + anomalie.
- Résultat calculé : `CONFORME`, `HORS_ZONE`, `ANOMALIE` (libre), `GPS_INDISPONIBLE`, `FAIBLE_PRECISION`, `SANS_EMPLACEMENT_FIXE`, `CONTROLE_MANUEL`.
- La comparaison position réelle / emplacement attendu n'a lieu que si `comparerPosition=true` (règle configurable) ; la géolocalisation reste un mécanisme technique, jamais une preuve juridique de présence.
- Seuils configurables : `CONTROLE_RAYON_M` / `CONTROLE_PRECISION_MAX_M` (table parametre, defaults 50m/50m, surcharge possible via DTO).
- `GET /controles` filtres (commerçant, zone, agent, statut, résultat) ; `GET /controles/historique/:commercantId` ; `GET/PATCH /controles/:id` ; `GET /presences?commercantId=`.
- Cartographie existante non modifiée (zone.delimitation PostGIS, Local lat/long, etc.).

### Tests
`terrain.service.spec.ts` : 7/7 verts (GPS indispo, faible précision, manuel, sans emplacement fixe, conforme, hors zone, haversine). Suite globale : baseline conservée.

### Hors scope
- Aucun backfill, aucune graine, SIGRNF non touché, flux de paiement inchangés.

---

## Cycle de perception refondu (2026-10-07)

### Flux distinct
Commerçant ? obligation (redevance) ? échéance ? paiement ? quittance ? recette.
`Location` n'est plus assimilée automatiquement à une dette ; les obligations naissent de redevances (échéance/tarif/périodicité), les paiements les imputent.

### Entités évolutées
- `paiement` : + `commercantId`, + `redevanceId` (obligation), + `source` (CHECK ? {TERRAIN, BUREAU, API_EXTERNE, IMPORT_HISTORIQUE}) ; montant/canal/FK inchangés. Migration `1791404176607-PaiementCyclePerception` exécutée.

### Module `src/perception`
- `POST /perception/paiements` : transaction atomique — paiement success + imputation `paiement_redevance` + mise à jour redevance (montantRegle, SOLDEE si soldée sinon PARTIELLE) + `recette` + `quittance` (numero = reference, statut EMISE).
- `PATCH /perception/paiements/:id` : paiement validé (success) immuable — seule raison/failed autorisés.
- `GET /perception/commercants/:id/situation` : **calcul centralisé** via `situation.calculator.ts` (`PAYEE`, `PARTIELLEMENT_PAYEE`, `IMPAYEE`, `EN_RETARD`, `A_ECHEANCE`, `NON_APPLICABLE`) + compteurs + totaux. `commercant.service.getSituationFinanciere` réutilise la même logique (pas de duplication).
- Protections : 409 double paiement (référence déjà utilisée / redevance déjà soldée), surpaiement interdit par défaut (`AUTISER_SURPAIEMENT` configurable via `parametre`), paiement d'obligation annulée ou typeDe droit inactif refusé, statut valide borné, montant strictement positif.
- `POST/GET /perception/echeances`, `POST/GET /perception/mode-paiements` (espèces, Mobile Money, autres — table extensible, aucun code figé).

### Tests
- `situation.calculator.spec.ts` : 9/9 verts (tous les états + totaux).
- `perception.service.spec.ts` : 8/8 verts (protections : inexistante, soldée, annulée, inactif, surpaiement interdit/autorisé, référence dupliquée, PATCH immuable).
- Suite globale : mêmes 17 échecs préexistants, 78 tests au total, 62 verts.

### Hors scope
- Backfill des relations existantes, branchement SIGRNF sur récipients, flux legacy `location/paiement_location` non modifiés.

---

## Quittances numériques (2026-10-07)

### Lien métier
Quittance ? paiement (commercantId, redevanceId) ? agent ? recette. Les informations de marché/emplacement sont dérivées via redevance ? location ? local ? zone ? marche.

### Entités évolutées
- `audit_log` : + `operation` ('CREATION','VALIDATION','ANNULATION','CORRECTION','REMBOURSEMENT','SYNCHRONISATION',..., nullable). Migration `1791404936354-AuditOperation` exécutée.

### Module `src/quittance`
- `GET /quittances`, `GET /quittances/:id` (relations paiement/mode/agent/commerçant)
- `GET /quittances/:id/telecharger` : PDF (pdfkit, même pattern que paiement) — format configurable, aucun modèle réglementaire forcé.
- `GET /quittances/:id/historique` : audit_log de la quittance.
- `GET /quittances/verifier?numero=&token=` : authenticité (HMAC-SHA256, secret `QUITTANCE_TOKEN_SECRET`) + statut EMISE.
- `POST /quittances/:id/annuler|correction|remboursement|synchronisation` : écritures audit, statut ANNULEE, jamais de DELETE physique.
- Pas d'endpoint DELETE pour les quittances/paiements : suppression physique interdite sans mécanisme d'audit — les statuts sont basculés (ANNULEE/REMPLACEE/failed).

### Tests
`quittance.service.spec.ts` : 7/7 verts (annulation, double annulation, correction interdite, historique, vérification token). Suite globale : mêmes 17 échecs préexistants, 69 verts.

---

## Suivi financier et opérationnel (2026-10-07)

### Module `src/suivi` (backend = source de vérité — aucun recalcul frontend)
- `GET /suivi/indicateurs` : agrégat consolidé
- `GET /suivi/recettes` : jour / mois / année (SUM recette.montant)
- `GET /suivi/situation-financiere` : montantAttendu (SUM redevance.montantDu), montantEncaisse (SUM montantRegle), impayés / retards / paiements partiels (via le calcul centralisé de situation)
- `GET /suivi/activite` : nombreCommercants, commercantsPresents (DISTINCT), commercantsControles (DISTINCT), ticketsDelivres (echeance.typeDroit.famille = TICKET), quittancesEmises
- `GET /suivi/rapprochement` : Encaissements (paiements validés) vs Quittances émises vs Recettes — indicateur `coherent` + écarts
- `GET /suivi/recettes/details` : **pagination** page/limit, page/limit validés

### Filtres
communeId, marcheId, zoneId, typeDroitId, periodiciteId, agentId, modePaiementId, dateDebut, dateFin — via DTO validé (class-validator + ValidationPipe).

### Tests
`suivi.service.spec.ts` : 5/5 verts (agrégations, situation via calcul centralisé, activité, rapprochement, pagination). Suite globale : baseline préexistante conservée.

---

## SIGRNF — isolation renforcée (2026-10-07)

### Modèle interne enrichi
`RevenueEvent` (interfaces/revenue-event.interface.ts) est désormais suffisamment
générique : référence locale, montant, date, type de recette, redevable, commune/
marché/emplacement, commerçant, obligation, paiement, agent, quittance, metadata.
Le modèle INTERNE reste indépendant du modèle SIGRNF.

### Mapping explicite
`sigrnf-payload.mapper.ts` : `toMockPayload` (identique au modèle interne) et
`toHttpPayload` (structure déterministe, TODO(SIGRNF) : à remplacer par le
contrat officiel). Les deux adaptateurs l'utilisent ; quand le contrat officiel
arrivera, seul l'adapter HTTP + ce mapper seront impactés.

### Contract exigeant
Aucun endpoint, payload, token, code recette, référence externe ni statut SIGRNF
n'est inventé. Mock et Http restent inchangés dans leur contrat métier.

### Tests
`sigrnf-payload.mapper.spec.ts` : 2/2 verts. `sigrnf.service.spec.ts` inchangé
(idempotence, retry, panne externe, désactivation) — toujours vert. Build OK.

---

## Documentation d'architecture - ARCHITECTURE_MODERNMARKET.md (2026-10-08)

### Mise à jour complète
Le document (773 lignes, 8 sections) reflète désormais l'intégralité
du périmètre implémenté depuis le cœur historique location/paiement :

- **3.1** structure `src/` : `data-source.ts`, `migrations/` (5 fichiers),
  modules `modele_cible`, `commercant`, `droits`, `terrain`, `perception`,
  `quittance`, `suivi`, `sigrnf` (avec `sigrnf-payload.mapper.ts`)
- **3.2** imports AppModule : 16 modules listés
- **3.3** couche d'accès : `synchronize: false`, `migrationsRun: false`,
  CLI migration:generate/run/revert/show
- **3.5** couche métier : 12 services décrits
- **3.7** flux : cycle de perception (mermaid) + configuration droits/tarifs (mermaid)
- **4** modèle de données : entités existantes enrichies + 19 entités du
  modèle cible détaillées (clés, CHECK, UQ, FK)
- **5** diagramme UML : 18 classes, relations mises à jour
- **6** vue fonctionnelle : PerceptionService/QuittanceService/SuiviService
- **7/8** analyse et conclusion : forces, axes d'amélioration cochés,
  tableaux modules + migrations

### Vérification
- `npx nest build` OK
- `npx jest src/sigrnf src/suivi src/modele_cible` : 5 suites / 26 tests verts
