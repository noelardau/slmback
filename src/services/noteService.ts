import prisma from '../prisma.js';
import { noteModel, NoteData, NoteUpdateData } from '../models/noteModel.js';

class NoteService {
  async create(data: NoteData) {
    try {
      const note = await noteModel.create(data);
      
      // Calculate and update the final note for the performance
      const finalNote = await noteModel.calculateFinalNote(data.idPerfo);
      if (finalNote !== null) {
        await prisma.performance.update({
          where: { idPerfo: data.idPerfo },
          data: { noteFinale: finalNote },
        });
      }
      
      return note;
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
      throw new Error('Erreur lors de la création de la note');
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
      
      // Recalculate and update the final note for the performance
      const finalNote = await noteModel.calculateFinalNote(existingNote.idPerfo);
      if (finalNote !== null) {
        await prisma.performance.update({
          where: { idPerfo: existingNote.idPerfo },
          data: { noteFinale: finalNote },
        });
      } else {
        await prisma.performance.update({
          where: { idPerfo: existingNote.idPerfo },
          data: { noteFinale: null },
        });
      }
      
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
      
      // Recalculate and update the final note for the performance
      const finalNote = await noteModel.calculateFinalNote(existingNote.idPerfo);
      if (finalNote !== null) {
        await prisma.performance.update({
          where: { idPerfo: existingNote.idPerfo },
          data: { noteFinale: finalNote },
        });
      } else {
        await prisma.performance.update({
          where: { idPerfo: existingNote.idPerfo },
          data: { noteFinale: null },
        });
      }
      
      return { message: 'Note supprimée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
      throw error;
    }
  }
}

export const noteService = new NoteService();