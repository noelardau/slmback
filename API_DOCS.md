# SLAM API Documentation

## Accès à la documentation Swagger

Démarrer le serveur de développement:
```bash
npm run dev
```

Accéder à la documentation interactive:
```
http://localhost:3001/api-docs
```

## Schémas Zod implémentés

### Collectif (`src/schemas/collectif.schema.ts`)
- `registerSchema` - Inscription d'un collectif
- `loginSchema` - Connexion d'un collectif
- `updateProfileSchema` - Mise à jour du profil
- `updatePasswordSchema` - Changement de mot de passe

### Membre (`src/schemas/membre.schema.ts`)
- `createMembreSchema` - Création d'un membre
- `updateMembreSchema` - Mise à jour d'un membre

### Tournoi (`src/schemas/tournoi.schema.ts`)
- `createTournoiSchema` - Création d'un tournoi
- `updateTournoiSchema` - Mise à jour d'un tournoi

### Guest (`src/schemas/guest.schema.ts`)
- `createGuestSchema` - Création d'un guest
- `updateGuestSchema` - Mise à jour d'un guest

### Participant (`src/schemas/participant.schema.ts`)
- `createGuestParticipantSchema` - Inscription d'un guest à un tournoi

## Endpoints documentés

### Authentication
- `POST /collectif/register` - Inscription
- `POST /collectif/login` - Connexion

### Collectif
- `GET /collectif/profile` - Profil (authentifié)
- `PUT /collectif/profile` - Mise à jour profil (authentifié)
- `PUT /collectif/password` - Changement mot de passe (authentifié)

### Membres
- `POST /collectif/membres` - Créer membre (authentifié)
- `GET /collectif/membres` - Liste membres du collectif (authentifié)
- `GET /collectif/membres/:id` - Récupérer membre (authentifié)
- `PUT /collectif/membres/:id` - Mettre à jour membre (authentifié)
- `DELETE /collectif/membres/:id` - Supprimer membre (authentifié)

### Tournois
- `POST /collectif/tournois` - Créer tournoi (authentifié)
- `GET /collectif/tournois` - Liste tournois du collectif (authentifié)
- `GET /collectif/tournois/all` - Liste tous les tournois (public)
- `GET /collectif/tournois/:id` - Récupérer tournoi (public)
- `PUT /collectif/tournois/:id` - Mettre à jour tournoi (authentifié)
- `DELETE /collectif/tournois/:id` - Supprimer tournoi (authentifié)

### Guests
- `POST /api/guests` - Créer guest (authentifié)
- `GET /api/guests` - Liste guests (authentifié)
- `GET /api/guests/:id` - Récupérer guest (authentifié)
- `PUT /api/guests/:id` - Mettre à jour guest (authentifié)
- `DELETE /api/guests/:id` - Supprimer guest (authentifié)

### Participants
- `POST /api/tournois/:idTournoi/participants` - Inscrire membre (authentifié)
- `GET /api/tournois/:idTournoi/participants` - Liste participants tournoi (public)
- `DELETE /api/tournois/:idTournoi/participants` - Désinscrire membre (authentifié)
- `POST /api/tournois/:idTournoi/guests` - Inscrire guest (authentifié)
- `DELETE /api/tournois/:idTournoi/guests/:idGuest` - Désinscrire guest (authentifié)
- `GET /api/membre/tournois` - Tournois du membre connecté (authentifié)
- `GET /api/guests/:idGuest/tournois` - Tournois d'un guest (public)

## Utilisation de la validation Zod

Un middleware de validation a été créé dans `src/middleware/validation.ts`:

```typescript
import { validateRequestBody } from '../middleware/validation.js';
import { registerSchema } from '../schemas/collectif.schema.js';

router.post('/register', validateRequestBody(registerSchema), async (req, res) => {
  // req.body est maintenant validé et typé
  const { nomCollectif, ville, email, password } = req.body;
  // ...
});
```

## Avantages de cette implémentation

1. **Type-safe**: Validation automatique avec TypeScript
2. **Maintenance**: Un seul fichier de schéma par entité
3. **Documentation interactive**: Swagger UI intégré
4. **Standard OpenAPI**: Compatible avec tous les outils
5. **Validation réutilisable**: Schémas utilisables partout dans l'application