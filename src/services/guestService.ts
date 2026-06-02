import { guestModel, GuestData, GuestUpdateData } from '../models/guestModel.js';

export const guestService = {
  async create(data: GuestData) {
    const existingGuest = await guestModel.findByPseudo(data.pseudo);

    if (existingGuest) {
      throw new Error('Un guest avec ce pseudo existe déjà');
    }

    const guest = await guestModel.create(data);

    return {
      message: 'Guest créé avec succès',
      idGuest: guest.idGuest,
    };
  },

  async getById(id: number) {
    const guest = await guestModel.findById(id);

    if (!guest) {
      throw new Error('Guest non trouvé');
    }

    return guest;
  },

  async getAll() {
    return await guestModel.findAll();
  },

  async update(id: number, data: GuestUpdateData) {
    const guest = await guestModel.findById(id);

    if (!guest) {
      throw new Error('Guest non trouvé');
    }

    if (data.pseudo) {
      const existingGuest = await guestModel.findByPseudo(data.pseudo);
      if (existingGuest && existingGuest.idGuest !== id) {
        throw new Error('Ce pseudo est déjà utilisé');
      }
    }

    const updatedGuest = await guestModel.update(id, data);

    return updatedGuest;
  },

  async delete(id: number) {
    const guest = await guestModel.findById(id);

    if (!guest) {
      throw new Error('Guest non trouvé');
    }

    await guestModel.delete(id);

    return { message: 'Guest supprimé avec succès' };
  },
};
