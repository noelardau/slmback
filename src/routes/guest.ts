import { Router } from 'express';
import { guestService } from '../services/guestService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Créer un guest (protégé par JWT - pour l'admin/collectif)
router.post('/guests', authMiddleware, async (req: AuthRequest, res) => {
  const { nomGuest, prenomGuest, emailGuest, telephone } = req.body;

  if (!nomGuest || !prenomGuest || !emailGuest) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }

  try {
    const result = await guestService.create({
      nomGuest,
      prenomGuest,
      emailGuest,
      telephone,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('existe déjà')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création du guest' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de la création du guest' });
    }
  }
});

// Récupérer tous les guests (protégé par JWT)
router.get('/guests', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const guests = await guestService.getAll();
    res.json(guests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des guests' });
  }
});

// Récupérer un guest par ID (protégé par JWT)
router.get('/guests/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const guest = await guestService.getById(Number(id));
    res.json(guest);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération du guest' });
    }
  }
});

// Mettre à jour un guest (protégé par JWT)
router.put('/guests/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { nomGuest, prenomGuest, emailGuest, telephone } = req.body;

  try {
    const updatedGuest = await guestService.update(Number(id), {
      nomGuest,
      prenomGuest,
      emailGuest,
      telephone,
    });

    res.json(updatedGuest);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du guest' });
    }
  }
});

// Supprimer un guest (protégé par JWT)
router.delete('/guests/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const result = await guestService.delete(Number(id));
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression du guest' });
    }
  }
});

export default router;
