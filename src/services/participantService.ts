import { participantModel, ParticipantData } from '../models/participantModel.js';
import { tournoiModel } from '../models/tournoiModel.js';
import { membreModel } from '../models/membreModel.js';
import { guestModel } from '../models/guestModel.js';

export const participantService = {
  async registerMembre(idTournoi: number, idMembre: number) {
    const tournoi = await tournoiModel.findById(idTournoi);

    if (!tournoi) {
      throw new Error('Tournoi non trouvé');
    }

    const membre = await membreModel.findById(idMembre);

    if (!membre) {
      throw new Error('Membre non trouvé');
    }

    if (membre.idCollectif !== tournoi.idCollectif) {
      throw new Error('Ce membre n\'appartient pas au collectif organisateur');
    }

    const existingParticipant = await participantModel.findByTournoiAndMembre(idTournoi, idMembre);

    if (existingParticipant) {
      throw new Error('Ce membre est déjà inscrit à ce tournoi');
    }

    const participant = await participantModel.register({
      idTournoi,
      idMembre,
    });

    return {
      message: 'Membre inscrit au tournoi avec succès',
      participant,
    };
  },

  async registerGuest(idTournoi: number, guestData: { pseudo: string }) {
    const tournoi = await tournoiModel.findById(idTournoi);

    if (!tournoi) {
      throw new Error('Tournoi non trouvé');
    }

    const pseudo = guestData.pseudo.trim();

    if (!pseudo) {
      throw new Error('Le pseudo est requis');
    }

    let guest = await guestModel.findByPseudo(pseudo);

    if (!guest) {
      const createdGuest = await guestModel.create({ pseudo });
      guest = createdGuest;
    }

    const existingParticipant = await participantModel.findByTournoiAndGuest(idTournoi, guest.idGuest);

    if (existingParticipant) {
      throw new Error('Ce guest est déjà inscrit à ce tournoi');
    }

    const participant = await participantModel.register({
      idTournoi,
      idGuest: guest.idGuest,
    });

    return {
      message: 'Guest inscrit au tournoi avec succès',
      participant,
    };
  },

  async getByTournoi(idTournoi: number) {
    const tournoi = await tournoiModel.findById(idTournoi);

    if (!tournoi) {
      throw new Error('Tournoi non trouvé');
    }

    return await participantModel.findByTournoi(idTournoi);
  },

  async getByMembre(idMembre: number) {
    const membre = await membreModel.findById(idMembre);

    if (!membre) {
      throw new Error('Membre non trouvé');
    }

    return await participantModel.findByMembre(idMembre);
  },

  async getByGuest(idGuest: number) {
    const guest = await guestModel.findById(idGuest);

    if (!guest) {
      throw new Error('Guest non trouvé');
    }

    return await participantModel.findByGuest(idGuest);
  },

  async unregisterMembre(idTournoi: number, idMembre: number) {
    const participant = await participantModel.findByTournoiAndMembre(idTournoi, idMembre);

    if (!participant) {
      throw new Error('Inscription non trouvée');
    }

    await participantModel.unregister(participant.idParticipant);

    return { message: 'Désinscription réussie' };
  },

  async unregisterGuest(idTournoi: number, idGuest: number) {
    const participant = await participantModel.findByTournoiAndGuest(idTournoi, idGuest);

    if (!participant) {
      throw new Error('Inscription non trouvée');
    }

    await participantModel.unregister(participant.idParticipant);

    return { message: 'Désinscription réussie' };
  },
};
