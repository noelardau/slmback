import { Router } from 'express';
import { tournoiService } from '../services/tournoiService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { supabase, STORAGE_BUCKET, STORAGE_FOLDER } from '../config/supabase.js';

const router = Router();

router.post('/tournoi/:id/affiche', authMiddleware, upload.single('affiche'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const tournoiId = Number(id);

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const tournoi = await tournoiService.getById(tournoiId);

    if (tournoi.idCollectif !== req.userId) {
      return res.status(403).json({ error: 'Vous n\'avez pas accès à ce tournoi' });
    }

    const file = req.file;
    const fileName = `tournoi-${tournoiId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`;
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

    const afficheUrl = urlData.publicUrl;

    const updatedTournoi = await tournoiService.update(tournoiId, {
      afficheTournoi: afficheUrl,
    });

    res.json({
      message: 'Affiche mise à jour avec succès',
      url: afficheUrl,
      tournoi: updatedTournoi,
    });
  } catch (error) {
    console.error('Erreur upload affiche:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'affiche' });
  }
});

router.post('/tournois', authMiddleware, async (req: AuthRequest, res) => {
  const { LieuTournoi, dateTournoi, heureTournoi, nomTournoi, nbJury, afficheTournoi, dureePerfo, tirageAuSort } = req.body;

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
      dureePerfo,
      tirageAuSort: tirageAuSort !== undefined ? tirageAuSort : false,
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
  const { LieuTournoi, dateTournoi, heureTournoi, nomTournoi, nbJury, afficheTournoi, dureePerfo, tirageAuSort } = req.body;
  
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
      dureePerfo,
      tirageAuSort,
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
