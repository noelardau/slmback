import prisma from '../prisma.js';
import { performanceModel, PerformanceData, PerformanceUpdateData } from '../models/performanceModel.js';

export const performanceService = {
  async create(data: PerformanceData) {
    const tournoi = await prisma.tournoi.findUnique({
      where: { idTournoi: data.idTournoi },
    });

    if (!tournoi) {
      throw new Error('Tournoi non trouvé');
    }

    if (!data.idMembre && !data.idGuest) {
      throw new Error('Une performance doit être liée à un membre ou un invité');
    }

    if (data.idMembre && data.idGuest) {
      throw new Error('Une performance ne peut être liée qu\'à un seul participant');
    }

    const performance = await performanceModel.create(data);

    return {
      message: 'Performance créée avec succès',
      performance,
    };
  },

  async getById(id: number) {
    const performance = await performanceModel.findById(id);

    if (!performance) {
      throw new Error('Performance non trouvée');
    }

    return performance;
  },

  async getByTournoi(idTournoi: number) {
    const performances = await performanceModel.findByTournoi(idTournoi);
    return performances;
  },

  async getByMembre(idMembre: number) {
    const performances = await performanceModel.findByMembre(idMembre);
    return performances;
  },

  async getByGuest(idGuest: number) {
    const performances = await performanceModel.findByGuest(idGuest);
    return performances;
  },

  async update(id: number, data: PerformanceUpdateData) {
    const performance = await performanceModel.findById(id);

    if (!performance) {
      throw new Error('Performance non trouvée');
    }

    const updatedPerformance = await performanceModel.update(id, data);

    return updatedPerformance;
  },

  async delete(id: number) {
    const performance = await performanceModel.findById(id);

    if (!performance) {
      throw new Error('Performance non trouvée');
    }

    await performanceModel.delete(id);

    return { message: 'Performance supprimée avec succès' };
  },
};