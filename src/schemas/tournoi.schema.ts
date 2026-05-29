import { z } from 'zod';

export const createTournoiSchema = z.object({
  LieuTournoi: z.string().min(1, 'Le lieu du tournoi est requis'),
  dateTournoi: z.string().or(z.date()).refine((val) => {
    if (typeof val === 'string') {
      return !isNaN(new Date(val).getTime());
    }
    return true;
  }, 'Date du tournoi invalide'),
  heureTournoi: z.string().min(1, 'L\'heure du tournoi est requise'),
  nomTournoi: z.string().min(1, 'Le nom du tournoi est requis'),
  nbJury: z.number().int().positive('Le nombre de jury doit être positif'),
  afficheTournoi: z.string().optional(),
});

export const updateTournoiSchema = z.object({
  LieuTournoi: z.string().min(1, 'Le lieu du tournoi est requis').optional(),
  dateTournoi: z.string().or(z.date()).optional(),
  heureTournoi: z.string().min(1, 'L\'heure du tournoi est requise').optional(),
  nomTournoi: z.string().min(1, 'Le nom du tournoi est requis').optional(),
  nbJury: z.number().int().positive('Le nombre de jury doit être positif').optional(),
  afficheTournoi: z.string().optional(),
});

export const tournoiResponseSchema = z.object({
  idTournoi: z.number(),
  LieuTournoi: z.string(),
  dateTournoi: z.date(),
  heureTournoi: z.string(),
  nomTournoi: z.string(),
  nbJury: z.number(),
  afficheTournoi: z.string().nullable(),
  idCollectif: z.number(),
});

export type CreateTournoiInput = z.infer<typeof createTournoiSchema>;
export type UpdateTournoiInput = z.infer<typeof updateTournoiSchema>;