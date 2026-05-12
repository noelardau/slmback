import { Router } from 'express';
import { collectifService } from '../services/collectifService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Inscription
router.post('/register', async (req, res) => {
  const { nomCollectif, ville, email, password, photoCollectif } = req.body;

  if (!nomCollectif || !ville || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }

  try {
    const result = await collectifService.register({
      nomCollectif,
      ville,
      email,
      password,
      photoCollectif,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const result = await collectifService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('Email ou mot de passe incorrect')) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  }
});

// Profil (protégé par JWT)
router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const collectif = await collectifService.getProfile(req.userId!);
    res.json(collectif);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
  }
});

// Mise à jour du profil (protégé par JWT)
router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const { nomCollectif, ville, email, photoCollectif } = req.body;

  try {
    const collectif = await collectifService.updateProfile(req.userId!, {
      nomCollectif,
      ville,
      email,
      photoCollectif,
    });
    res.json(collectif);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
  }
});

// Changement de mot de passe (protégé par JWT)
router.put('/password', authMiddleware, async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
  }

  try {
    const result = await collectifService.updatePassword(req.userId!, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('incorrect')) {
      res.status(401).json({ error: error.message });
    } else if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
    }
  }
});

export default router;
