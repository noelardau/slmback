import { z } from 'zod';

type SecurityScheme = {
  bearerAuth: string[];
};

interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    securitySchemes: {
      bearerAuth: {
        type: string;
        scheme: string;
        bearerFormat: string;
      };
    };
  };
}

const createSecurity = (): SecurityScheme[] => [{ bearerAuth: [] }];

export const openApiSpec: OpenApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SLAM API',
    version: '1.0.0',
    description: 'API de gestion de tournois de slam poétique',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Serveur de développement',
    },
  ],
  paths: {
    '/collectif/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Inscrire un nouveau collectif',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nomCollectif', 'ville', 'email', 'password'],
                properties: {
                  nomCollectif: {
                    type: 'string',
                    description: 'Nom du collectif',
                  },
                  ville: {
                    type: 'string',
                    description: 'Ville du collectif',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'Email du collectif',
                  },
                  password: {
                    type: 'string',
                    minLength: 6,
                    description: 'Mot de passe (min 6 caractères)',
                  },
                  photoCollectif: {
                    type: 'string',
                    description: 'URL de la photo du collectif',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Collectif créé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                    idCollectif: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Données invalides',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/collectif/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Connexion d\'un collectif',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  password: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Connexion réussie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: {
                      type: 'string',
                    },
                    idCollectif: {
                      type: 'number',
                    },
                    nomCollectif: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Identifiants invalides',
          },
        },
      },
    },
    '/collectif/profile': {
      get: {
        tags: ['Collectif'],
        summary: 'Récupérer le profil du collectif connecté',
        security: createSecurity(),
        responses: {
          '200': {
            description: 'Profil récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idCollectif: {
                      type: 'number',
                    },
                    nomCollectif: {
                      type: 'string',
                    },
                    ville: {
                      type: 'string',
                    },
                    email: {
                      type: 'string',
                    },
                    photoCollectif: {
                      type: 'string',
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '404': {
            description: 'Collectif non trouvé',
          },
        },
      },
      put: {
        tags: ['Collectif'],
        summary: 'Mettre à jour le profil du collectif',
        security: createSecurity(),
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nomCollectif: {
                    type: 'string',
                  },
                  ville: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  photoCollectif: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profil mis à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idCollectif: {
                      type: 'number',
                    },
                    nomCollectif: {
                      type: 'string',
                    },
                    ville: {
                      type: 'string',
                    },
                    email: {
                      type: 'string',
                    },
                    photoCollectif: {
                      type: 'string',
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '404': {
            description: 'Collectif non trouvé',
          },
        },
      },
    },
    '/collectif/password': {
      put: {
        tags: ['Collectif'],
        summary: 'Changer le mot de passe du collectif',
        security: createSecurity(),
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: {
                    type: 'string',
                  },
                  newPassword: {
                    type: 'string',
                    minLength: 6,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Mot de passe changé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Mot de passe actuel incorrect',
          },
          '404': {
            description: 'Collectif non trouvé',
          },
        },
      },
    },
    '/collectif/membres': {
      post: {
        tags: ['Membres'],
        summary: 'Créer un nouveau membre',
        security: createSecurity(),
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nomMembre', 'prenomMembre', 'dateNaissance', 'adresse'],
                properties: {
                  nomMembre: {
                    type: 'string',
                  },
                  prenomMembre: {
                    type: 'string',
                  },
                  photoMembre: {
                    type: 'string',
                  },
                  dateNaissance: {
                    type: 'string',
                    format: 'date-time',
                  },
                  adresse: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Membre créé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idMembre: {
                      type: 'number',
                    },
                    nomMembre: {
                      type: 'string',
                    },
                    prenomMembre: {
                      type: 'string',
                    },
                    photoMembre: {
                      type: 'string',
                      nullable: true,
                    },
                    dateNaissance: {
                      type: 'string',
                      format: 'date-time',
                    },
                    adresse: {
                      type: 'string',
                    },
                    idCollectif: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Données invalides',
          },
          '401': {
            description: 'Non authentifié',
          },
        },
      },
      get: {
        tags: ['Membres'],
        summary: 'Récupérer tous les membres du collectif connecté',
        security: createSecurity(),
        responses: {
          '200': {
            description: 'Liste des membres',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      idMembre: {
                        type: 'number',
                      },
                      nomMembre: {
                        type: 'string',
                      },
                      prenomMembre: {
                        type: 'string',
                      },
                      photoMembre: {
                        type: 'string',
                        nullable: true,
                      },
                      dateNaissance: {
                        type: 'string',
                        format: 'date-time',
                      },
                      adresse: {
                        type: 'string',
                      },
                      idCollectif: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
        },
      },
    },
    '/collectif/membres/{id}': {
      get: {
        tags: ['Membres'],
        summary: 'Récupérer un membre par ID',
        security: createSecurity(),
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du membre',
          },
        ],
        responses: {
          '200': {
            description: 'Membre récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idMembre: {
                      type: 'number',
                    },
                    nomMembre: {
                      type: 'string',
                    },
                    prenomMembre: {
                      type: 'string',
                    },
                    photoMembre: {
                      type: 'string',
                      nullable: true,
                    },
                    dateNaissance: {
                      type: 'string',
                      format: 'date-time',
                    },
                    adresse: {
                      type: 'string',
                    },
                    idCollectif: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '403': {
            description: 'Accès refusé',
          },
          '404': {
            description: 'Membre non trouvé',
          },
        },
      },
      put: {
        tags: ['Membres'],
        summary: 'Mettre à jour un membre',
        security: createSecurity(),
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du membre',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nomMembre: {
                    type: 'string',
                  },
                  prenomMembre: {
                    type: 'string',
                  },
                  photoMembre: {
                    type: 'string',
                  },
                  dateNaissance: {
                    type: 'string',
                    format: 'date-time',
                  },
                  adresse: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Membre mis à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idMembre: {
                      type: 'number',
                    },
                    nomMembre: {
                      type: 'string',
                    },
                    prenomMembre: {
                      type: 'string',
                    },
                    photoMembre: {
                      type: 'string',
                      nullable: true,
                    },
                    dateNaissance: {
                      type: 'string',
                      format: 'date-time',
                    },
                    adresse: {
                      type: 'string',
                    },
                    idCollectif: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '403': {
            description: 'Accès refusé',
          },
          '404': {
            description: 'Membre non trouvé',
          },
        },
      },
      delete: {
        tags: ['Membres'],
        summary: 'Supprimer un membre',
        security: createSecurity(),
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du membre',
          },
        ],
        responses: {
          '200': {
            description: 'Membre supprimé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '403': {
            description: 'Accès refusé',
          },
          '404': {
            description: 'Membre non trouvé',
          },
        },
      },
    },
    '/collectif/tournois': {
      post: {
        tags: ['Tournois'],
        summary: 'Créer un nouveau tournoi',
        security: createSecurity(),
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['LieuTournoi', 'dateTournoi', 'heureTournoi', 'nomTournoi', 'nbJury'],
                properties: {
                  LieuTournoi: {
                    type: 'string',
                  },
                  dateTournoi: {
                    type: 'string',
                    format: 'date-time',
                  },
                  heureTournoi: {
                    type: 'string',
                  },
                  nomTournoi: {
                    type: 'string',
                  },
                  nbJury: {
                    type: 'integer',
                    minimum: 1,
                  },
                  afficheTournoi: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tournoi créé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idTournoi: {
                      type: 'number',
                    },
                    LieuTournoi: {
                      type: 'string',
                    },
                    dateTournoi: {
                      type: 'string',
                      format: 'date-time',
                    },
                    heureTournoi: {
                      type: 'string',
                    },
                    nomTournoi: {
                      type: 'string',
                    },
                    nbJury: {
                      type: 'number',
                    },
                    afficheTournoi: {
                      type: 'string',
                      nullable: true,
                    },
                    idCollectif: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Données invalides',
          },
          '401': {
            description: 'Non authentifié',
          },
        },
      },
      get: {
        tags: ['Tournois'],
        summary: 'Récupérer tous les tournois du collectif connecté',
        security: createSecurity(),
        responses: {
          '200': {
            description: 'Liste des tournois',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      idTournoi: {
                        type: 'number',
                      },
                      LieuTournoi: {
                        type: 'string',
                      },
                      dateTournoi: {
                        type: 'string',
                        format: 'date-time',
                      },
                      heureTournoi: {
                        type: 'string',
                      },
                      nomTournoi: {
                        type: 'string',
                      },
                      nbJury: {
                        type: 'number',
                      },
                      afficheTournoi: {
                        type: 'string',
                        nullable: true,
                      },
                      idCollectif: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
        },
      },
    },
    '/collectif/tournois/all': {
      get: {
        tags: ['Tournois'],
        summary: 'Récupérer tous les tournois (public)',
        responses: {
          '200': {
            description: 'Liste de tous les tournois',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      idTournoi: {
                        type: 'number',
                      },
                      LieuTournoi: {
                        type: 'string',
                      },
                      dateTournoi: {
                        type: 'string',
                        format: 'date-time',
                      },
                      heureTournoi: {
                        type: 'string',
                      },
                      nomTournoi: {
                        type: 'string',
                      },
                      nbJury: {
                        type: 'number',
                      },
                      afficheTournoi: {
                        type: 'string',
                        nullable: true,
                      },
                      idCollectif: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/collectif/tournois/{id}': {
      get: {
        tags: ['Tournois'],
        summary: 'Récupérer un tournoi par ID (public)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du tournoi',
          },
        ],
        responses: {
          '200': {
            description: 'Tournoi récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idTournoi: {
                      type: 'number',
                    },
                    LieuTournoi: {
                      type: 'string',
                    },
                    dateTournoi: {
                      type: 'string',
                      format: 'date-time',
                    },
                    heureTournoi: {
                      type: 'string',
                    },
                    nomTournoi: {
                      type: 'string',
                    },
                    nbJury: {
                      type: 'number',
                    },
                    afficheTournoi: {
                      type: 'string',
                      nullable: true,
                    },
                    idCollectif: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Tournoi non trouvé',
          },
        },
      },
      put: {
        tags: ['Tournois'],
        summary: 'Mettre à jour un tournoi',
        security: createSecurity(),
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du tournoi',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  LieuTournoi: {
                    type: 'string',
                  },
                  dateTournoi: {
                    type: 'string',
                    format: 'date-time',
                  },
                  heureTournoi: {
                    type: 'string',
                  },
                  nomTournoi: {
                    type: 'string',
                  },
                  nbJury: {
                    type: 'number',
                    minimum: 1,
                  },
                  afficheTournoi: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tournoi mis à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idTournoi: {
                      type: 'number',
                    },
                    LieuTournoi: {
                      type: 'string',
                    },
                    dateTournoi: {
                      type: 'string',
                      format: 'date-time',
                    },
                    heureTournoi: {
                      type: 'string',
                    },
                    nomTournoi: {
                      type: 'string',
                    },
                    nbJury: {
                      type: 'number',
                    },
                    afficheTournoi: {
                      type: 'string',
                      nullable: true,
                    },
                    idCollectif: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '403': {
            description: 'Accès refusé',
          },
          '404': {
            description: 'Tournoi non trouvé',
          },
        },
      },
      delete: {
        tags: ['Tournois'],
        summary: 'Supprimer un tournoi',
        security: createSecurity(),
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du tournoi',
          },
        ],
        responses: {
          '200': {
            description: 'Tournoi supprimé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '403': {
            description: 'Accès refusé',
          },
          '404': {
            description: 'Tournoi non trouvé',
          },
        },
      },
    },
    '/api/guests': {
      post: {
        tags: ['Guests'],
        summary: 'Créer un nouveau guest',
        security: createSecurity(),
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nomGuest', 'prenomGuest', 'emailGuest'],
                properties: {
                  nomGuest: {
                    type: 'string',
                  },
                  prenomGuest: {
                    type: 'string',
                  },
                  emailGuest: {
                    type: 'string',
                    format: 'email',
                  },
                  telephone: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Guest créé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idGuest: {
                      type: 'number',
                    },
                    nomGuest: {
                      type: 'string',
                    },
                    prenomGuest: {
                      type: 'string',
                    },
                    emailGuest: {
                      type: 'string',
                    },
                    telephone: {
                      type: 'string',
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Données invalides',
          },
          '401': {
            description: 'Non authentifié',
          },
          '409': {
            description: 'Email déjà utilisé',
          },
        },
      },
      get: {
        tags: ['Guests'],
        summary: 'Récupérer tous les guests',
        security: createSecurity(),
        responses: {
          '200': {
            description: 'Liste des guests',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      idGuest: {
                        type: 'number',
                      },
                      nomGuest: {
                        type: 'string',
                      },
                      prenomGuest: {
                        type: 'string',
                      },
                      emailGuest: {
                        type: 'string',
                      },
                      telephone: {
                        type: 'string',
                        nullable: true,
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
        },
      },
    },
    '/api/guests/{id}': {
      get: {
        tags: ['Guests'],
        summary: 'Récupérer un guest par ID',
        security: createSecurity(),
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du guest',
          },
        ],
        responses: {
          '200': {
            description: 'Guest récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idGuest: {
                      type: 'number',
                    },
                    nomGuest: {
                      type: 'string',
                    },
                    prenomGuest: {
                      type: 'string',
                    },
                    emailGuest: {
                      type: 'string',
                    },
                    telephone: {
                      type: 'string',
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '404': {
            description: 'Guest non trouvé',
          },
        },
      },
      put: {
        tags: ['Guests'],
        summary: 'Mettre à jour un guest',
        security: createSecurity(),
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du guest',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nomGuest: {
                    type: 'string',
                  },
                  prenomGuest: {
                    type: 'string',
                  },
                  emailGuest: {
                    type: 'string',
                    format: 'email',
                  },
                  telephone: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Guest mis à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idGuest: {
                      type: 'number',
                    },
                    nomGuest: {
                      type: 'string',
                    },
                    prenomGuest: {
                      type: 'string',
                    },
                    emailGuest: {
                      type: 'string',
                    },
                    telephone: {
                      type: 'string',
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '404': {
            description: 'Guest non trouvé',
          },
        },
      },
      delete: {
        tags: ['Guests'],
        summary: 'Supprimer un guest',
        security: createSecurity(),
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du guest',
          },
        ],
        responses: {
          '200': {
            description: 'Guest supprimé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '404': {
            description: 'Guest non trouvé',
          },
        },
      },
    },
    '/api/tournois/{idTournoi}/participants': {
      post: {
        tags: ['Participants'],
        summary: 'Inscrire un membre à un tournoi',
        security: createSecurity(),
        parameters: [
          {
            name: 'idTournoi',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du tournoi',
          },
        ],
        responses: {
          '201': {
            description: 'Inscription réussie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idParticipant: {
                      type: 'number',
                    },
                    idMembre: {
                      type: 'number',
                      nullable: true,
                    },
                    idTournoi: {
                      type: 'number',
                    },
                    idGuest: {
                      type: 'number',
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '404': {
            description: 'Tournoi ou membre non trouvé',
          },
          '409': {
            description: 'Membre déjà inscrit',
          },
        },
      },
      get: {
        tags: ['Participants'],
        summary: 'Récupérer tous les participants d\'un tournoi',
        parameters: [
          {
            name: 'idTournoi',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du tournoi',
          },
        ],
        responses: {
          '200': {
            description: 'Liste des participants',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      idParticipant: {
                        type: 'number',
                      },
                      idMembre: {
                        type: 'number',
                        nullable: true,
                      },
                      idTournoi: {
                        type: 'number',
                      },
                      idGuest: {
                        type: 'number',
                        nullable: true,
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Tournoi non trouvé',
          },
        },
      },
      delete: {
        tags: ['Participants'],
        summary: 'Désinscrire un membre d\'un tournoi',
        security: createSecurity(),
        parameters: [
          {
            name: 'idTournoi',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du tournoi',
          },
        ],
        responses: {
          '200': {
            description: 'Désinscription réussie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '404': {
            description: 'Inscription non trouvée',
          },
        },
      },
    },
    '/api/tournois/{idTournoi}/guests': {
      post: {
        tags: ['Participants'],
        summary: 'Inscrire un guest à un tournoi',
        security: createSecurity(),
        parameters: [
          {
            name: 'idTournoi',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du tournoi',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nomGuest', 'prenomGuest', 'emailGuest'],
                properties: {
                  nomGuest: {
                    type: 'string',
                  },
                  prenomGuest: {
                    type: 'string',
                  },
                  emailGuest: {
                    type: 'string',
                    format: 'email',
                  },
                  telephone: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Inscription réussie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    idParticipant: {
                      type: 'number',
                    },
                    idMembre: {
                      type: 'number',
                      nullable: true,
                    },
                    idTournoi: {
                      type: 'number',
                    },
                    idGuest: {
                      type: 'number',
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Données invalides',
          },
          '401': {
            description: 'Non authentifié',
          },
          '404': {
            description: 'Tournoi non trouvé',
          },
          '409': {
            description: 'Guest déjà inscrit',
          },
        },
      },
    },
    '/api/tournois/{idTournoi}/guests/{idGuest}': {
      delete: {
        tags: ['Participants'],
        summary: 'Désinscrire un guest d\'un tournoi',
        security: createSecurity(),
        parameters: [
          {
            name: 'idTournoi',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du tournoi',
          },
          {
            name: 'idGuest',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du guest',
          },
        ],
        responses: {
          '200': {
            description: 'Désinscription réussie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
          '404': {
            description: 'Inscription non trouvée',
          },
        },
      },
    },
    '/api/membre/tournois': {
      get: {
        tags: ['Participants'],
        summary: 'Récupérer tous les tournois du membre connecté',
        security: createSecurity(),
        responses: {
          '200': {
            description: 'Liste des tournois du membre',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      idTournoi: {
                        type: 'number',
                      },
                      LieuTournoi: {
                        type: 'string',
                      },
                      dateTournoi: {
                        type: 'string',
                        format: 'date-time',
                      },
                      heureTournoi: {
                        type: 'string',
                      },
                      nomTournoi: {
                        type: 'string',
                      },
                      nbJury: {
                        type: 'number',
                      },
                      afficheTournoi: {
                        type: 'string',
                        nullable: true,
                      },
                      idCollectif: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Non authentifié',
          },
        },
      },
    },
    '/api/guests/{idGuest}/tournois': {
      get: {
        tags: ['Participants'],
        summary: 'Récupérer tous les tournois d\'un guest',
        parameters: [
          {
            name: 'idGuest',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID du guest',
          },
        ],
        responses: {
          '200': {
            description: 'Liste des tournois du guest',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      idTournoi: {
                        type: 'number',
                      },
                      LieuTournoi: {
                        type: 'string',
                      },
                      dateTournoi: {
                        type: 'string',
                        format: 'date-time',
                      },
                      heureTournoi: {
                        type: 'string',
                      },
                      nomTournoi: {
                        type: 'string',
                      },
                      nbJury: {
                        type: 'number',
                      },
                      afficheTournoi: {
                        type: 'string',
                        nullable: true,
                      },
                      idCollectif: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Guest non trouvé',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};