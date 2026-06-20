import prisma from '../prisma.js';

export type TournamentInvitationStatut = 'ACTIF' | 'EXPIRE' | 'REVOQUE';

export interface TournamentInvitation {
  idTournamentInvitation: number;
  token: string;
  idTournoi: number;
  statut: string;
  maxUsages: number | null;
  usagesCount: number;
  expireLe: Date;
  createdAt: Date;
}

export interface TournamentInvitationCreateData {
  token: string;
  idTournoi: number;
  maxUsages?: number | null;
  expireLe: Date;
}

export interface TournamentInvitationUpdateData {
  statut?: string;
  maxUsages?: number | null;
  expireLe?: Date;
}

export const tournamentInvitationModel = {
  async create(data: TournamentInvitationCreateData) {
    return await prisma.tournament_invitation.create({
      data,
    });
  },

  async findByToken(token: string) {
    return await prisma.tournament_invitation.findUnique({
      where: { token },
      include: {
        tournoi: {
          select: {
            idTournoi: true,
            nomTournoi: true,
            LieuTournoi: true,
            dateTournoi: true,
            heureTournoi: true,
            idCollectif: true,
            collectif: {
              select: {
                idCollectif: true,
                nomCollectif: true,
                ville: true,
              },
            },
          },
        },
      },
    });
  },

  async findById(id: number) {
    return await prisma.tournament_invitation.findUnique({
      where: { idTournamentInvitation: id },
    });
  },

  async findByTournoi(idTournoi: number) {
    return await prisma.tournament_invitation.findMany({
      where: { idTournoi },
      orderBy: { createdAt: 'desc' },
    });
  },

  async incrementUsages(id: number) {
    return await prisma.tournament_invitation.update({
      where: { idTournamentInvitation: id },
      data: { usagesCount: { increment: 1 } },
    });
  },

  async update(id: number, data: TournamentInvitationUpdateData) {
    return await prisma.tournament_invitation.update({
      where: { idTournamentInvitation: id },
      data,
    });
  },

  async delete(id: number) {
    return await prisma.tournament_invitation.delete({
      where: { idTournamentInvitation: id },
    });
  },
};
