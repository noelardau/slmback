import { generateUniqueCodeMembre, formatCodeMembre, isValidCodeMembreFormat } from '../src/utils/codeMembre'
import { membreModel } from '../src/models/membreModel'

jest.mock('../src/models/membreModel')

const mockedMembreModel = membreModel as jest.Mocked<typeof membreModel>

describe('codeMembre utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('formatCodeMembre', () => {
    it('ajoute le préfixe SLM-', () => {
      expect(formatCodeMembre('ABC123')).toBe('SLM-ABC123')
    })

    it('garde le préfixe si déjà présent', () => {
      expect(formatCodeMembre('ABC123')).toBe('SLM-ABC123')
    })
  })

  describe('isValidCodeMembreFormat', () => {
    it('valide un code au bon format', () => {
      expect(isValidCodeMembreFormat('SLM-ABC123')).toBe(true)
      expect(isValidCodeMembreFormat('SLM-7K3M9P')).toBe(true)
    })

    it('rejette un code sans préfixe', () => {
      expect(isValidCodeMembreFormat('ABC123')).toBe(false)
    })

    it('rejette un code avec caractères ambigus (0, 1, I, L, O)', () => {
      expect(isValidCodeMembreFormat('SLM-ABC10I')).toBe(false)
      expect(isValidCodeMembreFormat('SLM-OOPPL')).toBe(false)
    })

    it('rejette un code trop court ou trop long', () => {
      expect(isValidCodeMembreFormat('SLM-ABC')).toBe(false)
      expect(isValidCodeMembreFormat('SLM-ABCDEFGH')).toBe(false)
    })

    it('rejette un code en minuscules', () => {
      expect(isValidCodeMembreFormat('slm-abc123')).toBe(false)
    })
  })

  describe('generateUniqueCodeMembre', () => {
    it('génère un code au format SLM-XXXXXX', async () => {
      mockedMembreModel.findByCodeMembre.mockResolvedValue(null)

      const code = await generateUniqueCodeMembre()

      expect(code).toMatch(/^SLM-[A-Z2-9]{6}$/)
    })

    it('ne contient jamais de caractères ambigus', async () => {
      mockedMembreModel.findByCodeMembre.mockResolvedValue(null)

      for (let i = 0; i < 50; i++) {
        const code = await generateUniqueCodeMembre()
        expect(code).not.toMatch(/[01ILO]/)
      }
    })

    it('retry si collision détectée', async () => {
      mockedMembreModel.findByCodeMembre
        .mockResolvedValueOnce({ idMembre: 1 } as any)
        .mockResolvedValueOnce(null)

      const code = await generateUniqueCodeMembre()

      expect(code).toMatch(/^SLM-[A-Z2-9]{6}$/)
      expect(mockedMembreModel.findByCodeMembre).toHaveBeenCalledTimes(2)
    })

    it('lance après MAX_RETRIES collisions', async () => {
      mockedMembreModel.findByCodeMembre.mockResolvedValue({ idMembre: 1 } as any)

      await expect(generateUniqueCodeMembre()).rejects.toThrow(
        'Impossible de générer un code membre unique après plusieurs tentatives'
      )
    })
  })
})
