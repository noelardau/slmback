import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { tournamentInvitationService } from '../services/tournamentInvitationService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const authRouter = Router();
const publicRouter = Router();

const acceptLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessayez plus tard' },
});

const infoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessayez plus tard' },
});

// ====== Routes authentifiées (préfixe /collectif) ======

authRouter.post('/tournois/:idTournoi/invitations', authMiddleware, async (req: AuthRequest, res) => {
  const idTournoi = Number(req.params.idTournoi);
  const { dureeJours, maxUsages } = req.body;

  if (dureeJours !== undefined && (typeof dureeJours !== 'number' || dureeJours <= 0)) {
    return res.status(400).json({ error: 'Durée invalide (entier positif attendu)' });
  }

  if (maxUsages !== undefined && maxUsages !== null && (typeof maxUsages !== 'number' || maxUsages <= 0)) {
    return res.status(400).json({ error: 'Nombre d\'usages invalide (entier positif ou null attendu)' });
  }

  try {
    const invitation = await tournamentInvitationService.createInvitation(idTournoi, req.userId!, {
      dureeJours,
      maxUsages: maxUsages ?? null,
    });

    res.status(201).json(invitation);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('avez pas accès')) {
        return res.status(403).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Erreur lors de la création de l\'invitation' });
  }
});

authRouter.get('/tournois/:idTournoi/invitations', authMiddleware, async (req: AuthRequest, res) => {
  const idTournoi = Number(req.params.idTournoi);

  try {
    const invitations = await tournamentInvitationService.listByTournoi(idTournoi, req.userId!);
    res.json(invitations);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('avez pas accès')) {
        return res.status(403).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Erreur lors de la récupération des invitations' });
  }
});

authRouter.delete('/tournois/:idTournoi/invitations/:idInvitation', authMiddleware, async (req: AuthRequest, res) => {
  const idTournoi = Number(req.params.idTournoi);
  const idInvitation = Number(req.params.idInvitation);

  try {
    const result = await tournamentInvitationService.revoke(idInvitation, idTournoi, req.userId!);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvée') || error.message.includes('non trouvé')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('avez pas accès') || error.message.includes('n\'appartient pas')) {
        return res.status(403).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Erreur lors de la révocation de l\'invitation' });
  }
});

// ====== Routes publiques (préfixe /api) ======

publicRouter.get('/tournament-invitations/:token', infoLimiter, async (req, res) => {
  const token = String(req.params.token);

  try {
    const invitation = await tournamentInvitationService.getByToken(token);
    res.json({
      nomTournoi: invitation.tournoi.nomTournoi,
      LieuTournoi: invitation.tournoi.LieuTournoi,
      dateTournoi: invitation.tournoi.dateTournoi,
      heureTournoi: invitation.tournoi.heureTournoi,
      nomCollectif: invitation.tournoi.collectif.nomCollectif,
      ville: invitation.tournoi.collectif.ville,
      expireLe: invitation.expireLe,
      usagesCount: invitation.usagesCount,
      maxUsages: invitation.maxUsages,
    });
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('invalide') ||
      error.message.includes('expirée') ||
      error.message.includes('révoquée')
    )) {
      return res.status(404).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'invitation' });
  }
});

publicRouter.post('/tournament-invitations/:token/accept/membre', acceptLimiter, async (req, res) => {
  const token = String(req.params.token);
  const { codeMembre } = req.body;

  if (!codeMembre || typeof codeMembre !== 'string') {
    return res.status(400).json({ error: 'Code membre requis' });
  }

  try {
    const result = await tournamentInvitationService.acceptAsMembre(token, codeMembre);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('invalide') ||
          error.message.includes('expirée') ||
          error.message.includes('révoquée') ||
          error.message.includes('Code membre invalide')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('n\'appartient pas')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('déjà inscrit')) {
        return res.status(409).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

publicRouter.post('/tournament-invitations/:token/accept/guest', acceptLimiter, async (req, res) => {
  const token = String(req.params.token);
  const { pseudo } = req.body;

  if (!pseudo || typeof pseudo !== 'string' || pseudo.trim() === '') {
    return res.status(400).json({ error: 'Pseudo requis' });
  }

  try {
    const result = await tournamentInvitationService.acceptAsGuest(token, pseudo.trim());
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('invalide') ||
          error.message.includes('expirée') ||
          error.message.includes('révoquée')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('déjà inscrit')) {
        return res.status(409).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

export const tournamentInvitationRoutes = authRouter;
export const tournamentInvitationPublicRoutes = publicRouter;
export default authRouter;
