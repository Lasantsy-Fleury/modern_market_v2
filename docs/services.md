# Services API Documentation

## Service Auth

**Base Path:** `/serviceauth`

### Gestion des applications
#### Créer une nouvelle application
- **Endpoint:** `POST /serviceauth/application`
- **Description:** Crée une nouvelle application avec les informations fournies.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | app_name | string | Oui | Nom de l'application |
  | app_url | string | Oui | URL de l'application |
  | affiliation | string | Non | Affiliation de l'application |
- **Réponse 201:** L'application a été créée avec succès.
- **Réponse 400:** Erreur de validation.

#### Récupérer toutes les applications
- **Endpoint:** `GET /serviceauth/application`
- **Description:** Récupère toutes les applications avec pagination.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (par défaut: 1) |
  | limit | number | Non | Nombre d'éléments par page (par défaut: 10) |
- **Réponse 200:** Liste paginée des applications.

#### Récupérer une application par ID
- **Endpoint:** `GET /serviceauth/application/{id}`
- **Description:** Récupère une application par son ID.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de l'application |
- **Réponse 200:** L'application a été trouvée.
- **Réponse 404:** Application non trouvée.

#### Mettre à jour une application
- **Endpoint:** `PATCH /serviceauth/application/{id}`
- **Description:** Met à jour une application.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de l'application |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | app_name | string | Non | Nom de l'application |
  | app_url | string | Non | URL de l'application |
  | affiliation | string | Non | Affiliation de l'application |
- **Réponse 200:** L'application a été mise à jour.
- **Réponse 404:** Application non trouvée.

#### Supprimer une application
- **Endpoint:** `DELETE /serviceauth/application/{id}`
- **Description:** Supprime une application.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de l'application |
- **Réponse 200:** L'application a été supprimée.
- **Réponse 404:** Application non trouvée.

#### Récupérer une application par son slug
- **Endpoint:** `GET /serviceauth/application/slug/{slug}`
- **Description:** Récupère une application par son slug.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | slug | string | Oui | Slug de l'application |
- **Réponse 200:** L'application a été trouvée.
- **Réponse 404:** Application non trouvée.

#### Récupérer les applications avec affiliation AGVM
- **Endpoint:** `GET /serviceauth/application/affiliation/agvm`
- **Description:** Récupère toutes les applications avec affiliation AGVM.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (par défaut: 1) |
  | limit | number | Non | Nombre d'éléments par page (par défaut: 10) |
- **Réponse 200:** Liste paginée des applications avec affiliation AGVM.

### Gestion des utilisateurs
#### Créer un utilisateur
- **Endpoint:** `POST /serviceauth/users`
- **Description:** Crée un nouvel utilisateur avec les données fournies.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | user_pseudo | string | Oui | Le pseudo de l'utilisateur |
  | user_email | string | Oui | L'adresse email de l'utilisateur |
  | user_password | string | Oui | Le mot de passe de l'utilisateur |
  | user_phone | string | Non | Le numéro de téléphone de l'utilisateur |
  | municipality_id | string | Oui | L'identifiant de la municipalité associée |
  | id_citizen | string | Non | L'identifiant du citoyen |
- **Réponse 201:** Utilisateur créé avec succès.
- **Réponse 400:** Données invalides ou email déjà utilisé.

#### Lister les utilisateurs paginés
- **Endpoint:** `GET /serviceauth/users`
- **Description:** Retourne une liste paginée des utilisateurs avec leurs informations citoyen.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | search | string | Non | Terme de recherche |
  | limit | number | Non | Nombre d'éléments par page (défaut 10, max 100) |
  | page | number | Non | Numéro de page (défaut 1) |
- **Réponse 200:** Liste paginée récupérée avec succès.

#### Obtenir un utilisateur par ID
- **Endpoint:** `GET /serviceauth/users/{id}`
- **Description:** Retourne les détails d'un utilisateur spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | UUID de l'utilisateur |
- **Réponse 200:** Utilisateur trouvé.
- **Réponse 404:** Utilisateur introuvable.

#### Mettre à jour un utilisateur
- **Endpoint:** `PUT /serviceauth/users/{id}`
- **Description:** Met à jour les informations d'un utilisateur existant.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | UUID de l'utilisateur |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | user_pseudo | string | Oui | Le pseudo de l'utilisateur |
  | user_email | string | Oui | L'adresse email de l'utilisateur |
  | user_password | string | Oui | Le mot de passe de l'utilisateur |
  | user_phone | string | Non | Le numéro de téléphone de l'utilisateur |
  | municipality_id | string | Oui | L'identifiant de la municipalité associée |
  | id_citizen | string | Non | L'identifiant du citoyen |
- **Réponse 200:** Utilisateur mis à jour avec succès.
- **Réponse 400:** Données invalides.
- **Réponse 404:** Utilisateur introuvable.

#### Supprimer un utilisateur
- **Endpoint:** `DELETE /serviceauth/users/{id}`
- **Description:** Supprime définitivement un utilisateur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | UUID de l'utilisateur |
- **Réponse 200:** Utilisateur supprimé avec succès.
- **Réponse 404:** Utilisateur introuvable.

#### Assigner des rôles à un utilisateur
- **Endpoint:** `POST /serviceauth/users/{id}/roles`
- **Description:** Ajoute un ou plusieurs rôles à un utilisateur existant.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | UUID de l'utilisateur |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | role_ids | array[number] | Oui | Liste des identifiants des rôles à assigner |
- **Réponse 200:** Rôles assignés avec succès.
- **Réponse 400:** Un ou plusieurs rôles sont invalides.
- **Réponse 404:** Utilisateur introuvable.
- **Réponse 409:** Conflit - rôles déjà assignés.
- **Réponse 500:** Erreur interne.

#### Retirer des rôles à un utilisateur
- **Endpoint:** `PATCH /serviceauth/users/{id}/roles`
- **Description:** Retire un ou plusieurs rôles à un utilisateur existant.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | UUID de l'utilisateur |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | role_ids | array[number] | Oui | Liste des identifiants des rôles à retirer |
- **Réponse 200:** Rôles retirés avec succès.
- **Réponse 400:** Un ou plusieurs rôles sont invalides.
- **Réponse 404:** Utilisateur introuvable.
- **Réponse 409:** Conflit - rôles non assignés.
- **Réponse 500:** Erreur interne.

#### Créer un utilisateur avec des rôles
- **Endpoint:** `POST /serviceauth/users/create-with-roles`
- **Description:** Crée un nouvel utilisateur et lui assigne directement un ou plusieurs rôles.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | user_pseudo | string | Oui | Pseudo de l'utilisateur |
  | user_email | string | Oui | Email de l'utilisateur |
  | user_password | string | Oui | Mot de passe de l'utilisateur |
  | user_phone | string | Non | Numéro de téléphone |
  | municipality_id | string | Oui | Identifiant de la municipalité |
  | id_citizen | string | Oui | Identifiant du citoyen associé |
  | role_ids | array[number] | Oui | Liste des IDs des rôles à assigner |
- **Réponse 201:** Utilisateur créé avec succès et rôles assignés.
- **Réponse 400:** Erreur de validation ou rôle(s) invalide(s).
- **Réponse 409:** Utilisateur existe déjà.

#### Utilisateur avec citoyen associé
- **Endpoint:** `GET /serviceauth/users/citizen/{id}`
- **Description:** Retourne l'utilisateur et ses infos citoyen.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | UUID de l'utilisateur |
- **Réponse 200:** Utilisateur et citoyen trouvés.
- **Réponse 404:** Utilisateur ou citoyen introuvable.

#### Créer utilisateur + citoyen (multipart) avec informations spéciales
- **Endpoint:** `POST /serviceauth/users/register-with-citizen-short`
- **Description:** Crée d'abord le citoyen via API externe, puis l'utilisateur lié avec les informations spéciales.
- **Body Parameters (multipart/form-data):**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | citizen_name | string | Oui | Nom du citoyen |
  | citizen_lastname | string | Oui | Prénom du citoyen |
  | citizen_national_card_number | number | Oui | Numéro de carte nationale d'identité |
  | citizen_adress | string | Oui | Adresse du citoyen |
  | citizen_national_card_location | string | Oui | Lieu de délivrance de la carte nationale |
  | citizen_national_card_date | string | Oui | Date de délivrance (YYYY-MM-DD) |
  | fokotany_formatted_id | string | Oui | Identifiant formaté du fokontany |
  | citizen_work | string | Oui | Profession du citoyen |
  | citizen_prise_service | string | Oui | Date de prise de service (YYYY-MM-DD) |
  | user_pseudo | string | Oui | Pseudo de l'utilisateur |
  | user_email | string | Oui | Email de l'utilisateur |
  | user_password | string | Oui | Mot de passe (min 6 caractères) |
  | user_phone | string | Oui | Numéro de téléphone |
  | municipality_id | string | Oui | Identifiant de la commune |
  | citizen_photo | file | Non | Photo de la carte nationale (PNG/JPEG) |
- **Réponse 201:** Utilisateur et citoyen créés avec succès.
- **Réponse 400:** Données invalides ou erreur API citoyen.

#### Créer utilisateur + citoyen (multipart) avec rôles
- **Endpoint:** `POST /serviceauth/users/register-with-citizen-short-role`
- **Description:** Crée d'abord le citoyen via API externe, puis l'utilisateur lié avec les rôles fournis.
- **Body Parameters (multipart/form-data):**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | citizen_name | string | Oui | Nom du citoyen |
  | citizen_lastname | string | Oui | Prénom du citoyen |
  | citizen_national_card_number | number | Oui | Numéro de carte nationale d'identité |
  | citizen_adress | string | Oui | Adresse du citoyen |
  | citizen_national_card_location | string | Oui | Lieu de délivrance de la carte nationale |
  | citizen_national_card_date | string | Oui | Date de délivrance (YYYY-MM-DD) |
  | fokotany_formatted_id | string | Oui | Identifiant formaté du fokontany |
  | citizen_work | string | Oui | Profession du citoyen |
  | citizen_prise_service | string | Oui | Date de prise de service (YYYY-MM-DD) |
  | user_pseudo | string | Oui | Pseudo de l'utilisateur |
  | user_email | string | Oui | Email de l'utilisateur |
  | user_password | string | Oui | Mot de passe (min 6 caractères) |
  | user_phone | string | Oui | Numéro de téléphone |
  | municipality_id | string | Oui | Identifiant de la commune |
  | citizen_photo | file | Non | Photo de la carte nationale (PNG/JPEG) |
  | role_ids | array[number] | Oui | Liste des IDs des rôles à assigner |
- **Réponse 201:** Utilisateur et citoyen créés avec succès avec rôles.
- **Réponse 400:** Données invalides ou erreur API citoyen.

#### Utilisateur avec citoyen associé par ID citoyen
- **Endpoint:** `GET /serviceauth/users/user-citizen/{id_citizen}`
- **Description:** Retourne l'utilisateur et ses infos citoyen.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_citizen | string | Oui | UUID du citoyen |
- **Réponse 200:** Utilisateur et citoyen trouvés.
- **Réponse 404:** Citoyen introuvable.

#### Lister les utilisateurs liés à une application
- **Endpoint:** `GET /serviceauth/users/application/{appId}`
- **Description:** Retourne tous les utilisateurs rattachés à une application donnée via leurs rôles.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | appId | number | Oui | Identifiant de l'application |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Page actuelle |
  | limit | number | Non | Nombre d'éléments par page |
  | search | string | Non | Terme de recherche |
- **Réponse 200:** Liste des utilisateurs liés à l'application.
- **Réponse 404:** Aucun utilisateur trouvé.

### Gestion des rôles
#### Créer un rôle
- **Endpoint:** `POST /serviceauth/roles`
- **Description:** Permet de créer un nouveau rôle.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | role_name | string | Oui | Le nom du rôle |
  | app_id | number | Oui | L'identifiant de l'application associée |
- **Réponse 201:** Le rôle a été créé avec succès.
- **Réponse 400:** Requête invalide.
- **Réponse 409:** Le rôle existe déjà.

#### Lister les rôles
- **Endpoint:** `GET /serviceauth/roles`
- **Description:** Retourne une liste de tous les rôles.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (par défaut: 1) |
  | limit | number | Non | Nombre d'éléments par page (par défaut: 10) |
- **Réponse 200:** La liste paginée des rôles.

#### Obtenir un rôle
- **Endpoint:** `GET /serviceauth/roles/{id}`
- **Description:** Retourne les détails d'un rôle spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | L'identifiant du rôle |
- **Réponse 200:** Les détails du rôle.
- **Réponse 404:** Rôle non trouvé.

#### Mettre à jour un rôle
- **Endpoint:** `PUT /serviceauth/roles/{id}`
- **Description:** Met à jour les informations d'un rôle existant.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | L'identifiant du rôle |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | role_name | string | Oui | Le nom du rôle |
  | app_id | number | Oui | L'identifiant de l'application associée |
- **Réponse 200:** Le rôle a été mis à jour avec succès.
- **Réponse 404:** Rôle non trouvé.

#### Supprimer un rôle
- **Endpoint:** `DELETE /serviceauth/roles/{id}`
- **Description:** Supprime un rôle existant.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | L'identifiant du rôle à supprimer |
- **Réponse 200:** Le rôle a été supprimé avec succès.
- **Réponse 404:** Rôle non trouvé.

#### Assigner des permissions à un rôle
- **Endpoint:** `POST /serviceauth/roles/{id}/permissions`
- **Description:** Permet d'assigner une ou plusieurs permissions à un rôle spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | L'identifiant du rôle |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | permission_ids | array[number] | Oui | Liste des identifiants des permissions |
- **Réponse 200:** Les permissions ont été assignées avec succès.
- **Réponse 404:** Rôle ou permissions non trouvés.

#### Obtenir les permissions d'un rôle
- **Endpoint:** `GET /serviceauth/roles/{id}/permissions`
- **Description:** Retourne les permissions d'un rôle spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | L'identifiant du rôle |
- **Réponse 200:** Les permissions ont été retournées avec succès.
- **Réponse 404:** Rôle non trouvé.

#### Créer plusieurs rôles
- **Endpoint:** `POST /serviceauth/roles/bulk`
- **Description:** Permet de créer plusieurs rôles d'un coup pour une ou plusieurs applications.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | roles | array | Oui | Liste des rôles à créer (voir CreateRoleDto) |
- **Réponse 201:** Les rôles ont été créés avec succès.

#### Récupérer tous les rôles par app_id
- **Endpoint:** `GET /serviceauth/roles/application/{app_id}`
- **Description:** Récupère tous les rôles d'une application.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | app_id | number | Oui | ID de l'application |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (par défaut: 1) |
  | limit | number | Non | Nombre d'éléments par page (par défaut: 10) |
- **Réponse 200:** Liste des rôles trouvés.
- **Réponse 404:** Aucun rôle trouvé.

### Gestion des permissions
#### Créer une permission
- **Endpoint:** `POST /serviceauth/permissions`
- **Description:** Permet de créer une nouvelle permission.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | permission_label | string | Oui | Label de la permission |
- **Réponse 201:** La permission a été créée avec succès.
- **Réponse 400:** Requête invalide.

#### Lister toutes les permissions
- **Endpoint:** `GET /serviceauth/permissions`
- **Description:** Retourne une liste paginée de toutes les permissions.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (par défaut: 1) |
  | limit | number | Non | Nombre d'éléments par page (par défaut: 10) |
- **Réponse 200:** La liste paginée des permissions.

#### Obtenir une permission
- **Endpoint:** `GET /serviceauth/permissions/{id}`
- **Description:** Retourne les détails d'une permission spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | L'identifiant de la permission |
- **Réponse 200:** Les détails de la permission.
- **Réponse 404:** Permission non trouvée.

#### Mettre à jour une permission
- **Endpoint:** `PUT /serviceauth/permissions/{id}`
- **Description:** Met à jour les informations d'une permission existante.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | L'identifiant de la permission |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | permission_label | string | Oui | Label de la permission |
- **Réponse 200:** La permission a été mise à jour avec succès.
- **Réponse 404:** Permission non trouvée.

#### Supprimer une permission
- **Endpoint:** `DELETE /serviceauth/permissions/{id}`
- **Description:** Supprime une permission existante.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | L'identifiant de la permission |
- **Réponse 200:** La permission a été supprimée avec succès.
- **Réponse 404:** Permission non trouvée.

#### Lister les permissions d'une application
- **Endpoint:** `GET /serviceauth/permissions/by-application/{app_id}`
- **Description:** Retourne une liste paginée des permissions associées à une application donnée.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | app_id | number | Oui | L'identifiant de l'application |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (par défaut: 1) |
  | limit | number | Non | Nombre d'éléments par page (par défaut: 10) |
- **Réponse 200:** La liste paginée des permissions pour l'application.

### Authentification
#### Connexion utilisateur
- **Endpoint:** `POST /serviceauth/auth/login`
- **Description:** Connexion utilisateur.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | user_email | string | Oui | L'adresse email de l'utilisateur |
  | user_password | string | Oui | Le mot de passe de l'utilisateur |
- **Réponse 201:** Connexion réussie, retourne un token JWT.

#### Générer un token JWT à partir du SSO
- **Endpoint:** `POST /serviceauth/auth/sso/token`
- **Description:** Étape 1 - Vérifier l'utilisateur SSO et générer un JWT applicatif.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | sso_token | string | Oui | Le token JWT SSO Keycloak |
- **Réponse 200:** retourne le JWT applicatif → utilisateur connecté.
- **Réponse 401:** utilisateur inconnu → rediriger vers l'inscription.

#### Inscription SSO simplifiée
- **Endpoint:** `POST /serviceauth/auth/sso/register`
- **Description:** Étape 2 - Crée un utilisateur minimal à partir du sso_token Keycloak.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | sso_token | string | Oui | Le token JWT SSO (Keycloak access_token ou id_token) |
  | municipality_id | string | Non | Identifiant de la municipalité |
  | user_phone | string | Non | Numéro de téléphone |
  | citizen_national_card_number | number | Non | Numéro de carte nationale d'identité |
- **Réponse 200:** Token JWT généré.
- **Réponse 400:** Données citoyen manquantes.

#### Inscription SSO complète
- **Endpoint:** `POST /serviceauth/auth/sso/register-complete`
- **Description:** Étape 3 - Crée le citoyen via l'API citoyenne et met à jour l'utilisateur existant.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | sso_token | string | Oui | Le token JWT SSO Keycloak |
  | citizen_national_card_number | number | Oui | Numéro de carte nationale d'identité |
  | citizen_adress | string | Oui | Adresse du citoyen |
  | citizen_national_card_location | string | Oui | Lieu de délivrance de la CNI |
  | citizen_national_card_date | string | Oui | Date de délivrance de la CNI |
  | fokotany_formatted_id | string | Oui | Identifiant formaté du fokontany |
  | citizen_work | string | Non | Profession |
  | citizen_prise_service | string | Non | Date de prise de service |
  | user_phone | string | Oui | Numéro de téléphone |
  | municipality_id | string | Oui | Identifiant de la commune |
- **Réponse 201:** Citoyen créé et profil utilisateur mis à jour.

#### Webhook Keycloak
- **Endpoint:** `POST /serviceauth/auth/keycloak-webhook`
- **Description:** Webhook Keycloak - synchronisation des événements.
- **Headers:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | X-Webhook-Secret | string | Oui | Secret pour l'authentification du webhook |
- **Réponse 200:** Événement reçu et traité.

#### Obtenir le profil utilisateur
- **Endpoint:** `GET /serviceauth/auth/profile`
- **Description:** Obtenir le profil utilisateur (authentification requise).
- **Réponse 200:** Retourne les informations utilisateur.

#### Mettre à jour le profil utilisateur
- **Endpoint:** `PATCH /serviceauth/auth/profile`
- **Description:** Mettre à jour le profil utilisateur.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | user_pseudo | string | Non | Nouveau pseudo |
  | user_email | string | Non | Nouvel email |
  | user_phone | string | Non | Nouveau numéro de téléphone |
  | user_password | string | Non | Nouveau mot de passe |
- **Réponse 200:** Profil utilisateur mis à jour avec succès.

#### Vérifier le token JWT
- **Endpoint:** `GET /serviceauth/auth/verify-token`
- **Description:** Vérifier le token JWT.
- **Réponse 200:** Retourne les informations utilisateur.

#### Obtenir les applications autorisées
- **Endpoint:** `GET /serviceauth/auth/app-autorise`
- **Description:** Obtenir les applications autorisées pour l'utilisateur.
- **Réponse 200:** Liste des applications autorisées.

#### Obtenir les applications autorisées AGVM
- **Endpoint:** `GET /serviceauth/auth/app-autorise-agvm`
- **Description:** Obtenir les applications autorisées avec affiliation AGVM.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (par défaut: 1) |
  | limit | number | Non | Nombre d'éléments par page (par défaut: 10) |
- **Réponse 200:** Liste des applications AGVM autorisées.

#### Déconnexion utilisateur
- **Endpoint:** `POST /serviceauth/auth/logout`
- **Description:** Déconnexion utilisateur.
- **Réponse 200:** Déconnexion réussie.

#### Demande de réinitialisation de mot de passe
- **Endpoint:** `POST /serviceauth/auth/forgot-password`
- **Description:** Demande de réinitialisation de mot de passe.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | user_email | string | Oui | Adresse e-mail de l'utilisateur |
- **Réponse 200:** E-mail envoyé si l'adresse existe.

#### Réinitialiser le mot de passe avec le code reçu
- **Endpoint:** `POST /serviceauth/auth/reset-password`
- **Description:** Réinitialiser le mot de passe avec le code reçu par email.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | token | string | Oui | Token (code) reçu par e-mail |
  | newPassword | string | Oui | Nouveau mot de passe (min 6 caractères) |
  | user_email | string | Oui | Adresse e-mail de l'utilisateur |
- **Réponse 200:** Mot de passe mis à jour.

#### Réinitialiser le mot de passe sans token
- **Endpoint:** `POST /serviceauth/auth/reset-password-without-token`
- **Description:** Réinitialiser le mot de passe sans token (pour usage interne).
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | user_email | string | Oui | Adresse e-mail de l'utilisateur |
  | newPassword | string | Oui | Nouveau mot de passe (min 6 caractères) |
- **Réponse 200:** Mot de passe mis à jour.

### Navigation
#### Créer une nouvelle navigation
- **Endpoint:** `POST /serviceauth/navigation`
- **Description:** Crée une nouvelle navigation.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | navigation_label_key | string | Oui | Clé de label de la navigation |
  | navigation_path | string | Oui | Chemin de la navigation |
  | navigation_icon | string | Oui | Icône de la navigation |
  | navigation_order | number | Oui | Ordre de la navigation |
  | navigation_show | boolean | Oui | Indique si la navigation est visible |
  | navigation_component | string | Oui | Composant associé |
  | navigation_category | string | Oui | Catégorie de la navigation |
  | navigation_category_label_key | string | Oui | Clé de label de la catégorie |
  | app_id | number | Oui | ID de l'application liée |
  | requiredRoles | array[string] | Oui | Liste des rôles requis |
- **Réponse 201:** Navigation créée avec succès.

#### Récupérer toutes les navigations formatées
- **Endpoint:** `GET /serviceauth/navigation`
- **Description:** Récupère toutes les navigations formatées.
- **Réponse 200:** Liste formatée des navigations.

#### Récupérer une navigation par ID
- **Endpoint:** `GET /serviceauth/navigation/{id}`
- **Description:** Récupère une navigation par ID.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | ID de la navigation |
- **Réponse 200:** Navigation trouvée.
- **Réponse 404:** Navigation non trouvée.

#### Mettre à jour une navigation
- **Endpoint:** `PATCH /serviceauth/navigation/{id}`
- **Description:** Met à jour une navigation.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | ID de la navigation |
- **Body Parameters:** Les mêmes champs que CreateNavigationDto (tous optionnels).
- **Réponse 200:** Navigation mise à jour.

#### Supprimer une navigation
- **Endpoint:** `DELETE /serviceauth/navigation/{id}`
- **Description:** Supprime une navigation.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | ID de la navigation |
- **Réponse 204:** Navigation supprimée.

#### Créer plusieurs navigations en une requête
- **Endpoint:** `POST /serviceauth/navigation/bulk`
- **Description:** Crée plusieurs navigations en une requête.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | navigations | array | Oui | Liste des navigations à créer (voir CreateNavigationDto) |
- **Réponse 201:** Navigations créées.

#### Récupérer les navigations d'une application
- **Endpoint:** `GET /serviceauth/navigation/by-app/{app_id}`
- **Description:** Récupère toutes les navigations d'une application.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | app_id | number | Oui | ID de l'application |
- **Réponse 200:** Navigations trouvées.

#### Ajouter un rôle à une navigation
- **Endpoint:** `POST /serviceauth/navigation/add-role`
- **Description:** Ajoute un rôle à une navigation.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | navigation_id | number | Oui | ID de la navigation |
  | role_id | array[string] | Oui | Liste des ID des rôles |
- **Réponse 200:** Rôle ajouté avec succès.

### Gestion des services
#### Créer un nouveau service
- **Endpoint:** `POST /serviceauth/services`
- **Description:** Crée un nouveau service.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | name_service | string | Oui | Nom du service |
  | prefix_service | string | Oui | Préfixe du service |
  | target_service | string | Oui | URL du service avec préfixe |
  | icon_service | string | Oui | Icône FontAwesome ou autre |
  | description_service | string | Oui | Description du service |
  | status_service | boolean | Oui | Statut actif/inactif du service |
- **Réponse 201:** Le service a été créé.
- **Réponse 400:** Données invalides.

#### Lister tous les services
- **Endpoint:** `GET /serviceauth/services`
- **Description:** Liste tous les services.
- **Réponse 200:** Liste des services.

#### Obtenir un service par ID
- **Endpoint:** `GET /serviceauth/services/get-by-id/{id}`
- **Description:** Obtient un service par ID.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | Identifiant du service |
- **Réponse 200:** Détails du service.
- **Réponse 404:** Service non trouvé.

#### Mettre à jour un service
- **Endpoint:** `PATCH /serviceauth/services/{id}`
- **Description:** Met à jour un service.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | Identifiant du service |
- **Body Parameters:** Les mêmes champs que CreateServiceDto (tous optionnels).
- **Réponse 200:** Service mis à jour.

#### Désactiver (soft delete) un service
- **Endpoint:** `DELETE /serviceauth/services/{id}`
- **Description:** Désactive un service.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | Identifiant du service |
- **Réponse 200:** Service désactivé.

#### Liste agrégée de tous les services et leurs endpoints
- **Endpoint:** `GET /serviceauth/services/aggregate`
- **Description:** Liste agrégée de tous les services et leurs endpoints (format custom).
- **Réponse 200:** Liste custom des services.

#### Liste agrégée pour les vues
- **Endpoint:** `GET /serviceauth/services/aggregate-for-views`
- **Description:** Liste agrégée de tous les services et leurs endpoints (format custom).
- **Réponse 200:** Liste custom des services.

#### Vérifier l'accès à un endpoint
- **Endpoint:** `POST /serviceauth/services/check-access`
- **Description:** Vérifie l'accès à un endpoint selon la permission de l'utilisateur.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | method | string | Oui | Méthode HTTP |
  | path | string | Oui | Path à vérifier |
- **Réponse 200:** Accès possible ou non.

### Gestion des API Keys
#### Générer une API-KEY sécurisée
- **Endpoint:** `POST /serviceauth/api-key/generate`
- **Description:** Génère une API-KEY sécurisée.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | permissions | array[number] | Oui | Liste des permissions |
  | municipality_id | number | Oui | ID de la municipalité |
  | expiresIn | string | Non | Durée d'expiration (défaut: 7d) |
- **Réponse 201:** API-KEY générée avec succès.

#### Renouveler une API-KEY
- **Endpoint:** `POST /serviceauth/api-key/renew`
- **Description:** Renouvelle une API-KEY.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | apiKeyId | string | Oui | ID de l'API-KEY |
  | expiresIn | string | Non | Durée d'expiration (défaut: 7d) |
- **Réponse 200:** API-KEY renouvelée.

#### Bannir une API-KEY
- **Endpoint:** `DELETE /serviceauth/api-key/{id}/ban`
- **Description:** Bannit une API-KEY.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de l'API-KEY |
- **Réponse 200:** API-KEY bannie.

#### Lister toutes les API-KEY
- **Endpoint:** `GET /serviceauth/api-key/list`
- **Description:** Liste toutes les API-KEY (paginées).
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Nombre par page (défaut: 10) |
- **Réponse 200:** Liste paginée des API-KEY.

#### Historique d'une API-KEY
- **Endpoint:** `GET /serviceauth/api-key/{id}/history`
- **Description:** Historique d'une API-KEY (paginé).
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de l'API-KEY |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Nombre par page (défaut: 10) |
- **Réponse 200:** Historique d'utilisation paginé.

#### Activer une API-KEY
- **Endpoint:** `GET /serviceauth/api-key/{id}/active`
- **Description:** Active une API-KEY.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de l'API-KEY |
- **Réponse 200:** API-KEY activée.

#### Désactiver une API-KEY
- **Endpoint:** `GET /serviceauth/api-key/{id}/inactive`
- **Description:** Désactive une API-KEY.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de l'API-KEY |
- **Réponse 200:** API-KEY désactivée.

#### Vérifier une API-KEY
- **Endpoint:** `GET /serviceauth/api-key/verify`
- **Description:** Vérifie une API-KEY.
- **Headers:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | api-key | string | Oui | API-KEY à vérifier |
- **Réponse 200:** API-KEY vérifiée.

### Gestion des endpoints
#### Créer un endpoint
- **Endpoint:** `POST /serviceauth/endpoints`
- **Description:** Crée un endpoint.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | route_path | string | Oui | Chemin de la route |
  | method_endpoint | string | Oui | Méthode HTTP |
  | service_id | number | Oui | ID du service parent |
  | is_public_endpoint | boolean | Oui | Endpoint public |
  | permission_id | number | Oui | ID de la permission liée |
- **Réponse 201:** Endpoint créé.
- **Réponse 400:** Données invalides.

#### Lister tous les endpoints
- **Endpoint:** `GET /serviceauth/endpoints`
- **Description:** Liste tous les endpoints.
- **Réponse 200:** Liste des endpoints.

#### Créer un endpoint par service avec permission
- **Endpoint:** `POST /serviceauth/endpoints/create-endpoint-by-service-with-permission`
- **Description:** Crée un endpoint par service avec permission.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | path | string | Oui | Chemin de la route |
  | method_endpoint | string | Oui | Méthode HTTP |
  | is_public_endpoint | boolean | Oui | Endpoint public |
  | permission_label | string | Oui | Label de la permission liée |
- **Réponse 201:** Endpoint créé.
- **Réponse 400:** Données invalides.

#### Créer plusieurs endpoints par service avec permission
- **Endpoint:** `POST /serviceauth/endpoints/create-many-endpoint-by-service-with-permission`
- **Description:** Crée plusieurs endpoints par service avec permission.
- **Body Parameters:** Array de CreateEndpointWithPermissionDto.
- **Réponse 201:** Endpoints créés.
- **Réponse 400:** Données invalides.

#### Obtenir un endpoint par ID
- **Endpoint:** `GET /serviceauth/endpoints/get-by-id/{id}`
- **Description:** Obtient un endpoint par ID.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | ID de l'endpoint |
- **Réponse 200:** Endpoint trouvé.
- **Réponse 404:** Endpoint non trouvé.

#### Mettre à jour un endpoint
- **Endpoint:** `PATCH /serviceauth/endpoints/update-by-id/{id}`
- **Description:** Met à jour un endpoint.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | ID de l'endpoint |
- **Body Parameters:** Les mêmes champs que CreateEndpointDto (tous optionnels).
- **Réponse 200:** Endpoint mis à jour.

#### Supprimer un endpoint
- **Endpoint:** `DELETE /serviceauth/endpoints/delete-by-id/{id}`
- **Description:** Supprime un endpoint.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | ID de l'endpoint |
- **Réponse 200:** Endpoint supprimé.

#### Obtenir tous les endpoints d'un service
- **Endpoint:** `GET /serviceauth/endpoints/get-by-service/{service_id}`
- **Description:** Obtient tous les endpoints d'un service.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | service_id | number | Oui | ID du service |
- **Réponse 200:** Liste des endpoints.

#### Lister tous les endpoints publics
- **Endpoint:** `GET /serviceauth/endpoints/public-routes`
- **Description:** Liste tous les endpoints publics GET et POST + docs.
- **Réponse 200:** Liste des routes publiques.

---

## Service Citoyen

**Base Path:** `/servicecitoyen`

### Gestion des citoyens
#### Réindexer tous les citoyens dans Typesense
- **Endpoint:** `POST /servicecitoyen/citizens/reindex`
- **Description:** Réindexe tous les citoyens dans Typesense.
- **Réponse 200:** Réindexation terminée avec le nombre de documents indexés et échoués.

#### Rechercher des citoyens
- **Endpoint:** `GET /servicecitoyen/citizens/search`
- **Description:** Recherche full-text dans Typesense.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | search | string | Oui | Terme de recherche |
  | page | number | Non | Numéro de page (défaut: 1) |
  | perPage | number | Non | Nombre de résultats par page (défaut: 20) |
- **Réponse 200:** Liste des citoyens correspondant à la recherche.

#### Rechercher un citoyen par numéro de carte nationale
- **Endpoint:** `GET /servicecitoyen/citizens/{nationalCardNumber}`
- **Description:** Recherche un citoyen via son numéro de carte nationale d'identité.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | nationalCardNumber | string | Oui | Numéro de la carte nationale d'identité |
- **Réponse 200:** Citoyen trouvé.
- **Réponse 404:** Aucun citoyen trouvé.

#### Créer un nouveau citoyen avec photo
- **Endpoint:** `POST /servicecitoyen/citizens`
- **Description:** Crée un citoyen avec les informations fournies et une photo d'identité.
- **Body Parameters (multipart/form-data):**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | citizen_photo | file | Oui | Photo d'identité du citoyen |
  | citizen_name | string | Oui | Prénom du citoyen |
  | citizen_lastname | string | Oui | Nom de famille du citoyen |
  | citizen_date_of_birth | string | Non | Date de naissance (YYYY-MM-DD) |
  | citizen_location_of_birth | string | Non | Lieu de naissance |
  | citizen_national_card_number | integer | Oui | Numéro de la carte nationale |
  | citizen_adress | string | Oui | Adresse du citoyen |
  | citizen_city | string | Non | Ville de résidence |
  | citizen_work | string | Non | Profession du citoyen |
  | citizen_prise_service | string | Non | Date de prise de service |
  | fokotany_formatted_id | string | Oui | Identifiant formaté du fokontany |
  | citizen_father | string | Non | Nom du père |
  | citizen_mother | string | Non | Nom de la mère |
  | citizen_national_card_location | string | Oui | Lieu de délivrance de la carte nationale |
  | citizen_national_card_date | string | Oui | Date de délivrance de la carte nationale |
- **Réponse 201:** Citoyen créé avec succès.
- **Réponse 400:** Requête invalide.
- **Réponse 409:** Conflit - citoyen existe déjà.
- **Réponse 500:** Erreur interne du serveur.

#### Rechercher un citoyen par son ID UUID
- **Endpoint:** `GET /servicecitoyen/citizens/getCitizenById/{id_citizen}`
- **Description:** Recherche un citoyen à partir de son identifiant unique (UUID).
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_citizen | string | Oui | Identifiant unique (UUID) du citoyen |
- **Réponse 200:** Citoyen trouvé.
- **Réponse 404:** Aucun citoyen trouvé.

#### Supprimer un citoyen par son ID UUID
- **Endpoint:** `DELETE /servicecitoyen/citizens/removeCitizen/{id_citizen}`
- **Description:** Supprime définitivement un citoyen de la base de données et de l'index Typesense.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_citizen | string | Oui | Identifiant unique (UUID) du citoyen |
- **Réponse 200:** Citoyen supprimé avec succès.
- **Réponse 404:** Aucun citoyen trouvé.

### Gestion des jobs
#### Créer un poste
- **Endpoint:** `POST /servicecitoyen/job`
- **Description:** Crée un poste.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | job_name | string | Oui | Nom du poste |
  | job_description | string | Non | Description détaillée du poste |
- **Réponse 201:** Poste créé avec succès.

#### Lister tous les postes
- **Endpoint:** `GET /servicecitoyen/job`
- **Description:** Liste tous les postes.
- **Réponse 200:** Liste des postes.

#### Voir un poste
- **Endpoint:** `GET /servicecitoyen/job/{id}`
- **Description:** Voir un poste.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | Identifiant UUID du poste |
- **Réponse 200:** Poste trouvé.
- **Réponse 404:** Poste introuvable.

#### Mettre à jour un poste
- **Endpoint:** `PATCH /servicecitoyen/job/{id}`
- **Description:** Met à jour un poste.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | Identifiant UUID du poste |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | job_name | string | Non | Nom du poste |
  | job_description | string | Non | Description détaillée du poste |
- **Réponse 200:** Poste mis à jour.

#### Supprimer un poste
- **Endpoint:** `DELETE /servicecitoyen/job/{id}`
- **Description:** Supprime un poste.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | Identifiant UUID du poste |
- **Réponse 200:** Poste supprimé.

#### Affecter un citoyen à un poste
- **Endpoint:** `POST /servicecitoyen/job/assign`
- **Description:** Affecte un citoyen à un poste à une date donnée.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | citizenId | string | Oui | Identifiant UUID du citoyen |
  | jobId | string | Oui | Identifiant UUID du poste |
  | assignedDate | string | Oui | Date d'affectation (YYYY-MM-DD) |
- **Réponse 201:** Affectation enregistrée.
- **Réponse 404:** Citoyen ou poste introuvable.

#### Consulter l'historique des postes d'un citoyen
- **Endpoint:** `GET /servicecitoyen/job/history/{citizenId}`
- **Description:** Consulte l'historique des postes d'un citoyen.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | citizenId | string | Oui | Identifiant UUID du citoyen |
- **Réponse 200:** Historique des affectations.

#### Consulter le poste actuel d'un citoyen
- **Endpoint:** `GET /servicecitoyen/job/current/{citizenId}`
- **Description:** Consulte le poste actuel d'un citoyen.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | citizenId | string | Oui | Identifiant UUID du citoyen |
- **Réponse 200:** Poste courant du citoyen.

---

## Service Modern Market

**Base Path:** `/servicemodernmarket`

### Gestion des zones
#### Créer une zone dans une commune
- **Endpoint:** `POST /servicemodernmarket/zones`
- **Description:** Crée une zone dans une commune.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | nom | string | Oui | Nom de la zone |
  | municipalityId | string | Oui | ID de la municipalité |
  | formatted_id | string | Oui | ID du fokontany |
  | delimitation | object | Oui | Limite géométrique de la zone (GeoJSON ou WKT) |
- **Réponse 201:** Zone créée avec succès.

#### Récupérer toutes les zones
- **Endpoint:** `GET /servicemodernmarket/zones`
- **Description:** Récupère toutes les zones.
- **Réponse 200:** Liste de toutes les zones.

#### Récupérer les zones d'une commune avec filtres
- **Endpoint:** `GET /servicemodernmarket/zones/{municipalityId}`
- **Description:** Récupère toutes les zones d'une commune avec filtres.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (défaut 1) |
  | limit | number | Non | Nombre de résultats par page (défaut 10) |
  | keyword | string | Non | Recherche par mot-clé |
  | latitude | number | Non | Latitude pour filtrer par position |
  | longitude | number | Non | Longitude pour filtrer par position |
- **Réponse 200:** Liste des zones.

#### Récupérer une zone par son id dans une municipalité
- **Endpoint:** `GET /servicemodernmarket/zones/edit/{id_zone}`
- **Description:** Récupère une zone par son id dans une municipalité.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_zone | string | Oui | ID de la zone |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Non | ID de la municipalité |
- **Réponse 200:** Zone trouvée.

#### Modifier une zone
- **Endpoint:** `PATCH /servicemodernmarket/zones/{municipalityId}/{id_zone}`
- **Description:** Modifie une zone.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id_zone | string | Oui | ID de la zone |
- **Body Parameters:** Les mêmes champs que CreateZoneDto (tous optionnels).
- **Réponse 200:** Zone modifiée avec succès.

#### Supprimer une zone
- **Endpoint:** `DELETE /servicemodernmarket/zones/{id_zone}`
- **Description:** Supprime une zone.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_zone | string | Oui | ID de la zone |
- **Réponse 200:** Zone supprimée.

### Gestion des locaux
#### Créer un nouveau local
- **Endpoint:** `POST /servicemodernmarket/local`
- **Description:** Crée un nouveau local.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | numero | string | Oui | Numéro du local |
  | zoneId | string | Oui | ID de la zone |
  | typelocalId | string | Oui | ID du type de local |
  | latitude | number | Oui | Latitude du local |
  | longitude | number | Oui | Longitude du local |
  | rotation | number | Oui | Rotation du local en degrés |
- **Réponse 201:** Local créé avec succès.

#### Récupérer les locaux d'une municipalité avec filtres
- **Endpoint:** `GET /servicemodernmarket/local/getAll/municipality/{municipalityId}`
- **Description:** Récupère les locaux d'une municipalité avec filtres.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut 1) |
  | limit | number | Non | Nombre de résultats par page (défaut 10) |
  | zoneId | string | Non | Filtrer par zone ID |
  | typelocalId | string | Non | Filtrer par type de local |
  | statut | string | Non | Filtrer par statut (DISPONIBLE, LOUE, INDISPONIBLE) |
  | keyword | string | Non | Recherche par mot-clé |
  | surface | number | Non | Recherche de local ayant la surface inscrite |
- **Réponse 200:** Liste des locaux.

#### Récupérer les dates occupées d'un local
- **Endpoint:** `GET /servicemodernmarket/local/municipality/{municipalityId}/{id_local}/occupied-dates`
- **Description:** Récupère les dates occupées d'un local d'une municipalité.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id_local | string | Oui | ID du local |
- **Réponse 200:** Dates occupées.

#### Récupérer un local d'une municipalité
- **Endpoint:** `GET /servicemodernmarket/local/municipality/{municipalityId}/{id_local}`
- **Description:** Récupère un local d'une municipalité.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id_local | string | Oui | ID du local |
- **Réponse 200:** Local trouvé.

#### Modifier un local
- **Endpoint:** `PATCH /servicemodernmarket/local/municipality/{municipalityId}/{id_local}`
- **Description:** Modifie un local.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id_local | string | Oui | ID du local |
- **Body Parameters:** Les mêmes champs que CreateLocalDto (tous optionnels).
- **Réponse 200:** Local modifié.

#### Supprimer un local
- **Endpoint:** `DELETE /servicemodernmarket/local/municipality/{municipalityId}/{id_local}`
- **Description:** Supprime un local.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id_local | string | Oui | ID du local |
- **Réponse 200:** Local supprimé.

#### Récupérer la dernière location d'un local
- **Endpoint:** `GET /servicemodernmarket/local/municipality/{municipalityId}/local/{id_local}/last-location`
- **Description:** Récupère la dernière location associée à un local dans une municipalité.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id_local | string | Oui | ID du local |
- **Réponse 200:** Dernière location trouvée.
- **Réponse 404:** Aucune location trouvée.

#### Statistiques des locaux par zone
- **Endpoint:** `GET /servicemodernmarket/local/stats/municipality/{municipalityId}`
- **Description:** Obtient les statistiques des locaux par zone pour une municipalité.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_user | string | Non | ID de l'utilisateur |
  | id_typelocal | string | Non | ID du type de local |
  | id_zone | string | Non | ID de la zone |
- **Réponse 200:** Statistiques des locaux.

### Gestion des notifications
#### Créer une notification de location
- **Endpoint:** `POST /servicemodernmarket/notifications/location`
- **Description:** Crée une notification de location.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | Identifiant de l'utilisateur concerné |
  | type | string | Oui | Type de notification (CONFIRMED, CANCELLED, PENDING) |
  | data | object | Oui | Données contextuelles liées à la location |
- **Réponse 201:** Notification créée.

#### Créer une notification de paiement
- **Endpoint:** `POST /servicemodernmarket/notifications/payment`
- **Description:** Crée une notification de paiement.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | Identifiant de l'utilisateur concerné |
  | type | string | Oui | Type de notification (SUCCESS, FAILED, PENDING) |
  | data | object | Oui | Données contextuelles liées au paiement |
  | channels | object | Non | Canaux de diffusion (inApp, email, sms, push) |
- **Réponse 201:** Notification créée.

#### Programmer une notification de rappel
- **Endpoint:** `POST /servicemodernmarket/notifications/reminder`
- **Description:** Programme une notification de rappel.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | Identifiant de l'utilisateur concerné |
  | dateNormalPaie | number | Oui | Jour du mois où le contribuable doit payer (1 à 31) |
  | data | object | Oui | Données contextuelles liées au rappel |
  | channels | object | Non | Canaux de diffusion |
- **Réponse 201:** Notification programmée.

#### Créer une notification d'historique de contrôle
- **Endpoint:** `POST /servicemodernmarket/notifications/critique-historique/{userId}`
- **Description:** Crée une notification d'historique de contrôle.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | Identifiant de l'utilisateur contrôleur |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | data | object | Oui | Données supplémentaires de l'historique |
- **Réponse 201:** Notification créée.

#### Marquer une notification comme lue
- **Endpoint:** `PATCH /servicemodernmarket/notifications/{id}/read`
- **Description:** Marque une notification comme lue.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de la notification |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | Identifiant de l'utilisateur |
- **Réponse 200:** Notification marquée comme lue.

#### Obtenir le nombre de notifications non lues
- **Endpoint:** `GET /servicemodernmarket/notifications/unread/count/{userId}`
- **Description:** Obtient le nombre de notifications non lues.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | ID de l'utilisateur |
- **Réponse 200:** Nombre de notifications non lues.

#### Lister les notifications filtrées
- **Endpoint:** `GET /servicemodernmarket/notifications`
- **Description:** Liste les notifications filtrées par municipalité avec pagination.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Non | ID de la municipalité |
  | userId | string | Non | ID de l'utilisateur |
  | page | number | Non | Page de résultats |
  | limit | number | Non | Nombre de résultats par page |
  | type | string | Non | Filtrer par type |
  | isRead | boolean | Non | Filtrer par statut de lecture |
  | priority | string | Non | Filtrer par priorité |
  | dateFrom | string | Non | Date de début |
  | dateTo | string | Non | Date de fin |
- **Réponse 200:** Liste des notifications.

#### Récupérer une notification spécifique
- **Endpoint:** `GET /servicemodernmarket/notifications/{id}`
- **Description:** Récupère une notification spécifique par ID avec vérification de municipalité.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de la notification |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | number | Oui | ID de la municipalité |
- **Réponse 200:** Notification trouvée.
- **Réponse 404:** Notification non trouvée.

#### Rapport des notifications par zone
- **Endpoint:** `GET /servicemodernmarket/notifications/{userId}/rapport`
- **Description:** Obtient le rapport des notifications HISTORIQUE CONTROLLEUR par zone.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | ID de l'utilisateur |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | from | string | Oui | Date de début |
  | to | string | Oui | Date de fin |
- **Réponse 200:** Rapport des notifications.

#### Historique des notifications d'un contrôleur
- **Endpoint:** `GET /servicemodernmarket/notifications/historique/{userId}/{municipalityId}`
- **Description:** Récupère l'historique des notifications d'un contrôleur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | ID de l'utilisateur |
  | municipalityId | string | Oui | ID de la municipalité |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (défaut 1) |
  | limit | number | Non | Nombre d'éléments par page (défaut 20) |
  | dateFrom | string | Non | Date de début |
  | dateTo | string | Non | Date de fin |
- **Réponse 200:** Historique des notifications.

#### Ouvrir une notification et récupérer la cible associée
- **Endpoint:** `GET /servicemodernmarket/notifications/open/{id}`
- **Description:** Ouvre une notification et récupère la cible associée.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de la notification |
- **Réponse 200:** Notification ouverte avec la cible.

#### Récupérer les infractions d'un contrôleur
- **Endpoint:** `GET /servicemodernmarket/notifications/infractions/controlleur/{municipalityId}/user/{userId}`
- **Description:** Récupère les infractions d'un contrôleur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | ID de l'utilisateur |
  | municipalityId | string | Oui | ID de la municipalité |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (défaut 1) |
  | limit | number | Non | Nombre d'éléments par page (défaut 20) |
  | dateFrom | string | Non | Date de début |
  | dateTo | string | Non | Date de fin |
- **Réponse 200:** Liste des infractions.

#### Supprimer une notification
- **Endpoint:** `DELETE /servicemodernmarket/notifications/{id_notification}`
- **Description:** Supprime une notification.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_notification | string | Oui | ID de la notification |
- **Réponse 200:** Notification supprimée.

### Gestion des zones de distribution
#### Affecter un utilisateur à une zone de distribution
- **Endpoint:** `POST /servicemodernmarket/distribution-zone/assign`
- **Description:** Affecte un utilisateur à une zone de distribution.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_user | string | Oui | Identifiant unique d'utilisateur |
  | zoneId | string | Oui | Identifiant unique de la zone |
  | status | boolean | Oui | Statut de la zone de distribution (défaut true) |
  | createdAt | string | Oui | Date de création |
  | updatedAt | string | Oui | Date de mise à jour |
- **Réponse 201:** Utilisateur affecté avec succès.
- **Réponse 400:** Requête invalide.

#### Récupérer les zones de distribution par municipalité
- **Endpoint:** `GET /servicemodernmarket/distribution-zone/municipalityId/{municipalityId}`
- **Description:** Récupère toutes les zones de distribution par leur municipalité.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (défaut 1) |
  | limit | number | Non | Nombre de résultats par page (défaut 10) |
- **Réponse 200:** Liste des zones de distribution.

#### Récupérer une zone de distribution par son id
- **Endpoint:** `GET /servicemodernmarket/distribution-zone/municipalityId/{municipalityId}/id/{id}`
- **Description:** Récupère une zone de distribution par son id.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id | string | Oui | ID de la zone de distribution |
- **Réponse 200:** Zone de distribution trouvée.

#### Modifier une zone de distribution
- **Endpoint:** `PATCH /servicemodernmarket/distribution-zone/municipalityId/{municipalityId}/id/{id}`
- **Description:** Modifie une zone de distribution.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de la zone de distribution |
  | municipalityId | string | Oui | ID de la municipalité |
- **Body Parameters:** Les mêmes champs que CreateDistributionZoneDto (tous optionnels).
- **Réponse 200:** Zone de distribution modifiée.

#### Supprimer une zone de distribution
- **Endpoint:** `DELETE /servicemodernmarket/distribution-zone/municipalityId/{municipalityId}/id/{id}`
- **Description:** Supprime une zone de distribution.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de la zone de distribution |
  | municipalityId | string | Oui | ID de la municipalité |
- **Réponse 200:** Zone de distribution supprimée.

#### Récupérer la zone active d'un utilisateur
- **Endpoint:** `GET /servicemodernmarket/distribution-zone/municipalityId/{municipalityId}/id_user/{id_user}`
- **Description:** Récupère une zone qui est affectée par l'id utilisateur et qui a le status true.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_user | string | Oui | ID de l'utilisateur |
  | municipalityId | string | Oui | ID de la municipalité |
- **Réponse 200:** Zone active de l'utilisateur.

#### Historique des zones d'un utilisateur
- **Endpoint:** `GET /servicemodernmarket/distribution-zone/history/municipalityId/{municipalityId}/id_user/{id_user}`
- **Description:** Récupère tous les zones historiques affectées à un utilisateur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_user | string | Oui | ID de l'utilisateur |
  | municipalityId | string | Oui | ID de la municipalité |
- **Réponse 200:** Historique des zones de l'utilisateur.

### Gestion des locations
#### Créer une location et la valider
- **Endpoint:** `POST /servicemodernmarket/locations`
- **Description:** Crée une nouvelle location et la valide.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_user | string | Oui | ID de l'utilisateur qui loue |
  | nif | string | Oui | NIF du locataire |
  | localId | string | Oui | ID du local associé (UUID) |
  | usage | string | Oui | Usage de la location |
  | periodicite | string | Oui | Périodicité de la location (JOURNALIER, MENSUEL) |
  | date_debut_loc | string | Oui | Date de début de la location |
- **Réponse 201:** Location créée et validée.

#### Récupérer toutes les locations
- **Endpoint:** `GET /servicemodernmarket/locations`
- **Description:** Récupère toutes les locations, filtrées par municipalityId.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | number | Oui | ID de la municipalité |
  | page | number | Non | Numéro de la page (défaut 1) |
  | limit | number | Non | Nombre de résultats par page (défaut 10) |
- **Réponse 200:** Liste des locations.

#### Récupérer les locations en cours
- **Endpoint:** `GET /servicemodernmarket/locations/municipality/{municipalityId}/en_cours`
- **Description:** Récupère toutes les locations en cours.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
- **Réponse 200:** Liste des locations en cours.

#### Récupérer les locations d'un utilisateur
- **Endpoint:** `GET /servicemodernmarket/locations/userLocations/{id_user}`
- **Description:** Récupère toutes les locations d'un utilisateur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_user | string | Oui | ID de l'utilisateur |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de la page (défaut 1) |
  | limit | number | Non | Nombre de résultats par page (défaut 10) |
- **Réponse 200:** Liste des locations de l'utilisateur.

#### Récupérer les locations en cours d'un utilisateur
- **Endpoint:** `GET /servicemodernmarket/locations/userLocations/{id_user}/en_cours`
- **Description:** Récupère toutes les locations en cours d'un utilisateur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_user | string | Oui | ID de l'utilisateur |
- **Réponse 200:** Liste des locations en cours de l'utilisateur.

#### Récupérer une location par son ID
- **Endpoint:** `GET /servicemodernmarket/locations/{id_location}/{municipalityId}/location`
- **Description:** Récupère une location par son ID et son municipalityId.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_location | string | Oui | ID de la location |
  | municipalityId | string | Non | ID de la municipalité |
- **Réponse 200:** Location trouvée.

#### Récupérer le QR Code d'une location
- **Endpoint:** `GET /servicemodernmarket/locations/locationQrCode/{id}/municipality/{municipalityId}`
- **Description:** Récupère le QR Code contenant les infos d'une location.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de la location |
  | municipalityId | string | Oui | ID de la municipalité |
- **Réponse 200:** QR Code de la location.

#### Récupérer les locations en cours pour un contribuable
- **Endpoint:** `GET /servicemodernmarket/locations/in-progress/{id_user}/{id_controleur}`
- **Description:** Récupère les locations en cours pour un contribuable.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_user | string | Oui | ID de l'utilisateur |
  | id_controleur | string | Oui | ID du contrôleur |
- **Réponse 200:** Locations en cours.

#### Récupérer le reste à payer d'une location
- **Endpoint:** `GET /servicemodernmarket/locations/{id_location}/reste-a-payer`
- **Description:** Récupère le reste à payer d'une location.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_location | string | Oui | ID de la location |
- **Réponse 200:** Reste à payer.

#### Récupérer le calendrier de paiement d'une location
- **Endpoint:** `GET /servicemodernmarket/locations/{id_location}/calendrier-paiement`
- **Description:** Récupère le calendrier de paiement d'une location.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_location | string | Oui | ID de la location |
- **Réponse 200:** Calendrier de paiement.

#### Modifier une location
- **Endpoint:** `PATCH /servicemodernmarket/locations/municipality/{municipalityId}/location/{id}`
- **Description:** Modifie une location par son ID et son municipalityId.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_location | string | Oui | ID de la location |
  | municipalityId | string | Oui | ID de la municipalité |
- **Body Parameters:** Les mêmes champs que CreateLocationDto (tous optionnels).
- **Réponse 200:** Location modifiée.

#### Supprimer une location
- **Endpoint:** `DELETE /servicemodernmarket/locations/location/{id}`
- **Description:** Supprime une location par son ID.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de la location |
- **Réponse 204:** Location supprimée.

#### Récupérer le NIF d'un utilisateur
- **Endpoint:** `GET /servicemodernmarket/locations/nif-user/{userId}`
- **Description:** Récupère le NIF d'un utilisateur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | ID de l'utilisateur |
- **Réponse 200:** NIF de l'utilisateur.

#### Nombre de locations en cours d'un utilisateur
- **Endpoint:** `GET /servicemodernmarket/locations/count-current/locations/user/{id_user}`
- **Description:** Récupère le nombre de locations en cours d'un utilisateur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_user | string | Oui | ID de l'utilisateur |
- **Réponse 200:** Nombre de locations en cours.

#### Date de fin d'une location
- **Endpoint:** `GET /servicemodernmarket/locations/{id_location}/end-date`
- **Description:** Récupère la date de fin d'une location.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id_location | string | Oui | ID de la location |
- **Réponse 200:** Date de fin de la location.
- **Réponse 404:** Location non trouvée.

#### Générer un QR code pour un utilisateur
- **Endpoint:** `GET /servicemodernmarket/locations/{id}/qrcode`
- **Description:** Génère un QR code pour un utilisateur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de l'utilisateur |
- **Réponse 200:** QR Code généré.

#### Vérifier une location active
- **Endpoint:** `GET /servicemodernmarket/locations/verification/{municipalityId}/{id_controleur}/{id_user}/{id_local}`
- **Description:** Vérifie l'existence d'une location active pour un utilisateur et un local.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id_controleur | string | Oui | ID du contrôleur |
  | id_user | string | Oui | ID du contribuable |
  | id_local | string | Oui | ID du local |
- **Réponse 200:** Résultat de la vérification.

#### Télécharger le contrat de bail (application)
- **Endpoint:** `GET /servicemodernmarket/locations/contrat-bail-app/{id}`
- **Description:** Télécharge le contrat de bail PDF pour une location donnée pour usage dans l'application.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de la location |
- **Réponse 200:** Contrat de bail généré.
- **Réponse 404:** Location introuvable.

#### Télécharger le contrat de bail
- **Endpoint:** `GET /servicemodernmarket/locations/contrat-bail/{id}`
- **Description:** Télécharge le contrat de bail PDF pour une location donnée.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID de la location |
- **Réponse 200:** Contrat de bail généré.
- **Réponse 404:** Location introuvable.

### Gestion des paiements de location
#### Récupérer les paiements de location
- **Endpoint:** `GET /servicemodernmarket/paiement-location/municipality/{municipalityId}`
- **Description:** Récupère les paiements de location pour une municipalité avec filtres.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | locationId | string | Non | ID de la location |
  | paiementId | string | Non | ID du paiement |
  | startDate | string | Non | Date de début (YYYY-MM-DD) |
  | endDate | string | Non | Date de fin (YYYY-MM-DD) |
- **Réponse 200:** Liste des paiements de location.

#### Récupérer un paiement de location
- **Endpoint:** `GET /servicemodernmarket/paiement-location/{id}`
- **Description:** Récupère un paiement de location par son ID et municipalité.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID du paiement de location |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
- **Réponse 200:** Paiement de location trouvé.

#### Récupérer un paiement de location avec QR code
- **Endpoint:** `GET /servicemodernmarket/paiement-location/{id}/qr`
- **Description:** Récupère un paiement de location avec QR code par son ID et municipalité.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID du paiement de location |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
- **Réponse 200:** Paiement de location avec QR code.

### Gestion des paiements
#### Enregistrer le paiement d'un contribuable
- **Endpoint:** `POST /servicemodernmarket/paiement`
- **Description:** Enregistre le paiement d'un contribuable.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | reference | string | Oui | Référence du paiement |
  | status | string | Oui | Statut du paiement (success/failed) |
  | raison | string | Oui | Raison du paiement |
  | paiement_locations | array | Oui | Liste des locations concernées (voir CreatePaiementLocationDto) |
- **Réponse 201:** Paiement enregistré.

#### Récupérer tous les paiements
- **Endpoint:** `GET /servicemodernmarket/paiement`
- **Description:** Récupère tous les paiements filtrés.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | zoneId | string | Non | ID de la zone |
  | reference | string | Non | Référence du paiement |
  | status | string | Non | Statut du paiement |
  | startDate | string | Non | Date de début |
  | endDate | string | Non | Date de fin |
  | limit | number | Non | Nombre de résultats par page (défaut 10) |
  | page | number | Non | Numéro de page (défaut 1) |
- **Réponse 200:** Liste des paiements.

#### Récupérer un paiement
- **Endpoint:** `GET /servicemodernmarket/paiement/{id}`
- **Description:** Récupère un paiement par son id et municipalityId.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID du paiement |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | number | Oui | ID de la municipalité |
- **Réponse 200:** Paiement trouvé.

#### Supprimer un paiement
- **Endpoint:** `DELETE /servicemodernmarket/paiement/{id}`
- **Description:** Supprime un paiement par son ID.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | ID du paiement |
- **Réponse 200:** Paiement supprimé.
- **Réponse 404:** Paiement introuvable.

#### Historique des paiements d'un utilisateur
- **Endpoint:** `GET /servicemodernmarket/paiement/user/{user_id}/history`
- **Description:** Récupère l'historique des paiements d'un utilisateur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | user_id | string | Oui | ID de l'utilisateur |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Non | ID de la municipalité |
  | limit | number | Non | Nombre d'éléments par page (défaut 10) |
  | page | number | Non | Numéro de la page (défaut 1) |
- **Réponse 200:** Historique des paiements.

#### Télécharger le reçu d'un paiement
- **Endpoint:** `GET /servicemodernmarket/paiement/recu/{reference}`
- **Description:** Télécharge le reçu PDF pour un paiement.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | reference | string | Oui | Référence du paiement |
- **Réponse 200:** Reçu généré.

#### Télécharger le reçu avec régisseur
- **Endpoint:** `GET /servicemodernmarket/paiement/recu-regisseur/{reference}`
- **Description:** Télécharge le reçu PDF avec régisseur pour un paiement.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | reference | string | Oui | Référence du paiement |
- **Réponse 200:** Reçu régisseur généré.
- **Réponse 404:** Paiement introuvable.

### Gestion des types de locaux
#### Créer un type de local
- **Endpoint:** `POST /servicemodernmarket/type-locals`
- **Description:** Crée un type de local.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | typeLoc | object | Oui | Nom du type de local traduit (mg/fr) |
  | municipalityId | string | Oui | Municipalité id |
  | description | object | Oui | Description traduite du type de local |
  | type_contrat | string | Oui | Type du contrat (JOURNALIER/ANNUEL) |
  | longueur | number | Oui | Longueur du local |
  | largeur | number | Oui | Largeur du local |
  | tarif | number | Oui | Tarif du local |
- **Réponse 201:** Type de local créé.
- **Réponse 400:** Données invalides.

#### Récupérer les types de locaux
- **Endpoint:** `GET /servicemodernmarket/type-locals/municipalityId/{municipalityId}`
- **Description:** Récupère tous les types de locaux existants.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | lang | string | Non | Langue de la réponse (défaut mg) |
  | page | number | Non | Numéro de la page (défaut 1) |
  | limit | number | Non | Nombre de résultats par page (défaut 10) |
- **Réponse 200:** Liste des types de locaux.

#### Récupérer un type de local
- **Endpoint:** `GET /servicemodernmarket/type-locals/municipalityId/{municipalityId}/id/{id}`
- **Description:** Récupère un type de local par son id.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id | string | Oui | ID du type de local |
- **Réponse 200:** Type de local trouvé.

#### Modifier un type de local
- **Endpoint:** `PATCH /servicemodernmarket/type-locals/municipalityId/{municipalityId}/id/{id}`
- **Description:** Modifie un type de local.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id | string | Oui | ID du type de local |
- **Body Parameters (multipart/form-data):**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | typeLoc | object | Non | Nom du type de local traduit |
  | description | object | Non | Description traduite |
  | tarif | number | Non | Tarif du local |
  | type_contrat | string | Non | Type du contrat |
- **Réponse 201:** Type de local modifié.
- **Réponse 404:** Type de local non trouvé.

#### Supprimer un type de local
- **Endpoint:** `DELETE /servicemodernmarket/type-locals/{id}`
- **Description:** Supprime un type de local.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | municipalityId | string | Oui | ID de la municipalité |
  | id | string | Oui | ID du type de local |
- **Réponse 200:** Type de local supprimé.

---

## Service Notification

**Base Path:** `/servicenotification`

### Gestion SMS
#### Login au service SMS
- **Endpoint:** `POST /servicenotification/sms/login`
- **Description:** Login au service SMS et récupération du token.
- **Réponse 200:** Token récupéré avec succès.
- **Réponse 500:** Erreur interne.

#### Envoyer un SMS transactionnel
- **Endpoint:** `POST /servicenotification/sms/send`
- **Description:** Envoie un message transactionnel via SMS.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | recipient | string | Oui | Numéro du destinataire |
  | message | string | Oui | Message à envoyer |
  | channel | string | Oui | Canal (ex: sms) |
- **Réponse 200:** Message envoyé.
- **Réponse 500:** Erreur interne.

### Gestion Email
#### Envoyer un email simple
- **Endpoint:** `POST /servicenotification/email/send`
- **Description:** Envoie un email simple.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | to | string | Oui | Destinataire |
  | subject | string | Oui | Sujet de l'email |
  | body | string | Oui | Corps de l'email |
  | fromName | string | Non | Nom de l'expéditeur |
  | fromEmail | string | Non | Email de l'expéditeur |
- **Réponse 200:** Email envoyé.
- **Réponse 400:** Données invalides.
- **Réponse 500:** Erreur interne.

#### Envoyer un email avec pièce jointe
- **Endpoint:** `POST /servicenotification/email/send-with-file`
- **Description:** Envoie un email avec une pièce jointe.
- **Body Parameters (multipart/form-data):**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | to | string | Oui | Destinataire |
  | subject | string | Oui | Sujet de l'email |
  | body | string | Oui | Corps de l'email |
  | file | file | Non | Fichier à joindre |
- **Réponse 201:** Email envoyé.

### Gestion des notifications (WebSocket)
#### Broadcast à un utilisateur
- **Endpoint:** `POST /servicenotification/notifications/broadcast`
- **Description:** Diffuse une notification à un utilisateur spécifique.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Non | UUID de l'utilisateur (null pour tous) |
  | authorId | string | Oui | UUID de l'auteur |
  | message | string | Oui | Message de la notification |
- **Réponse 201:** Notification créée.

#### Broadcast à tous les utilisateurs
- **Endpoint:** `POST /servicenotification/notifications/broadcast-all`
- **Description:** Diffuse une notification à tous les utilisateurs.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | authorId | string | Oui | UUID de l'auteur |
  | message | string | Oui | Message de la notification |
- **Réponse 201:** Notification créée et envoyée à tous.

#### Récupérer toutes les notifications
- **Endpoint:** `GET /servicenotification/notifications`
- **Description:** Récupère toutes les notifications.
- **Réponse 200:** Liste des notifications.

#### Récupérer les notifications d'un utilisateur
- **Endpoint:** `GET /servicenotification/notifications/{userId}`
- **Description:** Récupère toutes les notifications d'un utilisateur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | UUID de l'utilisateur |
- **Réponse 200:** Liste des notifications de l'utilisateur.

#### Récupérer les notifications non lues d'un utilisateur
- **Endpoint:** `GET /servicenotification/notifications/{userId}/unread`
- **Description:** Récupère les notifications non lues d'un utilisateur.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | UUID de l'utilisateur |
- **Réponse 200:** Liste des notifications non lues.

#### Marquer une notification comme lue
- **Endpoint:** `POST /servicenotification/notifications/{id}/mark-as-read`
- **Description:** Marque une notification comme lue.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | UUID de la notification |
- **Réponse 200:** Notification marquée comme lue.

#### Marquer toutes les notifications comme lues
- **Endpoint:** `POST /servicenotification/notifications/mark-all-read/{userId}`
- **Description:** Marque toutes les notifications d'un utilisateur comme lues.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | userId | string | Oui | UUID de l'utilisateur |
- **Réponse 200:** Toutes les notifications marquées comme lues.

#### Mettre à jour une notification
- **Endpoint:** `PUT /servicenotification/notifications/{id}`
- **Description:** Met à jour une notification.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | UUID de la notification |
- **Body Parameters:** Les champs à mettre à jour.
- **Réponse 200:** Notification mise à jour.

#### Supprimer une notification
- **Endpoint:** `DELETE /servicenotification/notifications/{id}`
- **Description:** Supprime une notification.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | string | Oui | UUID de la notification |
- **Réponse 200:** Notification supprimée.

---

## Service Territoire V2

**Base Path:** `/serviceterritoire-v2`

### Gestion des provinces
#### Récupérer toutes les provinces
- **Endpoint:** `GET /serviceterritoire-v2/provinces`
- **Description:** Récupère une liste paginée de toutes les provinces.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste paginée des provinces.

#### Créer une province
- **Endpoint:** `POST /serviceterritoire-v2/provinces`
- **Description:** Crée une nouvelle province.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | name | string | Oui | Nom de la province |
  | location | object | Oui | GeoJSON Point de la localisation |
  | form | object | Oui | GeoJSON MultiPolygon de la forme |
- **Réponse 201:** Province créée.
- **Réponse 400:** Données invalides.

#### Récupérer les provinces avec données minimales
- **Endpoint:** `GET /serviceterritoire-v2/provinces/basic`
- **Description:** Récupère les provinces avec seulement les informations essentielles.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste optimisée des provinces.

#### Récupérer toutes les provinces sans pagination
- **Endpoint:** `GET /serviceterritoire-v2/provinces/all/no-pagination`
- **Description:** Récupère toutes les provinces sans pagination.
- **Réponse 200:** Liste de toutes les provinces.

#### Récupérer une province par formatted_id
- **Endpoint:** `GET /serviceterritoire-v2/provinces/{formatted_id}`
- **Description:** Récupère une province par son formatted_id.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la province |
- **Réponse 200:** Province trouvée.
- **Réponse 404:** Province non trouvée.

#### Mettre à jour une province
- **Endpoint:** `PUT /serviceterritoire-v2/provinces/{formatted_id}`
- **Description:** Met à jour une province.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la province |
- **Body Parameters:** Les mêmes champs que CreateProvinceDto.
- **Réponse 200:** Province mise à jour.
- **Réponse 404:** Province non trouvée.

#### Supprimer une province
- **Endpoint:** `DELETE /serviceterritoire-v2/provinces/{formatted_id}`
- **Description:** Supprime une province.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la province |
- **Réponse 204:** Province supprimée.
- **Réponse 404:** Province non trouvée.
- **Réponse 409:** Province a des régions.

#### Récupérer la géométrie d'une province
- **Endpoint:** `GET /serviceterritoire-v2/provinces/{formatted_id}/form`
- **Description:** Récupère la géométrie d'une province.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la province |
- **Réponse 200:** Géométrie de la province.

#### Regénérer les IDs formatés des provinces
- **Endpoint:** `POST /serviceterritoire-v2/provinces/regenerate-ids`
- **Description:** Force la régénération de tous les formatted_id des provinces.
- **Réponse 200:** IDs régénérés avec succès.

### Gestion des régions
#### Récupérer toutes les régions
- **Endpoint:** `GET /serviceterritoire-v2/regions`
- **Description:** Récupère une liste paginée de toutes les régions.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste paginée des régions.

#### Créer une région
- **Endpoint:** `POST /serviceterritoire-v2/regions`
- **Description:** Crée une nouvelle région.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | name | string | Oui | Nom de la région |
  | location | object | Oui | GeoJSON Point de la localisation |
  | form | object | Oui | GeoJSON MultiPolygon de la forme |
  | province_id | number | Oui | ID de la province parente |
- **Réponse 201:** Région créée.
- **Réponse 400:** Données invalides.
- **Réponse 404:** Province non trouvée.

#### Récupérer les régions avec données minimales
- **Endpoint:** `GET /serviceterritoire-v2/regions/basic`
- **Description:** Récupère les régions avec seulement les informations essentielles.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste optimisée des régions.

#### Récupérer toutes les régions sans pagination
- **Endpoint:** `GET /serviceterritoire-v2/regions/all/no-pagination`
- **Description:** Récupère toutes les régions sans pagination.
- **Réponse 200:** Liste de toutes les régions.

#### Récupérer les régions par province
- **Endpoint:** `GET /serviceterritoire-v2/regions/province/{provinceId}`
- **Description:** Récupère toutes les régions d'une province spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | provinceId | number | Oui | ID de la province |
- **Réponse 200:** Liste des régions.
- **Réponse 404:** Province non trouvée.

#### Récupérer une région par formatted_id
- **Endpoint:** `GET /serviceterritoire-v2/regions/{formatted_id}`
- **Description:** Récupère une région par son formatted_id.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la région |
- **Réponse 200:** Région trouvée.
- **Réponse 404:** Région non trouvée.

#### Mettre à jour une région
- **Endpoint:** `PUT /serviceterritoire-v2/regions/{formatted_id}`
- **Description:** Met à jour une région.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la région |
- **Body Parameters:** Les mêmes champs que CreateRegionDto.
- **Réponse 200:** Région mise à jour.
- **Réponse 404:** Région non trouvée.

#### Supprimer une région
- **Endpoint:** `DELETE /serviceterritoire-v2/regions/{formatted_id}`
- **Description:** Supprime une région.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la région |
- **Réponse 204:** Région supprimée.
- **Réponse 404:** Région non trouvée.
- **Réponse 409:** Région a des districts.

#### Récupérer la géométrie d'une région
- **Endpoint:** `GET /serviceterritoire-v2/regions/{formatted_id}/form`
- **Description:** Récupère la géométrie d'une région.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la région |
- **Réponse 200:** Géométrie de la région.

#### Regénérer les IDs formatés des régions
- **Endpoint:** `POST /serviceterritoire-v2/regions/regenerate-ids`
- **Description:** Force la régénération de tous les formatted_id des régions.
- **Réponse 200:** IDs régénérés avec succès.

### Gestion des districts
#### Récupérer tous les districts
- **Endpoint:** `GET /serviceterritoire-v2/districts`
- **Description:** Récupère une liste paginée de tous les districts.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste paginée des districts.

#### Créer un district
- **Endpoint:** `POST /serviceterritoire-v2/districts`
- **Description:** Crée un nouveau district.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | name | string | Oui | Nom du district |
  | location | object | Oui | GeoJSON Point de la localisation |
  | form | object | Oui | GeoJSON MultiPolygon de la forme |
  | region_id | number | Oui | ID de la région parente |
  | prefecture_id | number | Non | ID de la préfecture parente |
- **Réponse 201:** District créé.
- **Réponse 400:** Données invalides.
- **Réponse 404:** Région non trouvée.

#### Récupérer les districts avec données minimales
- **Endpoint:** `GET /serviceterritoire-v2/districts/basic`
- **Description:** Récupère les districts avec seulement les informations essentielles.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste optimisée des districts.

#### Récupérer tous les districts sans pagination
- **Endpoint:** `GET /serviceterritoire-v2/districts/sans-form`
- **Description:** Récupère tous les districts sans pagination.
- **Réponse 200:** Liste de tous les districts.

#### Récupérer les districts par région
- **Endpoint:** `GET /serviceterritoire-v2/districts/region/{region_formatted_id}`
- **Description:** Récupère tous les districts d'une région spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | region_formatted_id | string | Oui | ID formaté de la région |
- **Réponse 200:** Liste des districts.
- **Réponse 404:** Région non trouvée.

#### Récupérer les districts par préfecture
- **Endpoint:** `GET /serviceterritoire-v2/districts/prefecture/{prefecture_formatted_id}`
- **Description:** Récupère tous les districts d'une préfecture spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | prefecture_formatted_id | string | Oui | ID formaté de la préfecture |
- **Réponse 200:** Liste des districts.
- **Réponse 404:** Préfecture non trouvée.

#### Récupérer un district par formatted_id
- **Endpoint:** `GET /serviceterritoire-v2/districts/{formatted_id}`
- **Description:** Récupère un district par son formatted_id.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté du district |
- **Réponse 200:** District trouvé.
- **Réponse 404:** District non trouvé.

#### Mettre à jour un district (champs éditables uniquement)
- **Endpoint:** `PATCH /serviceterritoire-v2/districts/{formatted_id}`
- **Description:** Met à jour un district (seuls les champs éditables sont acceptés).
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté du district |
- **Body Parameters:** Champs éditables uniquement.
- **Réponse 200:** District mis à jour.
- **Réponse 404:** District non trouvé.

#### Supprimer un district
- **Endpoint:** `DELETE /serviceterritoire-v2/districts/{formatted_id}`
- **Description:** Supprime un district.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté du district |
- **Réponse 204:** District supprimé.
- **Réponse 404:** District non trouvé.
- **Réponse 409:** District a des communes.

#### Récupérer la géométrie d'un district
- **Endpoint:** `GET /serviceterritoire-v2/districts/{formatted_id}/form`
- **Description:** Récupère la géométrie d'un district.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté du district |
- **Réponse 200:** Géométrie du district.

#### Trouver un district par coordonnées GPS
- **Endpoint:** `GET /serviceterritoire-v2/districts/find/by-location`
- **Description:** Trouve un district par coordonnées GPS.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | lat | number | Oui | Latitude |
  | lng | number | Oui | Longitude |
- **Réponse 200:** District trouvé.
- **Réponse 404:** Aucun district trouvé.

### Gestion des communes
#### Récupérer toutes les communes
- **Endpoint:** `GET /serviceterritoire-v2/communes`
- **Description:** Récupère toutes les communes avec pagination et recherche.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste paginée des communes.

#### Récupérer les communes avec données minimales
- **Endpoint:** `GET /serviceterritoire-v2/communes/basic`
- **Description:** Récupère les communes avec informations essentielles.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste optimisée des communes.

#### Récupérer toutes les communes sans pagination
- **Endpoint:** `GET /serviceterritoire-v2/communes/sans-form`
- **Description:** Récupère toutes les communes sans pagination.
- **Réponse 200:** Liste de toutes les communes.

#### Récupérer les métadonnées des communes
- **Endpoint:** `GET /serviceterritoire-v2/communes/metadata`
- **Description:** Récupère uniquement les métadonnées administratives des communes.
- **Réponse 200:** Métadonnées des communes.

#### Récupérer la hiérarchie administrative
- **Endpoint:** `GET /serviceterritoire-v2/communes/hierarchy`
- **Description:** Récupère la hiérarchie administrative complète.
- **Réponse 200:** Hiérarchie administrative.

#### Récupérer les communes membres
- **Endpoint:** `GET /serviceterritoire-v2/communes/members`
- **Description:** Récupère toutes les communes membres.
- **Réponse 200:** Liste des communes membres.

#### Récupérer les communes non membres
- **Endpoint:** `GET /serviceterritoire-v2/communes/non-members`
- **Description:** Récupère toutes les communes non membres.
- **Réponse 200:** Liste des communes non membres.

#### Récupérer les communes par district
- **Endpoint:** `GET /serviceterritoire-v2/communes/district/{district_formatted_id}`
- **Description:** Récupère les communes d'un district.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | district_formatted_id | string | Oui | ID formaté du district |
- **Réponse 200:** Liste des communes.
- **Réponse 404:** District non trouvé.

#### Récupérer les communes par région
- **Endpoint:** `GET /serviceterritoire-v2/communes/region/{region_formatted_id}`
- **Description:** Récupère les communes d'une région.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | region_formatted_id | string | Oui | ID formaté de la région |
- **Réponse 200:** Liste des communes.
- **Réponse 404:** Région non trouvée.

#### Trouver une commune par coordonnées GPS
- **Endpoint:** `GET /serviceterritoire-v2/communes/find/by-location`
- **Description:** Trouve une commune par coordonnées GPS.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | lat | string | Oui | Latitude |
  | lng | string | Oui | Longitude |
- **Réponse 200:** Commune trouvée.
- **Réponse 404:** Aucune commune trouvée.

#### Récupérer une commune par formatted_id
- **Endpoint:** `GET /serviceterritoire-v2/communes/{formatted_id}`
- **Description:** Récupère une commune par son formatted_id.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la commune |
- **Réponse 200:** Commune trouvée.
- **Réponse 404:** Commune non trouvée.

#### Supprimer une commune
- **Endpoint:** `DELETE /serviceterritoire-v2/communes/{formatted_id}`
- **Description:** Supprime une commune.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la commune |
- **Réponse 204:** Commune supprimée.
- **Réponse 404:** Commune non trouvée.
- **Réponse 409:** Commune a des dépendances.

#### Récupérer la géométrie d'une commune
- **Endpoint:** `GET /serviceterritoire-v2/communes/{formatted_id}/form`
- **Description:** Récupère la géométrie d'une commune.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la commune |
- **Réponse 200:** Géométrie de la commune.

#### Récupérer une commune sans géométrie
- **Endpoint:** `GET /serviceterritoire-v2/communes/noForm/{formatted_id}`
- **Description:** Récupère une commune sans sa géométrie.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la commune |
- **Réponse 200:** Commune trouvée.
- **Réponse 404:** Commune non trouvée.

#### Créer une commune complète
- **Endpoint:** `POST /serviceterritoire-v2/communes/full`
- **Description:** Crée une commune avec logo, spécificités et galeries.
- **Body Parameters (multipart/form-data):**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | file | file | Non | Logo de la commune |
  | name | string | Oui | Nom de la commune |
  | code | string | Non | Code de la commune |
  | district_id | number | Non | ID du district |
  | region_id | number | Non | ID de la région |
  | postal_code | string | Non | Code postal |
  | phone_number | string | Non | Numéro de téléphone |
  | email | string | Non | Email |
  | description | string | Non | Description |
  | location | string | Non | GeoJSON Point (string) |
  | form | string | Non | GeoJSON MultiPolygon (string) |
  | isMember | boolean | Non | Membre de l'AGVM |
  | isUrban | boolean | Non | Statut urbain |
  | specificites | string | Non | JSON stringifié des spécificités |
  | galerie_files | array[file] | Non | Images pour les galeries |
- **Réponse 201:** Commune créée.

#### Mettre à jour une commune partiellement
- **Endpoint:** `PATCH /serviceterritoire-v2/communes/full/{formatted_id}`
- **Description:** Met à jour partiellement une commune.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la commune |
- **Body Parameters (multipart/form-data):** Les mêmes champs que POST /full (tous optionnels).
- **Réponse 200:** Commune mise à jour.

#### Toggle le statut membre d'une commune
- **Endpoint:** `PATCH /serviceterritoire-v2/communes/{formatted_id}/toggle-member`
- **Description:** Inverse le statut membre d'une commune.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la commune |
- **Réponse 200:** Statut inversé.

#### Toggle le statut urbain d'une commune
- **Endpoint:** `PATCH /serviceterritoire-v2/communes/{formatted_id}/toggle-urban`
- **Description:** Inverse le statut urbain d'une commune.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la commune |
- **Réponse 200:** Statut inversé.

#### Définir explicitement le statut urbain
- **Endpoint:** `PATCH /serviceterritoire-v2/communes/{formatted_id}/urban-status`
- **Description:** Définit explicitement le statut urbain d'une commune.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de la commune |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | isUrban | boolean | Oui | Statut urbain à définir |
- **Réponse 200:** Statut mis à jour.

#### Récupérer les communes par statut urbain
- **Endpoint:** `GET /serviceterritoire-v2/communes/status/{status}`
- **Description:** Récupère les communes selon leur statut urbain.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | status | string | Oui | Statut (urban/rural/unknown ou true/false/null) |
- **Réponse 200:** Liste des communes filtrées.
- **Réponse 400:** Paramètre invalide.

### Gestion des fokotanys
#### Récupérer tous les fokotanys
- **Endpoint:** `GET /serviceterritoire-v2/fokotanys`
- **Description:** Récupère une liste paginée de tous les fokotanys.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste paginée des fokotanys.

#### Créer un fokotany
- **Endpoint:** `POST /serviceterritoire-v2/fokotanys`
- **Description:** Crée un nouveau fokotany.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | name | string | Oui | Nom du fokotany |
  | location | object | Non | GeoJSON Point de la localisation |
  | form | object | Non | GeoJSON MultiPolygon de la forme |
  | commune_id | number | Oui | ID de la commune parente |
- **Réponse 201:** Fokotany créé.
- **Réponse 400:** Données invalides.
- **Réponse 404:** Commune non trouvée.

#### Récupérer les fokotanys avec données minimales
- **Endpoint:** `GET /serviceterritoire-v2/fokotanys/basic`
- **Description:** Récupère les fokotanys avec informations essentielles.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste optimisée des fokotanys.

#### Récupérer tous les fokotanys sans pagination
- **Endpoint:** `GET /serviceterritoire-v2/fokotanys/sans-pagination`
- **Description:** Récupère tous les fokotanys sans pagination.
- **Réponse 200:** Liste de tous les fokotanys.

#### Récupérer les fokotanys par commune
- **Endpoint:** `GET /serviceterritoire-v2/fokotanys/commune/{commune_formatted_id}`
- **Description:** Récupère tous les fokotanys d'une commune spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | commune_formatted_id | string | Oui | ID formaté de la commune |
- **Réponse 200:** Liste des fokotanys.
- **Réponse 404:** Commune non trouvée.

#### Récupérer les fokotanys par arrondissement
- **Endpoint:** `GET /serviceterritoire-v2/fokotanys/arrondissement/{arrondissement_formatted_id}`
- **Description:** Récupère tous les fokotanys d'un arrondissement spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | arrondissement_formatted_id | string | Oui | ID formaté de l'arrondissement |
- **Réponse 200:** Liste des fokotanys.
- **Réponse 404:** Arrondissement non trouvé.

#### Récupérer un fokotany par formatted_id
- **Endpoint:** `GET /serviceterritoire-v2/fokotanys/{formatted_id}`
- **Description:** Récupère un fokotany par son formatted_id.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté du fokotany |
- **Réponse 200:** Fokotany trouvé.
- **Réponse 404:** Fokotany non trouvé.

#### Mettre à jour un fokotany
- **Endpoint:** `PATCH /serviceterritoire-v2/fokotanys/{formatted_id}`
- **Description:** Met à jour un fokotany (champs éditables uniquement).
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté du fokotany |
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | description | string | Non | Description modifiable |
- **Réponse 200:** Fokotany mis à jour.
- **Réponse 404:** Fokotany non trouvé.

#### Supprimer un fokotany
- **Endpoint:** `DELETE /serviceterritoire-v2/fokotanys/{formatted_id}`
- **Description:** Supprime un fokotany.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté du fokotany |
- **Réponse 204:** Fokotany supprimé.
- **Réponse 404:** Fokotany non trouvé.

#### Récupérer la géométrie d'un fokotany
- **Endpoint:** `GET /serviceterritoire-v2/fokotanys/{formatted_id}/form`
- **Description:** Récupère la géométrie d'un fokotany.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté du fokotany |
- **Réponse 200:** Géométrie du fokotany.

### Gestion des arrondissements
#### Récupérer tous les arrondissements
- **Endpoint:** `GET /serviceterritoire-v2/arrondissements`
- **Description:** Récupère une liste paginée de tous les arrondissements.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste paginée des arrondissements.

#### Récupérer tous les arrondissements sans pagination
- **Endpoint:** `GET /serviceterritoire-v2/arrondissements/sans-pagination`
- **Description:** Récupère tous les arrondissements sans pagination.
- **Réponse 200:** Liste de tous les arrondissements.

#### Récupérer les arrondissements avec données minimales
- **Endpoint:** `GET /serviceterritoire-v2/arrondissements/basic`
- **Description:** Récupère les arrondissements avec informations essentielles.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | page | number | Non | Numéro de page (défaut: 1) |
  | limit | number | Non | Éléments par page (défaut: 10) |
  | search | string | Non | Recherche par nom |
- **Réponse 200:** Liste optimisée des arrondissements.

#### Récupérer les arrondissements par district
- **Endpoint:** `GET /serviceterritoire-v2/arrondissements/district/{district_formatted_id}`
- **Description:** Récupère les arrondissements d'un district.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | district_formatted_id | string | Oui | ID formaté du district |
- **Réponse 200:** Liste des arrondissements.
- **Réponse 404:** District non trouvé.

#### Récupérer les arrondissements par commune
- **Endpoint:** `GET /serviceterritoire-v2/arrondissements/commune/{commune_formatted_id}`
- **Description:** Récupère les arrondissements d'une commune.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | commune_formatted_id | string | Oui | ID formaté de la commune |
- **Réponse 200:** Liste des arrondissements.
- **Réponse 404:** Commune non trouvée.

#### Trouver un arrondissement par coordonnées GPS
- **Endpoint:** `GET /serviceterritoire-v2/arrondissements/find/by-location`
- **Description:** Trouve un arrondissement par coordonnées GPS.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | lat | string | Oui | Latitude |
  | lng | string | Oui | Longitude |
- **Réponse 200:** Arrondissement trouvé.
- **Réponse 404:** Aucun arrondissement trouvé.

#### Récupérer un arrondissement par formatted_id
- **Endpoint:** `GET /serviceterritoire-v2/arrondissements/{formatted_id}`
- **Description:** Récupère un arrondissement par son formatted_id.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de l'arrondissement |
- **Réponse 200:** Arrondissement trouvé.
- **Réponse 404:** Arrondissement non trouvé.

#### Supprimer un arrondissement
- **Endpoint:** `DELETE /serviceterritoire-v2/arrondissements/{formatted_id}`
- **Description:** Supprime un arrondissement.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de l'arrondissement |
- **Réponse 204:** Arrondissement supprimé.
- **Réponse 404:** Arrondissement non trouvé.
- **Réponse 409:** Arrondissement a des dépendances.

#### Récupérer la géométrie d'un arrondissement
- **Endpoint:** `GET /serviceterritoire-v2/arrondissements/{formatted_id}/form`
- **Description:** Récupère la géométrie d'un arrondissement.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de l'arrondissement |
- **Réponse 200:** Géométrie de l'arrondissement.

#### Créer un arrondissement complet
- **Endpoint:** `POST /serviceterritoire-v2/arrondissements/full`
- **Description:** Crée un arrondissement avec logo.
- **Body Parameters (multipart/form-data):**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | file | file | Non | Logo de l'arrondissement |
  | name | string | Oui | Nom de l'arrondissement |
  | code | string | Non | Code de l'arrondissement |
  | district_id | number | Non | ID du district |
  | commune_id | number | Non | ID de la commune |
  | postal_code | string | Non | Code postal |
  | phone_number | string | Non | Numéro de téléphone |
  | email | string | Non | Email |
  | description | string | Non | Description |
  | location | string | Non | GeoJSON Point (string) |
  | form | string | Non | GeoJSON MultiPolygon (string) |
- **Réponse 201:** Arrondissement créé.

#### Mettre à jour un arrondissement partiellement
- **Endpoint:** `PATCH /serviceterritoire-v2/arrondissements/full/{formatted_id}`
- **Description:** Met à jour partiellement un arrondissement.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | formatted_id | string | Oui | ID formaté de l'arrondissement |
- **Body Parameters (multipart/form-data):** Les mêmes champs que POST /full (tous optionnels).
- **Réponse 200:** Arrondissement mis à jour.

### Gestion des relations géographiques
#### Assigner toutes les relations géographiques
- **Endpoint:** `POST /serviceterritoire-v2/relations/assign-all`
- **Description:** Assigne toutes les relations géographiques.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | method | string | Non | Méthode: ST_Within, ST_Covers, ST_Contains |
- **Réponse 200:** Relations assignées.

#### Assigner les relations par intersection maximale
- **Endpoint:** `POST /serviceterritoire-v2/relations/assign-all-max-intersection`
- **Description:** Assigne les relations par intersection maximale.
- **Réponse 200:** Relations assignées.

#### Assigner les relations via centroid
- **Endpoint:** `POST /serviceterritoire-v2/relations/assign-all/centroid`
- **Description:** Assigne les relations via centroid fallback.
- **Réponse 200:** Relations assignées.

#### Assigner les relations via ST_DWithin
- **Endpoint:** `POST /serviceterritoire-v2/relations/assign-all-dwithin`
- **Description:** Assigne les relations via ST_DWithin.
- **Query Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | distance | string | Non | Distance en mètres (défaut: 100) |
- **Réponse 200:** Relations assignées.

#### Regénérer les IDs formatés
- **Endpoint:** `POST /serviceterritoire-v2/relations/regenerate-formatted-ids`
- **Description:** Regénère tous les formatted_id de la hiérarchie territoriale.
- **Réponse 200:** IDs régénérés avec succès.

#### Regénérer les IDs formatés d'une entité
- **Endpoint:** `POST /serviceterritoire-v2/relations/regenerate-formatted-ids/{entity}`
- **Description:** Regénère les formatted_id d'une entité spécifique.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | entity | string | Oui | Nom de l'entité |
- **Réponse 200:** IDs régénérés.

#### Assigner une paire spatiale
- **Endpoint:** `POST /serviceterritoire-v2/relations/assign-pair/{child}/{parent}`
- **Description:** Assigne une paire spatiale enfant-parent.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | child | string | Oui | Entité enfant |
  | parent | string | Oui | Entité parent |
- **Réponse 200:** Paire assignée.

#### Réinitialiser une paire spatiale
- **Endpoint:** `POST /serviceterritoire-v2/relations/reset-pair/{child}/{parent}`
- **Description:** Réinitialise une paire spatiale.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | child | string | Oui | Entité enfant |
  | parent | string | Oui | Entité parent |
- **Réponse 200:** Paire réinitialisée.

#### Lister les entités non assignées
- **Endpoint:** `GET /serviceterritoire-v2/relations/unassigned/{child}/{parent}`
- **Description:** Liste les entités non assignées pour une paire.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | child | string | Oui | Entité enfant |
  | parent | string | Oui | Entité parent |
- **Réponse 200:** Entités non assignées.

#### Assignation manuelle de clé étrangère
- **Endpoint:** `POST /serviceterritoire-v2/relations/assign-manual`
- **Description:** Assignation manuelle de clé étrangère.
- **Réponse 200:** Assignation effectuée.

### Gestion des zones (service territoire)
#### Créer une zone
- **Endpoint:** `POST /serviceterritoire-v2/serviceterritoire/zone`
- **Description:** Crée une nouvelle zone.
- **Body Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | name | string | Oui | Nom de la zone |
  | description | string | Non | Description de la zone |
  | form | object | Non | GeoJSON MultiPolygon de la zone |
- **Réponse 201:** Zone créée.

#### Récupérer toutes les zones
- **Endpoint:** `GET /serviceterritoire-v2/serviceterritoire/zone`
- **Description:** Récupère toutes les zones.
- **Réponse 200:** Liste des zones.

#### Récupérer une zone par ID
- **Endpoint:** `GET /serviceterritoire-v2/serviceterritoire/zone/{id}`
- **Description:** Récupère une zone par ID.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | ID de la zone |
- **Réponse 200:** Zone trouvée.
- **Réponse 404:** Zone non trouvée.

#### Mettre à jour une zone
- **Endpoint:** `PATCH /serviceterritoire-v2/serviceterritoire/zone/{id}`
- **Description:** Met à jour une zone partiellement.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | ID de la zone |
- **Body Parameters:** Les champs à mettre à jour.
- **Réponse 200:** Zone mise à jour.
- **Réponse 404:** Zone non trouvée.

#### Supprimer une zone
- **Endpoint:** `DELETE /serviceterritoire-v2/serviceterritoire/zone/{id}`
- **Description:** Supprime une zone.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | id | number | Oui | ID de la zone |
- **Réponse 204:** Zone supprimée.
- **Réponse 404:** Zone non trouvée.

---

## Service Upload

**Base Path:** `/serviceupload`

### Gestion des fichiers
#### Upload d'un fichier
- **Endpoint:** `POST /serviceupload/file/save`
- **Description:** Upload un fichier.
- **Body Parameters (multipart/form-data):**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | folder | string | Non | Dossier de destination |
  | file | file | Oui | Fichier à uploader |
- **Réponse 201:** Fichier uploadé.
- **Réponse 400:** Requête invalide.

#### Télécharger un fichier
- **Endpoint:** `GET /serviceupload/file/{filename}`
- **Description:** Télécharge un fichier.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | filename | string | Oui | Nom du fichier |
- **Réponse 200:** Fichier téléchargé.
- **Réponse 404:** Fichier non trouvé.

#### Supprimer un fichier
- **Endpoint:** `DELETE /serviceupload/file/{filename}`
- **Description:** Supprime un fichier.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | filename | string | Oui | Nom du fichier |
- **Réponse 200:** Fichier supprimé.
- **Réponse 404:** Fichier non trouvé.

#### Aperçu d'un fichier
- **Endpoint:** `GET /serviceupload/file/preview/{filename}`
- **Description:** Récupère l'aperçu d'un fichier.
- **Path Parameters:**
  | Champ | Type | Requis | Description |
  |-------|------|--------|-------------|
  | filename | string | Oui | Nom du fichier |
- **Réponse 200:** Aperçu récupéré.
- **Réponse 404:** Fichier non trouvé.