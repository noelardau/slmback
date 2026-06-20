import { membreModel, MembreData, MembreUpdateData } from '../models/membreModel.js';
import { collectifModel } from '../models/collectifModel.js';
import { generateUniqueCodeMembre } from '../utils/codeMembre.js';

export const membreService = {
  async create(data: Omit<MembreData, 'codeMembre'>) {
    const collectif = await collectifModel.findById(data.idCollectif);

    if (!collectif) {
      throw new Error('Collectif non trouvé');
    }

    const codeMembre = await generateUniqueCodeMembre();
    const membre = await membreModel.create({ ...data, codeMembre });

    return membre;
  },

  async getById(id: number) {
    const membre = await membreModel.findById(id);

    if (!membre) {
      throw new Error('Membre non trouvé');
    }

    return membre;
  },

  async getByCollectif(idCollectif: number) {
    const collectif = await collectifModel.findById(idCollectif);

    if (!collectif) {
      throw new Error('Collectif non trouvé');
    }

    return await membreModel.findByCollectif(idCollectif);
  },

  async getAll() {
    return await membreModel.findAll();
  },

  async update(id: number, data: MembreUpdateData) {
    const membre = await membreModel.findById(id);

    if (!membre) {
      throw new Error('Membre non trouvé');
    }

    const updatedMembre = await membreModel.update(id, data);

    return updatedMembre;
  },

  async delete(id: number) {
    const membre = await membreModel.findById(id);

    if (!membre) {
      throw new Error('Membre non trouvé');
    }

    await membreModel.delete(id);

    return { message: 'Membre supprimé avec succès' };
  },
};
