import prisma from '../prisma.js';

export interface ParticipantData {
  idMembre?: number;
  idTournoi: number;
  idGuest?: number;
}

export const participantModel = {
  async register(data: ParticipantData) {
    return await prisma.tournament_participants.create({
      data,
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
    });
  },

  async findByTournoi(idTournoi: number) {
    return await prisma.tournament_participants.findMany({
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
    });
  },

  async findByMembre(idMembre: number) {
    return await prisma.tournament_participants.findMany({
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
    });
  },

  async findByGuest(idGuest: number) {
    return await prisma.tournament_participants.findMany({
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
    });
  },

  async findByTournoiAndMembre(idTournoi: number, idMembre: number) {
    return await prisma.tournament_participants.findUnique({
      where: {
        idMembre_idTournoi: {
          idMembre,
          idTournoi,
        },
      },
    });
  },

  async findByTournoiAndGuest(idTournoi: number, idGuest: number) {
    return await prisma.tournament_participants.findUnique({
      where: {
        idGuest_idTournoi: {
          idGuest,
          idTournoi,
        },
      },
    });
  },

  async unregister(id: number) {
    return await prisma.tournament_participants.delete({
      where: { idParticipant: id },
    });
  },
};
