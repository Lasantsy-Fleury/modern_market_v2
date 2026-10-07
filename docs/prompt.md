Tu es un architecte/développeur senior NestJS + TypeORM + PostgreSQL. Tu travailles sur le dépôt ModernMarket Backend. Objectif : supprimer les incohérences de conception entre le modèle legacy (zone, local, location, type_local, paiement, paiement_location) et le modèle cible (modele_cible, droits, perception, quittance, terrain, suivi), sans casser les flux existants ni la couche SIGRNF.

RÈGLES GÉNÉRALES
- Une seule source de vérité par donnée. Toute donnée dérivable est calculée, sauf snapshot comptable immuable explicitement documenté.
- synchronize reste à false. Toute modification de schéma = migration TypeORM versionnée, réversible (up/down), avec migration des DONNÉES existantes (pas seulement du schéma).
- Pas de suppression brutale d'un champ/endpoint utilisé : d'abord une phase de dépréciation (champ conservé en lecture, Swagger marqué deprecated, log d'avertissement), suppression à la fin.
- Ne rien inventer sur SIGRNF (garder les TODO(SIGRNF)).
- Chaque lot doit compiler, passer les tests existants et ajouter des tests pour les nouvelles règles.
- Si un point est ambigu, applique la décision par défaut ci-dessous et signale-le dans le rapport.

PHASE 1 — AUDIT (lecture seule, aucune modification de code)
1. Lis le code réel (entités, services, DTO, contrôleurs, migrations, tests) et confirme ou infirme chacun des points ci-dessous en citant fichiers et lignes. Ajoute toute autre incohérence trouvée.
2. Pour chaque point : constat, impact (bug possible, donnée ambiguë, risque de désynchronisation), décision retenue, plan de migration des données, endpoints/DTO impactés.
3. Produis un rapport (docs/audit_coherence.md) avec un plan en lots ordonnés et les risques de rétro-compatibilité. ARRÊTE-TOI et attends ma validation avant la phase 2.

POINTS À VÉRIFIER ET DÉCISIONS PAR DÉFAUT

A. Tarif
- Constat : Typelocal.tarif (valeur libre) coexiste avec l'entité Tarif.
- Décision : l'entité Tarif (via la résolution GET /tarifs/resoudre) est l'unique source des montants. Migrer chaque Typelocal.tarif existant en une ligne Tarif (typeDroit de loyer/occupation adapté, typelocalId renseigné, dates de validité cohérentes), puis déprécier puis supprimer Typelocal.tarif. Typelocal garde ses caractéristiques physiques (longueur, largeur, type_contrat, description). Tout endpoint qui renvoyait le tarif d'un type de local doit le renvoyer via le résolveur.
- Supprimer Tarif.periodiciteId : la périodicité vient de TypeDroit.periodiciteId.
- Ajouter une validation : le seul FK de portée renseigné doit correspondre à TypeDroit.portee (EMPLACEMENT→localId ou typelocalId, ZONE→zoneId, MARCHE→marcheId), avec contrainte applicative + CHECK SQL si possible. Interdire deux tarifs actifs qui se chevauchent pour la même combinaison de critères.

B. Périodicité
- Remplacer Location.periodicite (enum) par periodiciteId (FK vers Periodicite) et mapper les anciennes valeurs enum vers des lignes Periodicite. Clarifier le rôle de Location.frequence par rapport à Periodicite.nbUnites (supprimer s'il est redondant). Vérifier aussi Typelocal.type_contrat.

C. Paiements
- Un seul modèle d'imputation : PaiementRedevance. Supprimer Paiement.redevanceId (migrer vers PaiementRedevance).
- Migrer Paiementlocation (legacy) vers Echeance/Redevance/PaiementRedevance, ou le conserver en lecture seule via un adaptateur de compatibilité si la migration est impossible sans perte (à justifier dans le rapport). Les endpoints legacy de paiement délèguent à PerceptionService : un seul chemin d'écriture pour tout paiement.
- Unifier canal/source : garder source comme unique champ ; canal devient dérivé ou supprimé (y compris sur Recette).
- Définir explicitement que Quittance et Recette ne sont créées que pour un Paiement validé (status success), dans la même transaction que le paiement. Documenter les cas failed.
- Relier peutPayerPartiel à la règle de validation de l'imputation (refus d'un paiement partiel si le type de droit l'interdit).

D. Identité et occupation
- Commercant est le pivot : Location.commercantId devient obligatoire ; supprimer Location.id_user et Location.nif (migration : retrouver/créer le Commercant correspondant, sans doublon, nif jamais unique). L'utilisateur s'obtient via Commercant.userId.
- Location vs Affectation : analyse les usages réels. Par défaut, Location = contrat financier, et Affectation = occupation terrain uniquement si elle couvre des cas sans contrat ; sinon fusionner Affectation dans Location. Supprimer Affectation.montantTheoriqueMensuel (le montant vient du Tarif). Justifier la décision dans le rapport.
- Tickets / sans emplacement fixe : rendre Echeance.locationId nullable avec règle de validation selon TypeDroit.famille (DROIT → location requise, TICKET → non), ou prévoir l'entité porteuse adéquate.

E. Échéance / Redevance
- Clarifier les rôles (Echeance = planification d'une période ; Redevance = créance ouverte) ou les fusionner si leur séparation n'apporte rien. Si on les garde : retirer de Redevance les champs recopiés (locationId, commercantId, accessibles via echeance), et un seul montant de référence.
- montantRegle et les statuts sont dérivés de la somme des PaiementRedevance via situation.calculator. Soit les calculer à la lecture, soit les maintenir uniquement dans PerceptionService, dans la transaction, avec une commande/test de réconciliation.

F. Statut du local
- Local.statut : LOUE/DISPONIBLE dérivés des locations/affectations actives ; seul INDISPONIBLE reste une saisie manuelle (champ séparé si nécessaire). Interdire l'écriture directe du statut dérivé hors du service concerné.

G. Terrain
- Controle/Presence : ajouter des règles de cohérence (si presenceId est renseigné, zoneId/localId/commercantId doivent être identiques à ceux de la Presence). Conserver les champs propres du contrôle pour les cas sans présence (GPS_INDISPONIBLE, SANS_EMPLACEMENT_FIXE) en rendant presenceId nullable si ce n'est pas déjà le cas.

H. Géographie
- Remplacer Zone.municipalityId et Typelocal.municipalityId (string) par des références cohérentes vers Commune/Marche. Rendre Zone.marcheId obligatoire après migration (créer un Marche par défaut par commune si nécessaire) ; la commune est dérivée via Marche.

I. Snapshots comptables
- Quittance.montant/agentId et Recette.montant/dateRecette/modePaiementId : conservés uniquement comme snapshots immuables, créés dans la transaction du paiement, sans endpoint de modification. Annulation/remplacement via statut (ANNULEE/REMPLACEE) + AuditLog. Retirer les autres duplications.

J. SIGRNF
- Un seul point d'émission : après commit de TOUT paiement validé, quel que soit le chemin (legacy ou PerceptionService), via un événement interne unique (EventEmitter ou appel centralisé). Conserver l'idempotence et le fait que SigrnfService ne lève jamais d'exception.

K. Nommage et organisation
- Documenter une convention (PK, casse des colonnes, langue). Ne renommer que les entités touchées par ces lots ; pas de renommage massif des PK legacy sans validation. Regrouper la logique de chaque domaine dans un seul module de référence.

PHASE 2 — IMPLÉMENTATION (après ma validation du rapport)
- Un lot par PR/commit logique, dans l'ordre : A+B (tarif/périodicité) → D (identité/occupation) → C+E+I (paiement/perception/snapshots) → F+G+H → J → K.
- Pour chaque lot : migration schéma + migration de données, entités, DTO, services, contrôleurs, Swagger (deprecated si besoin), tests unitaires et d'intégration (y compris tests de migration de données sur un jeu de données représentatif), rollback testé.
- Ajouter une commande de vérification d'intégrité (ex. npm run check:integrity) qui détecte : tarifs chevauchants, redevances dont montantRegle ≠ somme des imputations, locations sans commerçant, paiements validés sans quittance/recette, zones sans marché.
- À la fin : mettre à jour README/architecture (sections 3.7, 4, 5 : diagramme UML COMPLET avec toutes les entités du modèle cible, et sections migrations), docs/sigrnf_integration.md si impacté, et fournir un guide de migration pour le front/mobile (endpoints modifiés, déprécations, dates de suppression).

LIVRABLES
1. docs/audit_coherence.md (phase 1)
2. Code + migrations + tests (phase 2)
3. Documentation d'architecture à jour
4. Liste des changements cassants pour les clients de l'API