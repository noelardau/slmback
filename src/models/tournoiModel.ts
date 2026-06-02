import prisma from '../prisma.js';

export interface TournoiData {
  LieuTournoi: string;
  dateTournoi: Date;
  heureTournoi: string;
  nomTournoi: string;
  nbJury: number;
  afficheTournoi?: string;
  dureePerfo?: string;
  tirageAuSort?: boolean;
  idCollectif: number;
}

export interface UpdateTournoiData {
  LieuTournoi?: string;
  dateTournoi?: Date;
  heureTournoi?: string;
  nomTournoi?: string;
  nbJury?: number;
  afficheTournoi?: string;
  dureePerfo?: string;
  tirageAuSort?: boolean;
}

export interface TournoiUpdateData {
  LieuTournoi?: string;
  dateTournoi?: Date;
  heureTournoi?: string;
  nomTournoi?: string;
  nbJury?: number;
  afficheTournoi?: string;
}

export const tournoiModel = {
  async create(data: TournoiData) {
    return await prisma.tournoi.create({
      data,
    });
  },

  async findById(id: number) {
    return await prisma.tournoi.findUnique({
      where: { idTournoi: id },
      include: {
        collectif: {
          select: {
            idCollectif: true,
            nomCollectif: true,
            ville: true,
          },
        },
      },
    });
  },

  async findByCollectif(idCollectif: number) {
    return await prisma.tournoi.findMany({
      where: { idCollectif },
      orderBy: { dateTournoi: 'asc' },
    });
  },

  async findAll() {
    return await prisma.tournoi.findMany({
      orderBy: { dateTournoi: 'asc' },
      include: {
        collectif: {
          select: {
            idCollectif: true,
            nomCollectif: true,
            ville: true,
          },
        },
      },
    });
  },

  async update(id: number, data: TournoiUpdateData) {
    return await prisma.tournoi.update({
      where: { idTournoi: id },
      data,
    });
  },

  async delete(id: number) {
    return await prisma.tournoi.delete({
      where: { idTournoi: id },
    });
  },
};
