import { z } from 'zod';

export const createGuestSchema = z.object({
  nomGuest: z.string().min(1, 'Le nom du guest est requis'),
  prenomGuest: z.string().min(1, 'Le prénom du guest est requis'),
  emailGuest: z.string().email('Email invalide'),
  telephone: z.string().optional(),
});

export const updateGuestSchema = z.object({
  nomGuest: z.string().min(1, 'Le nom du guest est requis').optional(),
  prenomGuest: z.string().min(1, 'Le prénom du guest est requis').optional(),
  emailGuest: z.string().email('Email invalide').optional(),
  telephone: z.string().optional(),
});

export const guestResponseSchema = z.object({
  idGuest: z.number(),
  nomGuest: z.string(),
  prenomGuest: z.string(),
  emailGuest: z.string(),
  telephone: z.string().nullable(),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;