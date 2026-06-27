import prisma from '../prisma.js';
import { collectifModel } from '../models/collectifModel.js';

export interface AdminStats {
  nbCollectifs: number;
  nbTournois: number;
  nbMembres: number;
  nbInvites: number;
  nbPerformances: number;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const [
      nbCollectifs,
      nbTournois,
      nbMembres,
      nbInvites,
      nbPerformances,
    ] = await Promise.all([
      prisma.collectif.count({ where: { role: 'COLLECTIF' } }),
      prisma.tournoi.count(),
      prisma.membre.count(),
      prisma.guest.count(),
      prisma.performance.count(),
    ]);

    return {
      nbCollectifs,
      nbTournois,
      nbMembres,
      nbInvites,
      nbPerformances,
    };
  },

  async listCollectifs() {
    const collectifs = await collectifModel.findAll();

    const withCounts = await Promise.all(
      collectifs.map(async (c) => {
        const [nbMembres, nbTournois] = await Promise.all([
          prisma.membre.count({ where: { idCollectif: c.idCollectif } }),
          prisma.tournoi.count({ where: { idCollectif: c.idCollectif } }),
        ]);

        return { ...c, nbMembres, nbTournois };
      }),
    );

    return withCounts;
  },

  async toggleActive(id: number, active: boolean) {
    const existing = await collectifModel.findById(id);

    if (!existing) {
      throw new Error('Collectif non trouvé');
    }

    if (existing.role === 'ADMIN') {
      throw new Error('Impossible de suspendre un compte administrateur');
    }

    return await collectifModel.setActive(id, active);
  },

  async deleteCollectif(id: number) {
    const existing = await collectifModel.findById(id);

    if (!existing) {
      throw new Error('Collectif non trouvé');
    }

    if (existing.role === 'ADMIN') {
      throw new Error('Impossible de supprimer un compte administrateur');
    }

    return await collectifModel.delete(id);
  },
};
