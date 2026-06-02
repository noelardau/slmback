import { Router } from 'express';
import { noteService } from '../services/noteService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Créer plusieurs notes en une seule requête (protégé par JWT)
router.post('/performances/:idPerfo/notes/bulk', authMiddleware, async (req: AuthRequest, res) => {
  const { idPerfo } = req.params;
  const { notes } = req.body;

  if (!Array.isArray(notes) || notes.length === 0) {
    return res.status(400).json({ error: 'Les notes doivent être un tableau non vide' });
  }

  for (const note of notes) {
    if (note.valeur === undefined || note.valeur === null) {
      return res.status(400).json({ error: 'Toutes les notes doivent avoir une valeur' });
    }
    if (typeof note.valeur !== 'number' || note.valeur < 0 || note.valeur > 10) {
      return res.status(400).json({ error: 'Les notes doivent être des nombres entre 0 et 10' });
    }
  }

  try {
    const createdNotes = await noteService.createBulk(Number(idPerfo), notes);
    res.status(201).json(createdNotes);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvée')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création des notes' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de la création des notes' });
    }
  }
});

// Créer une note (protégé par JWT)
router.post('/performances/:idPerfo/notes', authMiddleware, async (req: AuthRequest, res) => {
  const { idPerfo } = req.params;
  const { valeur, retenu } = req.body;

  if (valeur === undefined || valeur === null) {
    return res.status(400).json({ error: 'La valeur de la note est requise' });
  }

  if (typeof valeur !== 'number' || valeur < 0 || valeur > 10) {
    return res.status(400).json({ error: 'La valeur doit être un nombre entre 0 et 10' });
  }

  try {
    const result = await noteService.create({
      idPerfo: Number(idPerfo),
      valeur: Number(valeur),
      retenu: retenu !== undefined ? Boolean(retenu) : true,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvée')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création de la note' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de la création de la note' });
    }
  }
});

// Récupérer toutes les notes d'une performance (public)
router.get('/performances/:idPerfo/notes', async (req, res) => {
  const { idPerfo } = req.params;

  try {
    const notes = await noteService.getByPerformance(Number(idPerfo));
    res.json(notes);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
    }
  }
});

// Récupérer une note par ID (public)
router.get('/notes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const note = await noteService.getById(Number(id));
    res.json(note);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération de la note' });
    }
  }
});

// Mettre à jour une note (protégé par JWT)
router.put('/notes/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { valeur, retenu } = req.body;

  if (valeur !== undefined && valeur !== null) {
    if (typeof valeur !== 'number' || valeur < 0 || valeur > 10) {
      return res.status(400).json({ error: 'La valeur doit être un nombre entre 0 et 10' });
    }
  }

  try {
    const updatedNote = await noteService.update(Number(id), {
      valeur: valeur !== undefined ? Number(valeur) : undefined,
      retenu: retenu !== undefined ? Boolean(retenu) : undefined,
    });

    res.json(updatedNote);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la note' });
    }
  }
});

// Supprimer une note (protégé par JWT)
router.delete('/notes/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const result = await noteService.delete(Number(id));
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvée')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression de la note' });
    }
  }
});

export default router;