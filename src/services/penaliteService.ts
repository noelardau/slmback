import prisma from '../prisma.js';
import { penaliteModel, PenaliteData, PenaliteUpdateData } from '../models/penaliteModel.js';
import { performanceModel } from '../models/performanceModel.js';

class PenaliteService {
  async create(data: PenaliteData) {
    try {
      const penalite = await penaliteModel.create(data);
      
      await this.updatePerformanceFinalNote(data.idPerfo);
      
      return penalite;
    } catch (error) {
      console.error('Erreur lors de la création de la pénalité:', error);
      throw new Error('Erreur lors de la création de la pénalité');
    }
  }

  async createBulk(idPerfo: number, penalites: { valeur: number }[]) {
    try {
      const createdPenalites = [];
      
      for (const penalite of penalites) {
        const createdPenalite = await penaliteModel.create({
          idPerfo,
          valeur: penalite.valeur,
        });
        createdPenalites.push(createdPenalite);
      }
      
      await this.updatePerformanceFinalNote(idPerfo);
      
      return createdPenalites;
    } catch (error) {
      console.error('Erreur lors de la création des pénalités en masse:', error);
      throw new Error('Erreur lors de la création des pénalités en masse');
    }
  }

  async getById(id: number) {
    try {
      const penalite = await penaliteModel.findById(id);
      if (!penalite) {
        throw new Error('Pénalité non trouvée');
      }
      return penalite;
    } catch (error) {
      console.error('Erreur lors de la récupération de la pénalité:', error);
      throw error;
    }
  }

  async getByPerformance(idPerfo: number) {
    try {
      const penalites = await penaliteModel.findByPerformance(idPerfo);
      return penalites;
    } catch (error) {
      console.error('Erreur lors de la récupération des pénalités de la performance:', error);
      throw error;
    }
  }

  async update(id: number, data: PenaliteUpdateData) {
    try {
      const existingPenalite = await penaliteModel.findById(id);
      if (!existingPenalite) {
        throw new Error('Pénalité non trouvée');
      }

      const penalite = await penaliteModel.update(id, data);
      
      await this.updatePerformanceFinalNote(existingPenalite.idPerfo);
      
      return penalite;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la pénalité:', error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const existingPenalite = await penaliteModel.findById(id);
      if (!existingPenalite) {
        throw new Error('Pénalité non trouvée');
      }

      await penaliteModel.delete(id);
      
      await this.updatePerformanceFinalNote(existingPenalite.idPerfo);
      
      return { message: 'Pénalité supprimée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression de la pénalité:', error);
      throw error;
    }
  }

  private async updatePerformanceFinalNote(idPerfo: number) {
    const totalNotes = await prisma.note.findMany({
      where: { idPerfo, retenu: true },
    });

    const totalPenalites = await prisma.penalite.findMany({
      where: { idPerfo },
    });

    const sumNotes = totalNotes.reduce((acc, note) => acc + note.valeur, 0);
    const sumPenalites = totalPenalites.reduce((acc, penalite) => acc + penalite.valeur, 0);

    const finalNote = sumNotes - sumPenalites;

    await performanceModel.update(idPerfo, { noteFinale: finalNote });
  }
}

export const penaliteService = new PenaliteService();