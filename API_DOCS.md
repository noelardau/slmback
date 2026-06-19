# SLAM API Documentation

## Endpoints API

### Authentication

#### POST /collectif/register
Inscription d'un collectif
- **Body**:
  - `nomCollectif` (string, requis) - Nom du collectif
  - `ville` (string, requis) - Ville du collectif
  - `email` (string, requis) - Email du collectif
  - `password` (string, requis) - Mot de passe
  - `photoCollectif` (string, optionnel) - URL de la photo du collectif

#### POST /collectif/login
Connexion d'un collectif
- **Body**:
  - `email` (string, requis) - Email du collectif
  - `password` (string, requis) - Mot de passe

#### POST /collectif/logout
Déconnexion d'un collectif (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`

### Collectif

#### GET /collectif/profile
Récupérer le profil du collectif connecté (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`

#### PUT /collectif/profile
Mettre à jour le profil du collectif (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Body**:
  - `nomCollectif` (string, optionnel) - Nom du collectif
  - `ville` (string, optionnel) - Ville du collectif
  - `email` (string, optionnel) - Email du collectif
  - `photoCollectif` (string, optionnel) - URL de la photo du collectif
  - `prefLang` (string, optionnel) - Langue préférée (`en` ou `fr`)
  - `prefTheme` (string, optionnel) - Thème préféré (`dark` ou `light`)

#### PUT /collectif/preferences
Mettre à jour les préférences d'affichage du collectif (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Body**:
  - `prefLang` (string, optionnel) - Langue préférée (`en` ou `fr`)
  - `prefTheme` (string, optionnel) - Thème préféré (`dark` ou `light`)
- **Response**: Objet Collectif mis à jour (inclut `prefLang` et `prefTheme`)

#### PUT /collectif/password
Changer le mot de passe du collectif (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Body**:
  - `currentPassword` (string, requis) - Mot de passe actuel
  - `newPassword` (string, requis) - Nouveau mot de passe

### Membres

#### POST /collectif/membres
Créer un nouveau membre (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Body**:
  - `nomMembre` (string, requis) - Nom du membre
  - `prenomMembre` (string, requis) - Prénom du membre
  - `pseudoMembre` (string, requis) - Pseudo du membre
  - `emailMembre` (string, requis) - Email du membre
  - `dateNaissance` (string, requis) - Date de naissance (format ISO 8601)
  - `adresse` (string, requis) - Adresse du membre
  - `photoMembre` (string, optionnel) - URL de la photo du membre
- **Response**: Objet Membre créé

#### GET /collectif/membres
Récupérer tous les membres du collectif connecté (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`

#### GET /collectif/membres/:id
Récupérer un membre par ID (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `id` (number) - ID du membre

#### PUT /collectif/membres/:id
Mettre à jour un membre (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `id` (number) - ID du membre
- **Body**:
  - `nomMembre` (string, optionnel) - Nom du membre
  - `prenomMembre` (string, optionnel) - Prénom du membre
  - `pseudoMembre` (string, optionnel) - Pseudo du membre
  - `emailMembre` (string, optionnel) - Email du membre
  - `dateNaissance` (string, optionnel) - Date de naissance (format ISO 8601)
  - `adresse` (string, optionnel) - Adresse du membre
  - `photoMembre` (string, optionnel) - URL de la photo du membre

#### DELETE /collectif/membres/:id
Supprimer un membre (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `id` (number) - ID du membre

### Tournois

#### POST /collectif/tournois
Créer un nouveau tournoi (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Body**:
  - `LieuTournoi` (string, requis) - Lieu du tournoi
  - `dateTournoi` (string, requis) - Date du tournoi (format ISO 8601)
  - `heureTournoi` (string, requis) - Heure du tournoi
  - `nomTournoi` (string, requis) - Nom du tournoi
  - `nbJury` (number, requis) - Nombre de jurés
  - `afficheTournoi` (string, optionnel) - URL de l'affiche du tournoi
- **Response**: Objet Tournoi créé

#### GET /collectif/tournois
Récupérer tous les tournois du collectif connecté (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`

#### GET /collectif/tournois/all
Récupérer tous les tournois (public)

#### GET /collectif/tournois/:id
Récupérer un tournoi par ID (public)
- **Params**:
  - `id` (number) - ID du tournoi

#### PUT /collectif/tournois/:id
Mettre à jour un tournoi (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `id` (number) - ID du tournoi
- **Body**:
  - `LieuTournoi` (string, optionnel) - Lieu du tournoi
  - `dateTournoi` (string, optionnel) - Date du tournoi (format ISO 8601)
  - `heureTournoi` (string, optionnel) - Heure du tournoi
  - `nomTournoi` (string, optionnel) - Nom du tournoi
  - `nbJury` (number, optionnel) - Nombre de jurés
  - `afficheTournoi` (string, optionnel) - URL de l'affiche du tournoi

#### DELETE /collectif/tournois/:id
Supprimer un tournoi (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `id` (number) - ID du tournoi

### Guests

#### POST /api/guests
Créer un nouveau guest (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Body**:
  - `nomGuest` (string, requis) - Nom du guest
  - `prenomGuest` (string, requis) - Prénom du guest
  - `emailGuest` (string, requis) - Email du guest
  - `telephone` (string, optionnel) - Téléphone du guest

#### GET /api/guests
Récupérer tous les guests (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`

#### GET /api/guests/:id
Récupérer un guest par ID (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `id` (number) - ID du guest

#### PUT /api/guests/:id
Mettre à jour un guest (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `id` (number) - ID du guest
- **Body**:
  - `nomGuest` (string, optionnel) - Nom du guest
  - `prenomGuest` (string, optionnel) - Prénom du guest
  - `emailGuest` (string, optionnel) - Email du guest
  - `telephone` (string, optionnel) - Téléphone du guest

#### DELETE /api/guests/:id
Supprimer un guest (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `id` (number) - ID du guest

### Participants

#### POST /api/tournois/:idTournoi/participants
Inscrire un membre à un tournoi (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `idTournoi` (number) - ID du tournoi

#### GET /api/tournois/:idTournoi/participants
Récupérer tous les participants d'un tournoi (public)
- **Params**:
  - `idTournoi` (number) - ID du tournoi

#### DELETE /api/tournois/:idTournoi/participants
Désinscrire un membre d'un tournoi (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `idTournoi` (number) - ID du tournoi

#### POST /api/tournois/:idTournoi/guests
Inscrire un guest à un tournoi (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `idTournoi` (number) - ID du tournoi
- **Body**:
  - `nomGuest` (string, requis) - Nom du guest
  - `prenomGuest` (string, requis) - Prénom du guest
  - `emailGuest` (string, requis) - Email du guest
  - `telephone` (string, optionnel) - Téléphone du guest

#### DELETE /api/tournois/:idTournoi/guests/:idGuest
Désinscrire un guest d'un tournoi (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`
- **Params**:
  - `idTournoi` (number) - ID du tournoi
  - `idGuest` (number) - ID du guest

#### GET /api/membre/tournois
Récupérer tous les tournois du membre connecté (authentifié)
- **Headers**:
  - `Authorization: Bearer <token_jwt>`

#### GET /api/guests/:idGuest/tournois
Récupérer tous les tournois d'un guest (public)
- **Params**:
  - `idGuest` (number) - ID du guest

## Authentification

Tous les endpoints marqués comme "authentifié" nécessitent un token JWT dans l'en-tête Authorization:
```
Authorization: Bearer <votre_token_jwt>
```

## Démarrage du serveur

```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:3001`