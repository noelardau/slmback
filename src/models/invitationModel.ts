import prisma from '../prisma.js';

export type InvitationStatut = 'ACTIF' | 'EXPIRE' | 'REVOQUE';

export interface Invitation {
  idInvitation: number;
  token: string;
  idCollectif: number;
  statut: string;
  maxUsages: number | null;
  usagesCount: number;
  expireLe: Date;
  createdAt: Date;
}

export interface InvitationCreateData {
  token: string;
  idCollectif: number;
  maxUsages?: number | null;
  expireLe: Date;
}

export interface InvitationUpdateData {
  statut?: string;
  maxUsages?: number | null;
  expireLe?: Date;
}

export const invitationModel = {
  async create(data: InvitationCreateData) {
    return await prisma.invitation.create({
      data,
    });
  },

  async findByToken(token: string) {
    return await prisma.invitation.findUnique({
      where: { token },
      include: {
        collectif: {
          select: {
            idCollectif: true,
            nomCollectif: true,
            ville: true,
            photoCollectif: true,
          },
        },
      },
    });
  },

  async findById(id: number) {
    return await prisma.invitation.findUnique({
      where: { idInvitation: id },
    });
  },

  async findByCollectif(idCollectif: number) {
    return await prisma.invitation.findMany({
      where: { idCollectif },
      orderBy: { createdAt: 'desc' },
    });
  },

  async incrementUsages(id: number) {
    return await prisma.invitation.update({
      where: { idInvitation: id },
      data: { usagesCount: { increment: 1 } },
    });
  },

  async update(id: number, data: InvitationUpdateData) {
    return await prisma.invitation.update({
      where: { idInvitation: id },
      data,
    });
  },

  async delete(id: number) {
    return await prisma.invitation.delete({
      where: { idInvitation: id },
    });
  },
};
