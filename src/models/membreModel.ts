import prisma from '../prisma.js';

export interface MembreData {
  nomMembre: string;
  prenomMembre: string;
  pseudoMembre: string;
  emailMembre: string;
  codeMembre: string;
  photoMembre?: string;
  dateNaissance: Date;
  adresse: string;
  idCollectif: number;
}

export interface MembreUpdateData {
  nomMembre?: string;
  prenomMembre?: string;
  pseudoMembre?: string;
  emailMembre?: string;
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

  async findByPseudo(pseudoMembre: string) {
    return await prisma.membre.findUnique({
      where: { pseudoMembre },
    });
  },

  async findByEmail(emailMembre: string) {
    return await prisma.membre.findUnique({
      where: { emailMembre },
    });
  },

  async findByCodeMembre(codeMembre: string) {
    return await prisma.membre.findUnique({
      where: { codeMembre },
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
