import prisma from '../prisma.js';

export interface GuestData {
  pseudo: string;
}

export interface GuestUpdateData {
  pseudo?: string;
}

export const guestModel = {
  async create(data: GuestData) {
    return await prisma.guest.create({
      data,
    });
  },

  async findById(id: number) {
    return await prisma.guest.findUnique({
      where: { idGuest: id },
    });
  },

  async findByPseudo(pseudo: string) {
    return await prisma.guest.findUnique({
      where: { pseudo },
    });
  },

  async findAll() {
    return await prisma.guest.findMany();
  },

  async update(id: number, data: GuestUpdateData) {
    return await prisma.guest.update({
      where: { idGuest: id },
      data,
    });
  },

  async delete(id: number) {
    return await prisma.guest.delete({
      where: { idGuest: id },
    });
  },
};
