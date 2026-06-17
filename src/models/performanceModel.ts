import prisma from '../prisma.js';

export interface PerformanceData {
  idTournoi: number;
  idMembre?: number;
  idGuest?: number;
  idParticipant: number;
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
    const result = await prisma.performance.create({
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
        }
        
      },
    });
    
    if (result.noteFinale !== undefined && result.noteFinale !== null) {
      await prisma.tournament_participants.update({
        where: { idParticipant: result.idParticipant },
        data: { totalNote: { increment: result.noteFinale } }
      });
    }
    
    return result;
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
      orderBy: { idPerfo: 'desc' },
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
    if (data.noteFinale !== undefined) {
      const existing = await prisma.performance.findUnique({
        where: { idPerfo: id },
        select: { noteFinale: true, idParticipant: true }
      });
      
      if (existing) {
        const oldNote = existing.noteFinale !== null && existing.noteFinale !== undefined ? existing.noteFinale : 0;
        const newNote = data.noteFinale;
        const diff = newNote - oldNote;
        
        await prisma.tournament_participants.update({
          where: { idParticipant: existing.idParticipant },
          data: { totalNote: { increment: diff } }
        });
      }
    }
    
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
    const existing = await prisma.performance.findUnique({
      where: { idPerfo: id },
      select: { noteFinale: true, idParticipant: true }
    });
    
    if (existing) {
      const note = existing.noteFinale !== null && existing.noteFinale !== undefined ? existing.noteFinale : 0;
      
      if (note > 0) {
        await prisma.tournament_participants.update({
          where: { idParticipant: existing.idParticipant },
          data: { totalNote: { decrement: note } }
        });
      }
    }
    
    return await prisma.performance.delete({
      where: { idPerfo: id },
    });
  },
};