import { z } from 'zod';

export const registerSchema = z.object({
  nomCollectif: z.string().min(1, 'Le nom du collectif est requis'),
  ville: z.string().min(1, 'La ville est requise'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  photoCollectif: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const updateProfileSchema = z.object({
  nomCollectif: z.string().min(1, 'Le nom du collectif est requis').optional(),
  ville: z.string().min(1, 'La ville est requise').optional(),
  email: z.string().email('Email invalide').optional(),
  photoCollectif: z.string().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
});

export const collectifResponseSchema = z.object({
  idCollectif: z.number(),
  nomCollectif: z.string(),
  ville: z.string(),
  email: z.string(),
  photoCollectif: z.string().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;