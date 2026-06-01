import { Router } from 'express';
import { membreService } from '../services/membreService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { supabase, STORAGE_BUCKET, STORAGE_FOLDER } from '../config/supabase.js';

const router = Router();

router.post('/membre/:id/photo', authMiddleware, upload.single('photo'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const membreId = Number(id);

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const membre = await membreService.getById(membreId);

    if (membre.idCollectif !== req.userId) {
      return res.status(403).json({ error: 'Vous n\'avez pas accès à ce membre' });
    }

    const file = req.file;
    const fileName = `membre-${membreId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`;
    const filePath = `${STORAGE_FOLDER}/${fileName}`;

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

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const photoUrl = urlData.publicUrl;

    const updatedMembre = await membreService.update(membreId, {
      photoMembre: photoUrl,
    });

    res.json({
      message: 'Photo mise à jour avec succès',
      url: photoUrl,
      membre: updatedMembre,
    });
  } catch (error) {
    console.error('Erreur upload photo:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la photo' });
  }
});

router.post('/membres', authMiddleware, async (req: AuthRequest, res) => {
  const { nomMembre, prenomMembre, pseudoMembre, emailMembre, photoMembre, dateNaissance, adresse } = req.body;

  if (!nomMembre || !prenomMembre || !pseudoMembre || !emailMembre || !dateNaissance || !adresse) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }

  try {
    const result = await membreService.create({
      nomMembre,
      prenomMembre,
      pseudoMembre,
      emailMembre,
      photoMembre,
      dateNaissance: new Date(dateNaissance),
      adresse,
      idCollectif: req.userId!,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création du membre' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de la création du membre' });
    }
  }
});

// Récupérer tous les membres du collectif connecté (protégé par JWT)
router.get('/membres', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const membres = await membreService.getByCollectif(req.userId!);
    res.json(membres);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
    }
  }
});

// Récupérer un membre par ID (protégé par JWT)
router.get('/membres/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const membre = await membreService.getById(Number(id));

    if (membre.idCollectif !== req.userId) {
      return res.status(403).json({ error: 'Vous n\'avez pas accès à ce membre' });
    }

    res.json(membre);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération du membre' });
    }
  }
});

// Mettre à jour un membre (protégé par JWT)
router.put('/membres/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { nomMembre, prenomMembre, pseudoMembre, emailMembre, photoMembre, dateNaissance, adresse } = req.body;

  try {
    const membre = await membreService.getById(Number(id));

    if (membre.idCollectif !== req.userId) {
      return res.status(403).json({ error: 'Vous n\'avez pas accès à ce membre' });
    }

    const updatedMembre = await membreService.update(Number(id), {
      nomMembre,
      prenomMembre,
      pseudoMembre,
      emailMembre,
      photoMembre,
      dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
      adresse,
    });

    res.json(updatedMembre);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du membre' });
    }
  }
});

// Supprimer un membre (protégé par JWT)
router.delete('/membres/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const membre = await membreService.getById(Number(id));

    if (membre.idCollectif !== req.userId) {
      return res.status(403).json({ error: 'Vous n\'avez pas accès à ce membre' });
    }

    const result = await membreService.delete(Number(id));

    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression du membre' });
    }
  }
});

export default router;
