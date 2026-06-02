import prisma from '../prisma.js';

export interface PenaliteData {
  idPerfo: number;
  valeur: number;
}

export interface PenaliteUpdateData {
  valeur?: number;
}

export const penaliteModel = {
  async create(data: PenaliteData) {
    return await prisma.penalite.create({
      data,
      include: {
        performance: {
          select: {
            idPerfo: true,
            duree: true,
            noteFinale: true,
            etat: true,
          },
        },
      },
    });
  },

  async findById(id: number) {
    return await prisma.penalite.findUnique({
      where: { idPenalite: id },
      include: {
        performance: {
          select: {
            idPerfo: true,
            duree: true,
            noteFinale: true,
            etat: true,
          },
        },
      },
    });
  },

  async findByPerformance(idPerfo: number) {
    return await prisma.penalite.findMany({
      where: { idPerfo },
      include: {
        performance: {
          select: {
            idPerfo: true,
            duree: true,
            noteFinale: true,
            etat: true,
          },
        },
      },
      orderBy: { idPenalite: 'asc' },
    });
  },

  async update(id: number, data: PenaliteUpdateData) {
    return await prisma.penalite.update({
      where: { idPenalite: id },
      data,
      include: {
        performance: {
          select: {
            idPerfo: true,
            duree: true,
            noteFinale: true,
            etat: true,
          },
        },
      },
    });
  },

  async delete(id: number) {
    return await prisma.penalite.delete({
      where: { idPenalite: id },
    });
  },

  async calculateTotalPenalites(idPerfo: number): Promise<number> {
    const penalites = await prisma.penalite.findMany({
      where: { idPerfo },
    });

    const sum = penalites.reduce((acc, penalite) => acc + penalite.valeur, 0);
    return sum;
  },
};