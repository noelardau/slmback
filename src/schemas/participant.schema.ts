import { z } from 'zod';

export const createGuestParticipantSchema = z.object({
  nomGuest: z.string().min(1, 'Le nom du guest est requis'),
  prenomGuest: z.string().min(1, 'Le prénom du guest est requis'),
  emailGuest: z.string().email('Email invalide'),
  telephone: z.string().optional(),
});

export const participantResponseSchema = z.object({
  idParticipant: z.number(),
  idMembre: z.number().nullable(),
  idTournoi: z.number(),
  idGuest: z.number().nullable(),
});

export const participantWithDetailsSchema = z.object({
  idParticipant: z.number(),
  idMembre: z.number().nullable(),
  idTournoi: z.number(),
  idGuest: z.number().nullable(),
  membre: z.object({
    idMembre: z.number(),
    nomMembre: z.string(),
    prenomMembre: z.string(),
    photoMembre: z.string().nullable(),
  }).nullable().optional(),
  guest: z.object({
    idGuest: z.number(),
    nomGuest: z.string(),
    prenomGuest: z.string(),
    emailGuest: z.string(),
  }).nullable().optional(),
  tournoi: z.object({
    idTournoi: z.number(),
    nomTournoi: z.string(),
    dateTournoi: z.date(),
    heureTournoi: z.string(),
    LieuTournoi: z.string(),
  }).optional(),
});

export type CreateGuestParticipantInput = z.infer<typeof createGuestParticipantSchema>;