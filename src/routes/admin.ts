import { Router } from 'express';
import { adminService } from '../services/adminService.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);

// Statistiques globales
router.get('/stats', async (_req: AuthRequest, res) => {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur /admin/stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Liste de tous les collectifs
router.get('/collectifs', async (_req: AuthRequest, res) => {
  try {
    const collectifs = await adminService.listCollectifs();
    res.json(collectifs);
  } catch (error) {
    console.error('Erreur /admin/collectifs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des collectifs' });
  }
});

// Suspendre / réactiver un collectif
router.patch('/collectifs/:id/active', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { active } = req.body;

  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'Le champ "active" (booléen) est requis' });
  }

  try {
    const updated = await adminService.toggleActive(Number(id), active);
    res.json(updated);
  } catch (error) {
    console.error('Erreur /admin/collectifs/:id/active:', error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else if (error instanceof Error && error.message.includes('administrateur')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du collectif' });
    }
  }
});

// Supprimer un collectif
router.delete('/collectifs/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const result = await adminService.deleteCollectif(Number(id));
    res.json(result);
  } catch (error) {
    console.error('Erreur DELETE /admin/collectifs/:id:', error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else if (error instanceof Error && error.message.includes('administrateur')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression du collectif' });
    }
  }
});

export default router;
