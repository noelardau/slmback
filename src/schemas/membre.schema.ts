import { z } from 'zod';

export const createMembreSchema = z.object({
  nomMembre: z.string().min(1, 'Le nom du membre est requis'),
  prenomMembre: z.string().min(1, 'Le prénom du membre est requis'),
  photoMembre: z.string().optional(),
  dateNaissance: z.string().or(z.date()).refine((val) => {
    if (typeof val === 'string') {
      return !isNaN(new Date(val).getTime());
    }
    return true;
  }, 'Date de naissance invalide'),
  adresse: z.string().min(1, 'L\'adresse est requise'),
});

export const updateMembreSchema = z.object({
  nomMembre: z.string().min(1, 'Le nom du membre est requis').optional(),
  prenomMembre: z.string().min(1, 'Le prénom du membre est requis').optional(),
  photoMembre: z.string().optional(),
  dateNaissance: z.string().or(z.date()).optional(),
  adresse: z.string().min(1, 'L\'adresse est requise').optional(),
});

export const membreResponseSchema = z.object({
  idMembre: z.number(),
  nomMembre: z.string(),
  prenomMembre: z.string(),
  photoMembre: z.string().nullable(),
  dateNaissance: z.date(),
  adresse: z.string(),
  idCollectif: z.number(),
});

export type CreateMembreInput = z.infer<typeof createMembreSchema>;
export type UpdateMembreInput = z.infer<typeof updateMembreSchema>;