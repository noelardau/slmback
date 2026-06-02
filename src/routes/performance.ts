import { Router } from 'express';
import { performanceService } from '../services/performanceService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Créer une performance (protégé par JWT)
router.post('/tournois/:idTournoi/performances', authMiddleware, async (req: AuthRequest, res) => {
  const { idTournoi } = req.params;
  const { idMembre, idGuest, duree, noteFinale, etat } = req.body;

  if (!idMembre && !idGuest) {
    return res.status(400).json({ error: 'Une performance doit être liée à un membre ou un invité' });
  }

  if (idMembre && idGuest) {
    return res.status(400).json({ error: 'Une performance ne peut être liée qu\'à un seul participant' });
  }

  try {
    const result = await performanceService.create({
      idTournoi: Number(idTournoi),
      idMembre: idMembre ? Number(idMembre) : undefined,
      idGuest: idGuest ? Number(idGuest) : undefined,
      duree: duree || '00:00',
      noteFinale: noteFinale ? Number(noteFinale) : undefined,
      etat: etat || 'prêt',
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création de la performance' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de la création de la performance' });
    }
  }
});

// Récupérer toutes les performances d'un tournoi (public)
router.get('/tournois/:idTournoi/performances', async (req, res) => {
  const { idTournoi } = req.params;

  try {
    const performances = await performanceService.getByTournoi(Number(idTournoi));
    res.json(performances);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des performances' });
    }
  }
});

// Récupérer une performance par ID (public)
router.get('/performances/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const performance = await performanceService.getById(Number(id));
    res.json(performance);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération de la performance' });
    }
  }
});

// Récupérer les performances d'un membre (protégé par JWT)
router.get('/membres/:idMembre/performances', authMiddleware, async (req: AuthRequest, res) => {
  const { idMembre } = req.params;

  try {
    const performances = await performanceService.getByMembre(Number(idMembre));
    res.json(performances);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des performances' });
    }
  }
});

// Récupérer les performances d'un invité (public)
router.get('/guests/:idGuest/performances', async (req, res) => {
  const { idGuest } = req.params;

  try {
    const performances = await performanceService.getByGuest(Number(idGuest));
    res.json(performances);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des performances' });
    }
  }
});

// Mettre à jour une performance (protégé par JWT)
router.put('/performances/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { duree, noteFinale, etat } = req.body;

  try {
    const updatedPerformance = await performanceService.update(Number(id), {
      duree: duree || undefined,
      noteFinale: noteFinale ? Number(noteFinale) : undefined,
      etat: etat || undefined,
    });

    res.json(updatedPerformance);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la performance' });
    }
  }
});

// Supprimer une performance (protégé par JWT)
router.delete('/performances/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const result = await performanceService.delete(Number(id));
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression de la performance' });
    }
  }
});

export default router;