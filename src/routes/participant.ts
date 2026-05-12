import { Router } from 'express';
import { participantService } from '../services/participantService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Inscrire un membre à un tournoi (protégé par JWT - le membre doit être connecté)
router.post('/tournois/:idTournoi/participants', authMiddleware, async (req: AuthRequest, res) => {
  const { idTournoi } = req.params;

  try {
    const result = await participantService.registerMembre(Number(idTournoi), req.userId!);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('déjà inscrit')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de l\'inscription au tournoi' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de l\'inscription au tournoi' });
    }
  }
});

// Inscrire un guest à un tournoi (protégé par JWT - pour l'admin/collectif)
router.post('/tournois/:idTournoi/guests', authMiddleware, async (req: AuthRequest, res) => {
  const { idTournoi } = req.params;
  const { nomGuest, prenomGuest, emailGuest, telephone } = req.body;

  if (!nomGuest || !prenomGuest || !emailGuest) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }

  try {
    const result = await participantService.registerGuest(Number(idTournoi), {
      nomGuest,
      prenomGuest,
      emailGuest,
      telephone,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('déjà inscrit')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de l\'inscription au tournoi' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de l\'inscription au tournoi' });
    }
  }
});

// Récupérer tous les participants d'un tournoi (public)
router.get('/tournois/:idTournoi/participants', async (req, res) => {
  const { idTournoi } = req.params;

  try {
    const participants = await participantService.getByTournoi(Number(idTournoi));
    res.json(participants);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des participants' });
    }
  }
});

// Récupérer tous les tournois auxquels un membre est inscrit (protégé par JWT)
router.get('/membre/tournois', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const tournois = await participantService.getByMembre(req.userId!);
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

// Récupérer tous les tournois auxquels un guest est inscrit (public)
router.get('/guests/:idGuest/tournois', async (req, res) => {
  const { idGuest } = req.params;

  try {
    const tournois = await participantService.getByGuest(Number(idGuest));
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

// Désinscrire un membre d'un tournoi (protégé par JWT)
router.delete('/tournois/:idTournoi/participants', authMiddleware, async (req: AuthRequest, res) => {
  const { idTournoi } = req.params;

  try {
    const result = await participantService.unregisterMembre(Number(idTournoi), req.userId!);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la désinscription' });
    }
  }
});

// Désinscrire un guest d'un tournoi (protégé par JWT)
router.delete('/tournois/:idTournoi/guests/:idGuest', authMiddleware, async (req: AuthRequest, res) => {
  const { idTournoi, idGuest } = req.params;

  try {
    const result = await participantService.unregisterGuest(Number(idTournoi), Number(idGuest));
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la désinscription' });
    }
  }
});

export default router;
