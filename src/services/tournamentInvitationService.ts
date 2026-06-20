import { randomBytes } from 'crypto';
import {
  tournamentInvitationModel,
  TournamentInvitationCreateData,
} from '../models/tournamentInvitationModel.js';
import { tournoiModel } from '../models/tournoiModel.js';
import { membreModel } from '../models/membreModel.js';
import { participantService } from './participantService.js';

export interface TournamentInvitationCreateInput {
  dureeJours?: number;
  maxUsages?: number | null;
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

async function assertTournoiOwnedByCollectif(idTournoi: number, idCollectif: number) {
  const tournoi = await tournoiModel.findById(idTournoi);
  if (!tournoi) {
    throw new Error('Tournoi non trouvé');
  }
  if (tournoi.idCollectif !== idCollectif) {
    throw new Error('Vous n\'avez pas accès à ce tournoi');
  }
  return tournoi;
}

export const tournamentInvitationService = {
  async createInvitation(
    idTournoi: number,
    idCollectif: number,
    input: TournamentInvitationCreateInput = {},
  ) {
    const dureeJours = input.dureeJours ?? 7;
    const maxUsages = input.maxUsages ?? null;

    if (dureeJours <= 0) {
      throw new Error('La durée doit être positive');
    }

    if (maxUsages !== null && maxUsages <= 0) {
      throw new Error('Le nombre d\'usages doit être positif');
    }

    await assertTournoiOwnedByCollectif(idTournoi, idCollectif);

    const data: TournamentInvitationCreateData = {
      token: generateToken(),
      idTournoi,
      maxUsages,
      expireLe: new Date(Date.now() + dureeJours * 24 * 60 * 60 * 1000),
    };

    return await tournamentInvitationModel.create(data);
  },

  async getByToken(token: string) {
    const invitation = await tournamentInvitationModel.findByToken(token);

    if (!invitation) {
      throw new Error('Invitation invalide');
    }

    if (invitation.statut === 'REVOQUE') {
      throw new Error('Invitation révoquée');
    }

    if (invitation.statut === 'EXPIRE' || invitation.expireLe < new Date()) {
      throw new Error('Invitation expirée');
    }

    if (invitation.maxUsages !== null && invitation.usagesCount >= invitation.maxUsages) {
      throw new Error('Invitation expirée');
    }

    return invitation;
  },

  async listByTournoi(idTournoi: number, idCollectif: number) {
    await assertTournoiOwnedByCollectif(idTournoi, idCollectif);
    return await tournamentInvitationModel.findByTournoi(idTournoi);
  },

  async acceptAsMembre(token: string, codeMembre: string) {
    const invitation = await this.getByToken(token);
    const tournoi = invitation.tournoi;

    const membre = await membreModel.findByCodeMembre(codeMembre.trim().toUpperCase());
    if (!membre) {
      throw new Error('Code membre invalide');
    }

    if (membre.idCollectif !== tournoi.idCollectif) {
      throw new Error('Ce code membre n\'appartient pas au collectif organisateur');
    }

    const result = await participantService.registerMembre(tournoi.idTournoi, membre.idMembre);

    await this.incrementOrExpire(invitation);

    return result;
  },

  async acceptAsGuest(token: string, pseudo: string) {
    const invitation = await this.getByToken(token);
    const tournoi = invitation.tournoi;

    const result = await participantService.registerGuest(tournoi.idTournoi, { pseudo });

    await this.incrementOrExpire(invitation);

    return result;
  },

  async incrementOrExpire(invitation: {
    idTournamentInvitation: number;
    usagesCount: number;
    maxUsages: number | null;
  }) {
    const nextCount = invitation.usagesCount + 1;
    if (invitation.maxUsages !== null && nextCount >= invitation.maxUsages) {
      await tournamentInvitationModel.update(invitation.idTournamentInvitation, {
        statut: 'EXPIRE',
      });
    } else {
      await tournamentInvitationModel.incrementUsages(invitation.idTournamentInvitation);
    }
  },

  async revoke(id: number, idTournoi: number, idCollectif: number) {
    await assertTournoiOwnedByCollectif(idTournoi, idCollectif);

    const invitation = await tournamentInvitationModel.findById(id);

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    if (invitation.idTournoi !== idTournoi) {
      throw new Error('Cette invitation n\'appartient pas à ce tournoi');
    }

    return await tournamentInvitationModel.update(id, { statut: 'REVOQUE' });
  },
};
