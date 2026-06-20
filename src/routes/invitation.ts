import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { invitationService } from '../services/invitationService.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { supabase, STORAGE_BUCKET, STORAGE_FOLDER } from '../config/supabase.js';

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

authRouter.post('/invitations', authMiddleware, async (req: AuthRequest, res) => {
  const { dureeJours, maxUsages } = req.body;

  if (dureeJours !== undefined && (typeof dureeJours !== 'number' || dureeJours <= 0)) {
    return res.status(400).json({ error: 'Durée invalide (entier positif attendu)' });
  }

  if (maxUsages !== undefined && maxUsages !== null && (typeof maxUsages !== 'number' || maxUsages <= 0)) {
    return res.status(400).json({ error: 'Nombre d\'usages invalide (entier positif ou null attendu)' });
  }

  try {
    const invitation = await invitationService.createInvitation(req.userId!, {
      dureeJours,
      maxUsages: maxUsages ?? null,
    });

    res.status(201).json(invitation);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes('non trouvé')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Erreur lors de la création de l\'invitation' });
    }
  }
});

authRouter.get('/invitations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const invitations = await invitationService.listByCollectif(req.userId!);
    res.json(invitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des invitations' });
  }
});

authRouter.delete('/invitations/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const result = await invitationService.revoke(Number(id), req.userId!);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvée')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('avez pas accès')) {
        return res.status(403).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Erreur lors de la révocation de l\'invitation' });
  }
});

// ====== Routes publiques (préfixe /api) ======

publicRouter.get('/invitations/:token', infoLimiter, async (req, res) => {
  const token = String(req.params.token);

  try {
    const invitation = await invitationService.getByToken(token);
    res.json({
      nomCollectif: invitation.collectif.nomCollectif,
      ville: invitation.collectif.ville,
      photoCollectif: invitation.collectif.photoCollectif,
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

publicRouter.post(
  '/invitations/:token/accept',
  acceptLimiter,
  upload.single('photo'),
  async (req, res) => {
    const token = String(req.params.token);
    const { nomMembre, prenomMembre, pseudoMembre, emailMembre, dateNaissance, adresse } = req.body;

    if (!nomMembre || !prenomMembre || !pseudoMembre || !emailMembre || !dateNaissance || !adresse) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    try {
      let photoUrl: string | undefined;

      if (req.file) {
        const file = req.file;
        const fileName = `membre-invite-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`;
        const filePath = `${STORAGE_FOLDER}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (uploadError) {
          console.error('Erreur upload Supabase:', uploadError);
          return res.status(500).json({ error: 'Erreur lors de l\'upload de la photo' });
        }

        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        photoUrl = urlData.publicUrl;
      }

      const membre = await invitationService.accept(
        token,
        {
          nomMembre,
          prenomMembre,
          pseudoMembre,
          emailMembre,
          dateNaissance: new Date(dateNaissance),
          adresse,
        },
        photoUrl,
      );

      res.status(201).json(membre);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        if (error.message.includes('invalide') ||
            error.message.includes('expirée') ||
            error.message.includes('révoquée')) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('déjà utilisé')) {
          return res.status(409).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
  },
);

export const invitationRoutes = authRouter;
export const invitationPublicRoutes = publicRouter;
export default authRouter;
