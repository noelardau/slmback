import prisma from '../prisma.js';

export interface PerformanceData {
  idTournoi: number;
  idMembre?: number;
  idGuest?: number;
  duree?: string;
  noteFinale?: number;
  etat?: string;
}

export interface PerformanceUpdateData {
  duree?: string;
  noteFinale?: number;
  etat?: string;
}

export const performanceModel = {
  async create(data: PerformanceData) {
    return await prisma.performance.create({
      data,
      include: {
        tournoi: {
          select: {
            idTournoi: true,
            nomTournoi: true,
            LieuTournoi: true,
            dateTournoi: true,
            heureTournoi: true,
          },
        },
        membre: {
          select: {
            idMembre: true,
            nomMembre: true,
            prenomMembre: true,
            pseudoMembre: true,
            photoMembre: true,
          },
        },
        guest: {
          select: {
            idGuest: true,
            pseudo: true,
          },
        },
      },
    });
  },

  async findById(id: number) {
    return await prisma.performance.findUnique({
      where: { idPerfo: id },
      include: {
        tournoi: {
          select: {
            idTournoi: true,
            nomTournoi: true,
            LieuTournoi: true,
            dateTournoi: true,
            heureTournoi: true,
          },
        },
        membre: {
          select: {
            idMembre: true,
            nomMembre: true,
            prenomMembre: true,
            pseudoMembre: true,
            photoMembre: true,
          },
        },
        guest: {
          select: {
            idGuest: true,
            pseudo: true,
          },
        },
      },
    });
  },

  async findByTournoi(idTournoi: number) {
    return await prisma.performance.findMany({
      where: { idTournoi },
      include: {
        membre: {
          select: {
            idMembre: true,
            nomMembre: true,
            prenomMembre: true,
            pseudoMembre: true,
            photoMembre: true,
          },
        },
        guest: {
          select: {
            idGuest: true,
            pseudo: true,
          },
        },
      },
      orderBy: { idPerfo: 'asc' },
    });
  },

  async findByMembre(idMembre: number) {
    return await prisma.performance.findMany({
      where: { idMembre },
      include: {
        tournoi: {
          select: {
            idTournoi: true,
            nomTournoi: true,
            LieuTournoi: true,
            dateTournoi: true,
            heureTournoi: true,
            collectif: {
              select: {
                idCollectif: true,
                nomCollectif: true,
              },
            },
          },
        },
      },
      orderBy: { idPerfo: 'asc' },
    });
  },

  async findByGuest(idGuest: number) {
    return await prisma.performance.findMany({
      where: { idGuest },
      include: {
        tournoi: {
          select: {
            idTournoi: true,
            nomTournoi: true,
            LieuTournoi: true,
            dateTournoi: true,
            heureTournoi: true,
            collectif: {
              select: {
                idCollectif: true,
                nomCollectif: true,
              },
            },
          },
        },
      },
      orderBy: { idPerfo: 'asc' },
    });
  },

  async update(id: number, data: PerformanceUpdateData) {
    return await prisma.performance.update({
      where: { idPerfo: id },
      data,
      include: {
        tournoi: {
          select: {
            idTournoi: true,
            nomTournoi: true,
          },
        },
        membre: {
          select: {
            idMembre: true,
            pseudoMembre: true,
          },
        },
        guest: {
          select: {
            idGuest: true,
            pseudo: true,
          },
        },
      },
    });
  },

  async delete(id: number) {
    return await prisma.performance.delete({
      where: { idPerfo: id },
    });
  },
};