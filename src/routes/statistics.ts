import { Router } from 'express';
import { statisticsService } from '../services/statisticsService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ==========================================
// STATISTIQUES PAR PARTICIPANT DANS UN TOURNOI (PUBLIQUES)
// ==========================================

/**
 * GET /api/tournois/:idTournoi/statistiques/participants
 * Obtenir les stats de TOUS les participants d'un tournoi
 * Access: PUBLIC
 * OPTIMISÉ: Requête groupée
 */
router.get('/tournois/:idTournoi/statistiques/participants', async (req, res) => {
  try {
    const { idTournoi } = req.params;
    const stats = await statisticsService.getAllParticipantsTournamentStats(Number(idTournoi));
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du tournoi:', error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
  }
});

// ==========================================
// STATISTIQUES GLOBALES POUR MEMBRES (PROTECTED)
// ==========================================

/**
 * GET /api/membres/:idMembre/statistiques
 * Obtenir les stats globales d'un membre
 * Access: PROTECTED
 */
router.get('/membres/:idMembre/statistiques', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { idMembre } = req.params;
    const stats = await statisticsService.getMemberGlobalStats(Number(idMembre));
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques globales:', error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
      }
    } else {
      res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
  }
});

export default router;