import request from 'supertest'
import express from 'express'
import { invitationRoutes, invitationPublicRoutes } from '../src/routes/invitation'
import { invitationService } from '../src/services/invitationService'

jest.mock('../src/services/invitationService')

const mockedInvitationService = invitationService as jest.Mocked<typeof invitationService>

// Stub du middleware d'auth : injecte un userId fixe
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.userId = 42
    next()
  },
  AuthRequest: express.request,
}))

// Stub multer : passe au suivant sans traiter le fichier
jest.mock('../src/middleware/upload', () => ({
  upload: {
    single: () => (_req: any, _res: any, next: any) => next(),
  },
}))

// Stub supabase pour éviter l'initialisation (inutile pour les tests routes)
jest.mock('../src/config/supabase', () => ({
  supabase: {},
  STORAGE_BUCKET: 'test',
  STORAGE_FOLDER: 'test',
}))

const app = express()
app.use(express.json())
app.use('/collectif', invitationRoutes)
app.use('/api', invitationPublicRoutes)

describe('invitation routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /collectif/invitations', () => {
    it('crée une invitation et retourne 201', async () => {
      mockedInvitationService.createInvitation.mockResolvedValue({
        idInvitation: 1,
        token: 'abc',
      } as any)

      const res = await request(app)
        .post('/collectif/invitations')
        .set('Authorization', 'Bearer fake')
        .send({ dureeJours: 7 })

      expect(res.status).toBe(201)
      expect(res.body).toEqual({ idInvitation: 1, token: 'abc' })
      expect(mockedInvitationService.createInvitation).toHaveBeenCalledWith(42, {
        dureeJours: 7,
        maxUsages: null,
      })
    })

    it('retourne 400 si dureeJours invalide', async () => {
      const res = await request(app)
        .post('/collectif/invitations')
        .set('Authorization', 'Bearer fake')
        .send({ dureeJours: -5 })

      expect(res.status).toBe(400)
      expect(mockedInvitationService.createInvitation).not.toHaveBeenCalled()
    })

    it('retourne 400 si maxUsages invalide', async () => {
      const res = await request(app)
        .post('/collectif/invitations')
        .set('Authorization', 'Bearer fake')
        .send({ maxUsages: -1 })

      expect(res.status).toBe(400)
      expect(mockedInvitationService.createInvitation).not.toHaveBeenCalled()
    })
  })

  describe('GET /collectif/invitations', () => {
    it('liste les invitations du collectif', async () => {
      mockedInvitationService.listByCollectif.mockResolvedValue([
        { idInvitation: 1, token: 'a' },
      ] as any)

      const res = await request(app)
        .get('/collectif/invitations')
        .set('Authorization', 'Bearer fake')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(mockedInvitationService.listByCollectif).toHaveBeenCalledWith(42)
    })
  })

  describe('DELETE /collectif/invitations/:id', () => {
    it('révoque et retourne 200', async () => {
      mockedInvitationService.revoke.mockResolvedValue({ statut: 'REVOQUE' } as any)

      const res = await request(app)
        .delete('/collectif/invitations/1')
        .set('Authorization', 'Bearer fake')

      expect(res.status).toBe(200)
      expect(mockedInvitationService.revoke).toHaveBeenCalledWith(1, 42)
    })

    it('retourne 404 si invitation non trouvée', async () => {
      mockedInvitationService.revoke.mockRejectedValue(new Error('Invitation non trouvée'))

      const res = await request(app)
        .delete('/collectif/invitations/999')
        .set('Authorization', 'Bearer fake')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Invitation non trouvée')
    })

    it('retourne 403 si pas accès', async () => {
      mockedInvitationService.revoke.mockRejectedValue(new Error("Vous n'avez pas accès à cette invitation"))

      const res = await request(app)
        .delete('/collectif/invitations/1')
        .set('Authorization', 'Bearer fake')

      expect(res.status).toBe(403)
    })
  })

  describe('GET /api/invitations/:token', () => {
    it('retourne les infos publiques de l\'invitation', async () => {
      mockedInvitationService.getByToken.mockResolvedValue({
        collectif: { nomCollectif: 'Slam Corp', ville: 'Paris', photoCollectif: null },
        expireLe: new Date('2030-01-01'),
        usagesCount: 2,
        maxUsages: 10,
      } as any)

      const res = await request(app).get('/api/invitations/validtoken')

      expect(res.status).toBe(200)
      expect(res.body.nomCollectif).toBe('Slam Corp')
      expect(res.body.ville).toBe('Paris')
      expect(res.body.usagesCount).toBe(2)
    })

    it('retourne 404 si token invalide', async () => {
      mockedInvitationService.getByToken.mockRejectedValue(new Error('Invitation invalide'))

      const res = await request(app).get('/api/invitations/badtoken')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Invitation invalide')
    })

    it('retourne 404 si token expiré', async () => {
      mockedInvitationService.getByToken.mockRejectedValue(new Error('Invitation expirée'))

      const res = await request(app).get('/api/invitations/expired')

      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/invitations/:token/accept', () => {
    it('retourne 400 si champs manquants', async () => {
      const res = await request(app)
        .post('/api/invitations/token/accept')
        .send({ nomMembre: 'Doe' })

      expect(res.status).toBe(400)
      expect(mockedInvitationService.accept).not.toHaveBeenCalled()
    })

    it('crée le membre et retourne 201', async () => {
      mockedInvitationService.accept.mockResolvedValue({ idMembre: 1 } as any)

      const res = await request(app)
        .post('/api/invitations/valid/accept')
        .send({
          nomMembre: 'Doe',
          prenomMembre: 'Jane',
          pseudoMembre: 'janedoe',
          emailMembre: 'jane@example.com',
          dateNaissance: '1990-01-01',
          adresse: 'Paris',
        })

      expect(res.status).toBe(201)
      expect(res.body).toEqual({ idMembre: 1 })
      expect(mockedInvitationService.accept).toHaveBeenCalledWith(
        'valid',
        expect.objectContaining({
          nomMembre: 'Doe',
          pseudoMembre: 'janedoe',
          dateNaissance: expect.any(Date),
        }),
        undefined
      )
    })

    it('retourne 409 si pseudo déjà utilisé', async () => {
      mockedInvitationService.accept.mockRejectedValue(new Error('Pseudo déjà utilisé'))

      const res = await request(app)
        .post('/api/invitations/valid/accept')
        .send({
          nomMembre: 'Doe',
          prenomMembre: 'Jane',
          pseudoMembre: 'taken',
          emailMembre: 'jane@example.com',
          dateNaissance: '1990-01-01',
          adresse: 'Paris',
        })

      expect(res.status).toBe(409)
      expect(res.body.error).toBe('Pseudo déjà utilisé')
    })

    it('retourne 404 si invitation expirée', async () => {
      mockedInvitationService.accept.mockRejectedValue(new Error('Invitation expirée'))

      const res = await request(app)
        .post('/api/invitations/valid/accept')
        .send({
          nomMembre: 'Doe',
          prenomMembre: 'Jane',
          pseudoMembre: 'janedoe',
          emailMembre: 'jane@example.com',
          dateNaissance: '1990-01-01',
          adresse: 'Paris',
        })

      expect(res.status).toBe(404)
    })
  })
})
