import prisma from '../prisma.js';

export interface NoteData {
  idPerfo: number;
  valeur: number;
  retenu?: boolean;
}

export interface NoteUpdateData {
  valeur?: number;
  retenu?: boolean;
}

export const noteModel = {
  async create(data: NoteData) {
    return await prisma.note.create({
      data,
      include: {
        performance: {
          select: {
            idPerfo: true,
            duree: true,
            noteFinale: true,
            etat: true,
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
        },
      },
    });
  },

  async findById(id: number) {
    return await prisma.note.findUnique({
      where: { idNote: id },
      include: {
        performance: {
          select: {
            idPerfo: true,
            duree: true,
            noteFinale: true,
            etat: true,
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
        },
      },
    });
  },

  async findByPerformance(idPerfo: number) {
    return await prisma.note.findMany({
      where: { idPerfo },
      include: {
        performance: {
          select: {
            idPerfo: true,
            duree: true,
            noteFinale: true,
            etat: true,
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
        },
      },
      orderBy: { idNote: 'asc' },
    });
  },

  async update(id: number, data: NoteUpdateData) {
    return await prisma.note.update({
      where: { idNote: id },
      data,
      include: {
        performance: {
          select: {
            idPerfo: true,
            duree: true,
            noteFinale: true,
            etat: true,
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
        },
      },
    });
  },

  async delete(id: number) {
    return await prisma.note.delete({
      where: { idNote: id },
    });
  },

  async calculateFinalNote(idPerfo: number): Promise<number | null> {
    const notes = await prisma.note.findMany({
      where: { 
        idPerfo,
        retenu: true 
      },
    });

    if (notes.length === 0) return null;

    const sum = notes.reduce((acc, note) => acc + note.valeur, 0);
    return sum;
  },
};