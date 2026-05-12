import prisma from '../prisma.js';

export interface GuestData {
  nomGuest: string;
  prenomGuest: string;
  emailGuest: string;
  telephone?: string;
}

export interface GuestUpdateData {
  nomGuest?: string;
  prenomGuest?: string;
  emailGuest?: string;
  telephone?: string;
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

  async findByEmail(email: string) {
    return await prisma.guest.findFirst({
      where: { emailGuest: email },
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
