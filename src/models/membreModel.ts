import prisma from '../prisma.js';

export interface MembreData {
  nomMembre: string;
  prenomMembre: string;
  photoMembre?: string;
  dateNaissance: Date;
  adresse: string;
  idCollectif: number;
}

export interface MembreUpdateData {
  nomMembre?: string;
  prenomMembre?: string;
  photoMembre?: string;
  dateNaissance?: Date;
  adresse?: string;
}

export const membreModel = {
  async create(data: MembreData) {
    return await prisma.membre.create({
      data,
    });
  },

  async findById(id: number) {
    return await prisma.membre.findUnique({
      where: { idMembre: id },
    });
  },

  async findByCollectif(idCollectif: number) {
    return await prisma.membre.findMany({
      where: { idCollectif },
    });
  },

  async findAll() {
    return await prisma.membre.findMany();
  },

  async update(id: number, data: MembreUpdateData) {
    return await prisma.membre.update({
      where: { idMembre: id },
      data,
    });
  },

  async delete(id: number) {
    return await prisma.membre.delete({
      where: { idMembre: id },
    });
  },
};
