import { Router } from 'express';
import { penaliteService } from '../services/penaliteService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Créer plusieurs pénalités en une seule requête (protégé par JWT)
router.post('/performances/:idPerfo/penalites/bulk', authMiddleware, async (req: AuthRequest, res) => {
  const { idPerfo } = req.params;
  const { penalites } = req.body;

  if (!Array.isArray(penalites) || penalites.length === 0) {
    return res.status(400).json({ error: 'Les pénalités doivent être un tableau non vide' });
  }

  for (const penalite of penalites) {
    if (penalite.valeur === undefined || penalite.valeur === null) {
      return res.status(400).json({ error: 'Toutes les pénalités doivent avoir une valeur' });
    }
    if (typeof penalite.valeur !== 'number' || penalite.valeur < 0) {
      return res.status(400).json({ error: 'Les pénalités doivent être des nombres positifs' });
    }
  }

  try {
    const createdPenalites = await penaliteService.createBulk(Number(idPerfo), penalites);
    res.status(201).json(createdPenalites);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvée')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création des pénalités' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de la création des pénalités' });
    }
  }
});

// Créer une pénalité (protégé par JWT)
router.post('/performances/:idPerfo/penalites', authMiddleware, async (req: AuthRequest, res) => {
  const { idPerfo } = req.params;
  const { valeur } = req.body;

  if (valeur === undefined || valeur === null) {
    return res.status(400).json({ error: 'La valeur de la pénalité est requise' });
  }

  if (typeof valeur !== 'number' || valeur < 0) {
    return res.status(400).json({ error: 'La valeur doit être un nombre positif' });
  }

  try {
    const result = await penaliteService.create({
      idPerfo: Number(idPerfo),
      valeur: Number(valeur),
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvée')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création de la pénalité' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de la création de la pénalité' });
    }
  }
});

// Récupérer toutes les pénalités d'une performance (public)
router.get('/performances/:idPerfo/penalites', async (req, res) => {
  const { idPerfo } = req.params;

  try {
    const penalites = await penaliteService.getByPerformance(Number(idPerfo));
    res.json(penalites);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des pénalités' });
    }
  }
});

// Récupérer une pénalité par ID (public)
router.get('/penalites/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const penalite = await penaliteService.getById(Number(id));
    res.json(penalite);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération de la pénalité' });
    }
  }
});

// Mettre à jour une pénalité (protégé par JWT)
router.put('/penalites/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { valeur } = req.body;

  if (valeur !== undefined && valeur !== null) {
    if (typeof valeur !== 'number' || valeur < 0) {
      return res.status(400).json({ error: 'La valeur doit être un nombre positif' });
    }
  }

  try {
    const updatedPenalite = await penaliteService.update(Number(id), {
      valeur: valeur !== undefined ? Number(valeur) : undefined,
    });

    res.json(updatedPenalite);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la pénalité' });
    }
  }
});

// Supprimer une pénalité (protégé par JWT)
router.delete('/penalites/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const result = await penaliteService.delete(Number(id));
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression de la pénalité' });
    }
  }
});

export default router;