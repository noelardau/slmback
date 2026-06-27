import { Router } from 'express';
import { collectifService } from '../services/collectifService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { supabase, STORAGE_BUCKET, STORAGE_FOLDER } from '../config/supabase.js';

const router = Router();

// Upload de photo de collectif (protégé par JWT)
router.post('/photo', authMiddleware, upload.single('photo'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const file = req.file;
    const fileName = `collectif-${req.userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`;
    const filePath = `${STORAGE_FOLDER}/${fileName}`;

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('Erreur upload Supabase:', uploadError);
      return res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const photoUrl = urlData.publicUrl;

    // Mettre à jour la base de données
    const updatedCollectif = await collectifService.updateProfile(req.userId, {
      photoCollectif: photoUrl,
    });

    res.json({
      message: 'Photo mise à jour avec succès',
      url: photoUrl,
      collectif: updatedCollectif,
    });
  } catch (error) {
    console.error('Erreur upload photo:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la photo' });
  }
});

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
    console.error('Erreur /register:', error);
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
    console.error('Erreur /login:', error);
    if (error instanceof Error && error.message.includes('en attente')) {
      res.status(403).json({ error: error.message, code: 'ACCOUNT_PENDING' });
    } else if (error instanceof Error && error.message.includes('Email ou mot de passe incorrect')) {
      res.status(401).json({ error: error.message, code: 'INVALID_CREDENTIALS' });
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
  const { nomCollectif, ville, email, photoCollectif, prefLang, prefTheme } = req.body;

  if (prefLang !== undefined && !['en', 'fr'].includes(prefLang)) {
    return res.status(400).json({ error: 'Langue invalide (valeurs attendues: en, fr)' });
  }

  if (prefTheme !== undefined && !['dark', 'light'].includes(prefTheme)) {
    return res.status(400).json({ error: 'Thème invalide (valeurs attendues: dark, light)' });
  }

  try {
    const collectif = await collectifService.updateProfile(req.userId!, {
      nomCollectif,
      ville,
      email,
      photoCollectif,
      prefLang,
      prefTheme,
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

// Mise à jour des préférences (thème + langue) (protégé par JWT)
router.put('/preferences', authMiddleware, async (req: AuthRequest, res) => {
  const { prefLang, prefTheme } = req.body;

  if (prefLang !== undefined && !['en', 'fr'].includes(prefLang)) {
    return res.status(400).json({ error: 'Langue invalide (valeurs attendues: en, fr)' });
  }

  if (prefTheme !== undefined && !['dark', 'light'].includes(prefTheme)) {
    return res.status(400).json({ error: 'Thème invalide (valeurs attendues: dark, light)' });
  }

  try {
    const collectif = await collectifService.updatePreferences(req.userId!, {
      prefLang,
      prefTheme,
    });
    res.json(collectif);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour des préférences' });
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

// Déconnexion (protégé par JWT)
router.post('/logout', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      await collectifService.logout(req.userId!, token);
    }
    
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});

export default router;
