import { tournoiModel, TournoiData, TournoiUpdateData } from '../models/tournoiModel.js';
import { collectifModel } from '../models/collectifModel.js';

export const tournoiService = {
  async create(data: TournoiData) {
    const collectif = await collectifModel.findById(data.idCollectif);

    if (!collectif) {
      throw new Error('Collectif non trouvé');
    }

    const tournoi = await tournoiModel.create(data);

    return tournoi;
  },

  async getById(id: number) {
    const tournoi = await tournoiModel.findById(id);

    if (!tournoi) {
      throw new Error('Tournoi non trouvé');
    }

    return tournoi;
  },

  async getByCollectif(idCollectif: number) {
    const collectif = await collectifModel.findById(idCollectif);

    if (!collectif) {
      throw new Error('Collectif non trouvé');
    }

    return await tournoiModel.findByCollectif(idCollectif);
  },

  async getAll() {
    return await tournoiModel.findAll();
  },

  async update(id: number, data: TournoiUpdateData) {
    const tournoi = await tournoiModel.findById(id);

    if (!tournoi) {
      throw new Error('Tournoi non trouvé');
    }

    const updatedTournoi = await tournoiModel.update(id, data);

    return updatedTournoi;
  },

  async delete(id: number) {
    const tournoi = await tournoiModel.findById(id);

    if (!tournoi) {
      throw new Error('Tournoi non trouvé');
    }

    await tournoiModel.delete(id);

    return { message: 'Tournoi supprimé avec succès' };
  },
};
