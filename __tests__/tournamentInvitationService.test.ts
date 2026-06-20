import { tournamentInvitationService } from '../src/services/tournamentInvitationService'
import { tournamentInvitationModel } from '../src/models/tournamentInvitationModel'
import { tournoiModel } from '../src/models/tournoiModel'
import { membreModel } from '../src/models/membreModel'
import { participantService } from '../src/services/participantService'

jest.mock('../src/models/tournamentInvitationModel')
jest.mock('../src/models/tournoiModel')
jest.mock('../src/models/membreModel')
jest.mock('../src/services/participantService')

const mockedModel = tournamentInvitationModel as jest.Mocked<typeof tournamentInvitationModel>
const mockedTournoiModel = tournoiModel as jest.Mocked<typeof tournoiModel>
const mockedMembreModel = membreModel as jest.Mocked<typeof membreModel>
const mockedParticipantService = participantService as jest.Mocked<typeof participantService>

describe('tournamentInvitationService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createInvitation', () => {
    it('génère un token et calcule expireLe depuis dureeJours', async () => {
      mockedTournoiModel.findById.mockResolvedValue({ idTournoi: 1, idCollectif: 42 } as any)
      mockedModel.create.mockResolvedValue({ idTournamentInvitation: 1, token: 'abc' } as any)

      const before = Date.now()
      const result = await tournamentInvitationService.createInvitation(1, 42, { dureeJours: 7 })
      const after = Date.now()

      expect(mockedModel.create).toHaveBeenCalledTimes(1)
      const arg = mockedModel.create.mock.calls[0][0]
      expect(arg.token).toHaveLength(64)
      expect(arg.idTournoi).toBe(1)
      expect(arg.maxUsages).toBeNull()
      const expectedMin = new Date(before + 7 * 86400 * 1000).getTime()
      const expectedMax = new Date(after + 7 * 86400 * 1000).getTime()
      expect(new Date(arg.expireLe).getTime()).toBeGreaterThanOrEqual(expectedMin)
      expect(new Date(arg.expireLe).getTime()).toBeLessThanOrEqual(expectedMax)
      expect(result).toEqual({ idTournamentInvitation: 1, token: 'abc' })
    })

    it('lance "Tournoi non trouvé" si le tournoi n\'existe pas', async () => {
      mockedTournoiModel.findById.mockResolvedValue(null)

      await expect(
        tournamentInvitationService.createInvitation(999, 42)
      ).rejects.toThrow('Tournoi non trouvé')
    })

    it('lance une erreur 403 si le tournoi n\'appartient pas au collectif', async () => {
      mockedTournoiModel.findById.mockResolvedValue({ idTournoi: 1, idCollectif: 99 } as any)

      await expect(
        tournamentInvitationService.createInvitation(1, 42)
      ).rejects.toThrow('Vous n\'avez pas accès à ce tournoi')
    })

    it('rejette dureeJours <= 0', async () => {
      await expect(
        tournamentInvitationService.createInvitation(1, 42, { dureeJours: 0 })
      ).rejects.toThrow('La durée doit être positive')
    })

    it('rejette maxUsages <= 0', async () => {
      mockedTournoiModel.findById.mockResolvedValue({ idTournoi: 1, idCollectif: 42 } as any)
      await expect(
        tournamentInvitationService.createInvitation(1, 42, { maxUsages: -1 })
      ).rejects.toThrow("Le nombre d'usages doit être positif")
    })
  })

  describe('getByToken', () => {
    it('lance "Invitation invalide" si token inconnu', async () => {
      mockedModel.findByToken.mockResolvedValue(null)

      await expect(tournamentInvitationService.getByToken('unknown')).rejects.toThrow(
        'Invitation invalide'
      )
    })

    it('lance "Invitation révoquée" si statut REVOQUE', async () => {
      mockedModel.findByToken.mockResolvedValue({
        idTournamentInvitation: 1,
        statut: 'REVOQUE',
        expireLe: new Date(Date.now() + 86400 * 1000),
        maxUsages: null,
        usagesCount: 0,
        tournoi: { idTournoi: 1, idCollectif: 42 },
      } as any)

      await expect(tournamentInvitationService.getByToken('x')).rejects.toThrow(
        'Invitation révoquée'
      )
    })

    it('lance "Invitation expirée" si expireLe dans le passé', async () => {
      mockedModel.findByToken.mockResolvedValue({
        idTournamentInvitation: 1,
        statut: 'ACTIF',
        expireLe: new Date(Date.now() - 86400 * 1000),
        maxUsages: null,
        usagesCount: 0,
        tournoi: { idTournoi: 1, idCollectif: 42 },
      } as any)

      await expect(tournamentInvitationService.getByToken('x')).rejects.toThrow(
        'Invitation expirée'
      )
    })

    it('lance "Invitation expirée" si usagesCount >= maxUsages', async () => {
      mockedModel.findByToken.mockResolvedValue({
        idTournamentInvitation: 1,
        statut: 'ACTIF',
        expireLe: new Date(Date.now() + 86400 * 1000),
        maxUsages: 5,
        usagesCount: 5,
        tournoi: { idTournoi: 1, idCollectif: 42 },
      } as any)

      await expect(tournamentInvitationService.getByToken('x')).rejects.toThrow(
        'Invitation expirée'
      )
    })
  })

  describe('acceptAsMembre', () => {
    const validInvitation = {
      idTournamentInvitation: 1,
      token: 'valid',
      statut: 'ACTIF',
      expireLe: new Date(Date.now() + 86400 * 1000),
      maxUsages: null,
      usagesCount: 0,
      tournoi: {
        idTournoi: 10,
        idCollectif: 42,
        nomTournoi: 'Slam Cup',
        collectif: { nomCollectif: 'Slam Corp' },
      },
    }

    it('inscrit le membre quand le code correspond ET même collectif', async () => {
      mockedModel.findByToken.mockResolvedValue(validInvitation as any)
      mockedMembreModel.findByCodeMembre.mockResolvedValue({
        idMembre: 7,
        idCollectif: 42,
        pseudoMembre: 'jane',
      } as any)
      mockedParticipantService.registerMembre.mockResolvedValue({
        message: 'Membre inscrit au tournoi avec succès',
        participant: { idParticipant: 1 },
      } as any)
      mockedModel.incrementUsages.mockResolvedValue({} as any)

      const result = await tournamentInvitationService.acceptAsMembre('valid', 'SLM-ABC123')

      expect(mockedMembreModel.findByCodeMembre).toHaveBeenCalledWith('SLM-ABC123')
      expect(mockedParticipantService.registerMembre).toHaveBeenCalledWith(10, 7)
      expect(result.participant.idParticipant).toBe(1)
      expect(mockedModel.incrementUsages).toHaveBeenCalledWith(1)
    })

    it('normalise le code (uppercase + préfixe SLM)', async () => {
      mockedModel.findByToken.mockResolvedValue(validInvitation as any)
      mockedMembreModel.findByCodeMembre.mockResolvedValue({
        idMembre: 7,
        idCollectif: 42,
      } as any)
      mockedParticipantService.registerMembre.mockResolvedValue({} as any)
      mockedModel.incrementUsages.mockResolvedValue({} as any)

      await tournamentInvitationService.acceptAsMembre('valid', 'slm-abc123')

      expect(mockedMembreModel.findByCodeMembre).toHaveBeenCalledWith('SLM-ABC123')
    })

    it('lance "Code membre invalide" si le code n\'existe pas', async () => {
      mockedModel.findByToken.mockResolvedValue(validInvitation as any)
      mockedMembreModel.findByCodeMembre.mockResolvedValue(null)

      await expect(
        tournamentInvitationService.acceptAsMembre('valid', 'SLM-XXXXXX')
      ).rejects.toThrow('Code membre invalide')
    })

    it('lance 403 si le membre appartient à un autre collectif', async () => {
      mockedModel.findByToken.mockResolvedValue(validInvitation as any)
      mockedMembreModel.findByCodeMembre.mockResolvedValue({
        idMembre: 7,
        idCollectif: 99,
      } as any)

      await expect(
        tournamentInvitationService.acceptAsMembre('valid', 'SLM-ABC123')
      ).rejects.toThrow("Ce code membre n'appartient pas au collectif organisateur")
    })

    it('passe le statut à EXPIRE après le dernier usage autorisé', async () => {
      const inv = { ...validInvitation, maxUsages: 2, usagesCount: 1 }
      mockedModel.findByToken.mockResolvedValue(inv as any)
      mockedMembreModel.findByCodeMembre.mockResolvedValue({
        idMembre: 7,
        idCollectif: 42,
      } as any)
      mockedParticipantService.registerMembre.mockResolvedValue({} as any)
      mockedModel.update.mockResolvedValue({} as any)

      await tournamentInvitationService.acceptAsMembre('valid', 'SLM-ABC123')

      expect(mockedModel.update).toHaveBeenCalledWith(1, { statut: 'EXPIRE' })
      expect(mockedModel.incrementUsages).not.toHaveBeenCalled()
    })
  })

  describe('acceptAsGuest', () => {
    const validInvitation = {
      idTournamentInvitation: 1,
      token: 'valid',
      statut: 'ACTIF',
      expireLe: new Date(Date.now() + 86400 * 1000),
      maxUsages: null,
      usagesCount: 0,
      tournoi: {
        idTournoi: 10,
        idCollectif: 42,
        nomTournoi: 'Slam Cup',
        collectif: { nomCollectif: 'Slam Corp' },
      },
    }

    it('crée le guest et inscrit via participantService', async () => {
      mockedModel.findByToken.mockResolvedValue(validInvitation as any)
      mockedParticipantService.registerGuest.mockResolvedValue({
        message: 'Guest inscrit au tournoi avec succès',
        participant: { idParticipant: 2 },
      } as any)
      mockedModel.incrementUsages.mockResolvedValue({} as any)

      const result = await tournamentInvitationService.acceptAsGuest('valid', 'newpseudo')

      expect(mockedParticipantService.registerGuest).toHaveBeenCalledWith(10, { pseudo: 'newpseudo' })
      expect(result.participant.idParticipant).toBe(2)
    })

    it('propage l\'erreur "déjà inscrit" depuis participantService', async () => {
      mockedModel.findByToken.mockResolvedValue(validInvitation as any)
      mockedParticipantService.registerGuest.mockRejectedValue(
        new Error('Ce guest est déjà inscrit à ce tournoi')
      )

      await expect(
        tournamentInvitationService.acceptAsGuest('valid', 'taken')
      ).rejects.toThrow('Ce guest est déjà inscrit à ce tournoi')
    })
  })

  describe('revoke', () => {
    it('révoque une invitation appartenant au bon tournoi/collectif', async () => {
      mockedTournoiModel.findById.mockResolvedValue({ idTournoi: 1, idCollectif: 42 } as any)
      mockedModel.findById.mockResolvedValue({
        idTournamentInvitation: 5,
        idTournoi: 1,
      } as any)
      mockedModel.update.mockResolvedValue({ statut: 'REVOQUE' } as any)

      const result = await tournamentInvitationService.revoke(5, 1, 42)
      expect(result).toEqual({ statut: 'REVOQUE' })
      expect(mockedModel.update).toHaveBeenCalledWith(5, { statut: 'REVOQUE' })
    })

    it('lance 404 si invitation inconnue', async () => {
      mockedTournoiModel.findById.mockResolvedValue({ idTournoi: 1, idCollectif: 42 } as any)
      mockedModel.findById.mockResolvedValue(null)

      await expect(tournamentInvitationService.revoke(99, 1, 42)).rejects.toThrow(
        'Invitation non trouvée'
      )
    })

    it('lance 403 si l\'invitation n\'appartient pas au tournoi', async () => {
      mockedTournoiModel.findById.mockResolvedValue({ idTournoi: 1, idCollectif: 42 } as any)
      mockedModel.findById.mockResolvedValue({
        idTournamentInvitation: 5,
        idTournoi: 99,
      } as any)

      await expect(tournamentInvitationService.revoke(5, 1, 42)).rejects.toThrow(
        "Cette invitation n'appartient pas à ce tournoi"
      )
    })
  })
})
