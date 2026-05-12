import { Router } from 'express';
import { tournoiService } from '../services/tournoiService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Créer un tournoi (protégé par JWT - seul le collectif peut créer des tournois)
router.post('/tournois', authMiddleware, async (req: AuthRequest, res) => {
  const { LieuTournoi, dateTournoi, heureTournoi, nomTournoi, nbJury, afficheTournoi } = req.body;

  if (!LieuTournoi || !dateTournoi || !heureTournoi || !nomTournoi || !nbJury) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }

  try {
    const result = await tournoiService.create({
      LieuTournoi,
      dateTournoi: new Date(dateTournoi),
      heureTournoi,
      nomTournoi,
      nbJury,
      afficheTournoi,
      idCollectif: req.userId!,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création du tournoi' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de la création du tournoi' });
    }
  }
});

// Récupérer tous les tournois du collectif connecté (protégé par JWT)
router.get('/tournois', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const tournois = await tournoiService.getByCollectif(req.userId!);
    res.json(tournois);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des tournois' });
    }
  }
});

// Récupérer tous les tournois (public - pour les poètes qui veulent voir les tournois disponibles)
router.get('/tournois/all', async (req, res) => {
  try {
    const tournois = await tournoiService.getAll();
    res.json(tournois);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tournois' });
  }
});

// Récupérer un tournoi par ID (public)
router.get('/tournois/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tournoi = await tournoiService.getById(Number(id));
    res.json(tournoi);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération du tournoi' });
    }
  }
});

// Mettre à jour un tournoi (protégé par JWT)
router.put('/tournois/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { LieuTournoi, dateTournoi, heureTournoi, nomTournoi, nbJury, afficheTournoi } = req.body;

  try {
    const tournoi = await tournoiService.getById(Number(id));

    if (tournoi.idCollectif !== req.userId) {
      return res.status(403).json({ error: 'Vous n\'avez pas accès à ce tournoi' });
    }

    const updatedTournoi = await tournoiService.update(Number(id), {
      LieuTournoi,
      dateTournoi: dateTournoi ? new Date(dateTournoi) : undefined,
      heureTournoi,
      nomTournoi,
      nbJury,
      afficheTournoi,
    });

    res.json(updatedTournoi);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du tournoi' });
    }
  }
});

// Supprimer un tournoi (protégé par JWT)
router.delete('/tournois/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const tournoi = await tournoiService.getById(Number(id));

    if (tournoi.idCollectif !== req.userId) {
      return res.status(403).json({ error: 'Vous n\'avez pas accès à ce tournoi' });
    }

    const result = await tournoiService.delete(Number(id));

    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression du tournoi' });
    }
  }
});

export default router;
