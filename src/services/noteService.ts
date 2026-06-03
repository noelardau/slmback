import prisma from '../prisma.js';
import { noteModel, NoteData, NoteUpdateData } from '../models/noteModel.js';
import { performanceModel } from '../models/performanceModel.js';

class NoteService {
  async create(data: NoteData) {
    try {
      const note = await noteModel.create(data);
      
      await this.updatePerformanceFinalNote(data.idPerfo);
      
      return note;
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
      throw new Error('Erreur lors de la création de la note');
    }
  }

  async createBulk(idPerfo: number, notes: { valeur: number; retenu?: boolean }[]) {
    try {
      const createdNotes = [];
      
      for (const note of notes) {
        const createdNote = await noteModel.create({
          idPerfo,
          valeur: note.valeur,
          retenu: note.retenu !== undefined ? Boolean(note.retenu) : true,
        });
        createdNotes.push(createdNote);
      }
      
      await this.updatePerformanceFinalNote(idPerfo);
      
      return createdNotes;
    } catch (error) {
      console.error('Erreur lors de la création des notes en masse:', error);
      throw new Error('Erreur lors de la création des notes en masse');
    }
  }

  async getById(id: number) {
    try {
      const note = await noteModel.findById(id);
      if (!note) {
        throw new Error('Note non trouvée');
      }
      return note;
    } catch (error) {
      console.error('Erreur lors de la récupération de la note:', error);
      throw error;
    }
  }

  async getByPerformance(idPerfo: number) {
    try {
      const notes = await noteModel.findByPerformance(idPerfo);
      return notes;
    } catch (error) {
      console.error('Erreur lors de la récupération des notes de la performance:', error);
      throw error;
    }
  }

  async update(id: number, data: NoteUpdateData) {
    try {
      const existingNote = await noteModel.findById(id);
      if (!existingNote) {
        throw new Error('Note non trouvée');
      }

      const note = await noteModel.update(id, data);
      
      await this.updatePerformanceFinalNote(existingNote.idPerfo);
      
      return note;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const existingNote = await noteModel.findById(id);
      if (!existingNote) {
        throw new Error('Note non trouvée');
      }

      await noteModel.delete(id);
      
      await this.updatePerformanceFinalNote(existingNote.idPerfo);
      
      return { message: 'Note supprimée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
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

export const noteService = new NoteService();