import { invitationService } from '../src/services/invitationService'
import { invitationModel } from '../src/models/invitationModel'
import { membreModel } from '../src/models/membreModel'
import { collectifModel } from '../src/models/collectifModel'

jest.mock('../src/models/invitationModel')
jest.mock('../src/models/membreModel')
jest.mock('../src/models/collectifModel')

const mockedInvitationModel = invitationModel as jest.Mocked<typeof invitationModel>
const mockedMembreModel = membreModel as jest.Mocked<typeof membreModel>
const mockedCollectifModel = collectifModel as jest.Mocked<typeof collectifModel>

describe('invitationService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createInvitation', () => {
    it('génère un token unique et calcule expireLe depuis dureeJours', async () => {
      mockedCollectifModel.findById.mockResolvedValue({ idCollectif: 1 } as any)
      mockedInvitationModel.create.mockResolvedValue({ idInvitation: 1, token: 'abc' } as any)

      const before = Date.now()
      const result = await invitationService.createInvitation(1, { dureeJours: 7 })
      const after = Date.now()

      expect(mockedInvitationModel.create).toHaveBeenCalledTimes(1)
      const arg = mockedInvitationModel.create.mock.calls[0][0]
      expect(arg.token).toHaveLength(64) // 32 bytes hex = 64 chars
      expect(arg.idCollectif).toBe(1)
      expect(arg.maxUsages).toBeNull()
      // expireLe ≈ now + 7 jours
      const expectedMin = new Date(before + 7 * 86400 * 1000).getTime()
      const expectedMax = new Date(after + 7 * 86400 * 1000).getTime()
      expect(new Date(arg.expireLe).getTime()).toBeGreaterThanOrEqual(expectedMin)
      expect(new Date(arg.expireLe).getTime()).toBeLessThanOrEqual(expectedMax)
      expect(result).toEqual({ idInvitation: 1, token: 'abc' })
    })

    it('utilise 7 jours par défaut si dureeJours omis', async () => {
      mockedCollectifModel.findById.mockResolvedValue({ idCollectif: 1 } as any)
      mockedInvitationModel.create.mockResolvedValue({} as any)

      await invitationService.createInvitation(1)

      const arg = mockedInvitationModel.create.mock.calls[0][0]
      const ttl = new Date(arg.expireLe).getTime() - Date.now()
      // ~7 jours (tolérance 1 minute)
      expect(ttl).toBeGreaterThan(7 * 86400 * 1000 - 60000)
      expect(ttl).toBeLessThan(7 * 86400 * 1000 + 60000)
    })

    it('lance "Collectif non trouvé" si le collectif n\'existe pas', async () => {
      mockedCollectifModel.findById.mockResolvedValue(null)

      await expect(invitationService.createInvitation(999)).rejects.toThrow('Collectif non trouvé')
    })

    it('rejette dureeJours <= 0', async () => {
      await expect(invitationService.createInvitation(1, { dureeJours: 0 })).rejects.toThrow('La durée doit être positive')
      await expect(invitationService.createInvitation(1, { dureeJours: -5 })).rejects.toThrow('La durée doit être positive')
    })

    it('rejette maxUsages <= 0', async () => {
      mockedCollectifModel.findById.mockResolvedValue({ idCollectif: 1 } as any)
      await expect(invitationService.createInvitation(1, { maxUsages: 0 })).rejects.toThrow("Le nombre d'usages doit être positif")
    })

    it('accepte maxUsages positif', async () => {
      mockedCollectifModel.findById.mockResolvedValue({ idCollectif: 1 } as any)
      mockedInvitationModel.create.mockResolvedValue({} as any)

      await invitationService.createInvitation(1, { maxUsages: 5 })

      expect(mockedInvitationModel.create.mock.calls[0][0].maxUsages).toBe(5)
    })
  })

  describe('getByToken', () => {
    it('lance "Invitation invalide" si token inconnu', async () => {
      mockedInvitationModel.findByToken.mockResolvedValue(null)

      await expect(invitationService.getByToken('unknown')).rejects.toThrow('Invitation invalide')
    })

    it('lance "Invitation révoquée" si statut REVOQUE', async () => {
      mockedInvitationModel.findByToken.mockResolvedValue({
        idInvitation: 1,
        statut: 'REVOQUE',
        expireLe: new Date(Date.now() + 86400 * 1000),
        maxUsages: null,
        usagesCount: 0,
        collectif: { nomCollectif: 'X' },
      } as any)

      await expect(invitationService.getByToken('x')).rejects.toThrow('Invitation révoquée')
    })

    it('lance "Invitation expirée" si expireLe dans le passé', async () => {
      mockedInvitationModel.findByToken.mockResolvedValue({
        idInvitation: 1,
        statut: 'ACTIF',
        expireLe: new Date(Date.now() - 86400 * 1000),
        maxUsages: null,
        usagesCount: 0,
        collectif: { nomCollectif: 'X' },
      } as any)

      await expect(invitationService.getByToken('x')).rejects.toThrow('Invitation expirée')
    })

    it('lance "Invitation expirée" si statut EXPIRE', async () => {
      mockedInvitationModel.findByToken.mockResolvedValue({
        idInvitation: 1,
        statut: 'EXPIRE',
        expireLe: new Date(Date.now() + 86400 * 1000),
        maxUsages: null,
        usagesCount: 0,
        collectif: { nomCollectif: 'X' },
      } as any)

      await expect(invitationService.getByToken('x')).rejects.toThrow('Invitation expirée')
    })

    it('lance "Invitation expirée" si usagesCount >= maxUsages', async () => {
      mockedInvitationModel.findByToken.mockResolvedValue({
        idInvitation: 1,
        statut: 'ACTIF',
        expireLe: new Date(Date.now() + 86400 * 1000),
        maxUsages: 3,
        usagesCount: 3,
        collectif: { nomCollectif: 'X' },
      } as any)

      await expect(invitationService.getByToken('x')).rejects.toThrow('Invitation expirée')
    })

    it('retourne l\'invitation si tout est valide', async () => {
      const invitation = {
        idInvitation: 1,
        token: 'valid',
        idCollectif: 42,
        statut: 'ACTIF',
        expireLe: new Date(Date.now() + 86400 * 1000),
        maxUsages: null,
        usagesCount: 0,
        collectif: { nomCollectif: 'Slam Corp' },
      }
      mockedInvitationModel.findByToken.mockResolvedValue(invitation as any)

      const result = await invitationService.getByToken('valid')
      expect(result).toEqual(invitation)
    })
  })

  describe('accept', () => {
    const validInvitation = {
      idInvitation: 1,
      token: 'valid',
      idCollectif: 42,
      statut: 'ACTIF',
      expireLe: new Date(Date.now() + 86400 * 1000),
      maxUsages: null,
      usagesCount: 0,
      collectif: { nomCollectif: 'Slam Corp' },
    }

    const membreData = {
      nomMembre: 'Doe',
      prenomMembre: 'Jane',
      pseudoMembre: 'janedoe',
      emailMembre: 'jane@example.com',
      dateNaissance: new Date('1990-01-01'),
      adresse: 'Paris',
    }

    it('crée le membre avec idCollectif de l\'invitation et incrémente usages', async () => {
      mockedInvitationModel.findByToken.mockResolvedValue(validInvitation as any)
      mockedMembreModel.findByPseudo.mockResolvedValue(null)
      mockedMembreModel.findByEmail.mockResolvedValue(null)
      mockedMembreModel.create.mockResolvedValue({ idMembre: 99 } as any)
      mockedInvitationModel.incrementUsages.mockResolvedValue({} as any)

      const result = await invitationService.accept('valid', membreData)

      expect(result).toEqual({ idMembre: 99 })
      expect(mockedMembreModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...membreData,
          idCollectif: 42,
        })
      )
      expect(mockedInvitationModel.incrementUsages).toHaveBeenCalledWith(1)
    })

    it('lance "Pseudo déjà utilisé" si pseudo existe', async () => {
      mockedInvitationModel.findByToken.mockResolvedValue(validInvitation as any)
      mockedMembreModel.findByPseudo.mockResolvedValue({ idMembre: 5 } as any)

      await expect(invitationService.accept('valid', membreData)).rejects.toThrow('Pseudo déjà utilisé')
      expect(mockedMembreModel.create).not.toHaveBeenCalled()
    })

    it('lance "Email déjà utilisé" si email existe', async () => {
      mockedInvitationModel.findByToken.mockResolvedValue(validInvitation as any)
      mockedMembreModel.findByPseudo.mockResolvedValue(null)
      mockedMembreModel.findByEmail.mockResolvedValue({ idMembre: 5 } as any)

      await expect(invitationService.accept('valid', membreData)).rejects.toThrow('Email déjà utilisé')
      expect(mockedMembreModel.create).not.toHaveBeenCalled()
    })

    it('passe le statut à EXPIRE après le dernier usage autorisé', async () => {
      const inv = { ...validInvitation, maxUsages: 2, usagesCount: 1 }
      mockedInvitationModel.findByToken.mockResolvedValue(inv as any)
      mockedMembreModel.findByPseudo.mockResolvedValue(null)
      mockedMembreModel.findByEmail.mockResolvedValue(null)
      mockedMembreModel.create.mockResolvedValue({ idMembre: 99 } as any)
      mockedInvitationModel.update.mockResolvedValue({} as any)

      await invitationService.accept('valid', membreData)

      expect(mockedInvitationModel.update).toHaveBeenCalledWith(1, { statut: 'EXPIRE' })
      expect(mockedInvitationModel.incrementUsages).not.toHaveBeenCalled()
    })

    it('passe photoUrl dans la création du membre', async () => {
      mockedInvitationModel.findByToken.mockResolvedValue(validInvitation as any)
      mockedMembreModel.findByPseudo.mockResolvedValue(null)
      mockedMembreModel.findByEmail.mockResolvedValue(null)
      mockedMembreModel.create.mockResolvedValue({ idMembre: 99 } as any)
      mockedInvitationModel.incrementUsages.mockResolvedValue({} as any)

      await invitationService.accept('valid', membreData, 'https://example.com/photo.jpg')

      expect(mockedMembreModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          photoMembre: 'https://example.com/photo.jpg',
        })
      )
    })
  })

  describe('revoke', () => {
    it('révoque une invitation appartenant au collectif', async () => {
      mockedInvitationModel.findById.mockResolvedValue({
        idInvitation: 1,
        idCollectif: 42,
      } as any)
      mockedInvitationModel.update.mockResolvedValue({ statut: 'REVOQUE' } as any)

      const result = await invitationService.revoke(1, 42)
      expect(result).toEqual({ statut: 'REVOQUE' })
      expect(mockedInvitationModel.update).toHaveBeenCalledWith(1, { statut: 'REVOQUE' })
    })

    it('lance "Invitation non trouvée" si id inconnu', async () => {
      mockedInvitationModel.findById.mockResolvedValue(null)

      await expect(invitationService.revoke(999, 42)).rejects.toThrow('Invitation non trouvée')
    })

    it('lance une erreur 403 si l\'invitation n\'appartient pas au collectif', async () => {
      mockedInvitationModel.findById.mockResolvedValue({
        idInvitation: 1,
        idCollectif: 99,
      } as any)

      await expect(invitationService.revoke(1, 42)).rejects.toThrow('Vous n\'avez pas accès à cette invitation')
    })
  })
})
