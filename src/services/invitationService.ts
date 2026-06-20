import { randomBytes } from 'crypto';
import {
  invitationModel,
  InvitationCreateData,
} from '../models/invitationModel.js';
import { membreModel, MembreData } from '../models/membreModel.js';
import { collectifModel } from '../models/collectifModel.js';
import { generateUniqueCodeMembre } from '../utils/codeMembre.js';

export interface InvitationCreateInput {
  dureeJours?: number;
  maxUsages?: number | null;
}

export interface AcceptMembreData {
  nomMembre: string;
  prenomMembre: string;
  pseudoMembre: string;
  emailMembre: string;
  dateNaissance: Date;
  adresse: string;
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export const invitationService = {
  async createInvitation(idCollectif: number, input: InvitationCreateInput = {}) {
    const dureeJours = input.dureeJours ?? 7;
    const maxUsages = input.maxUsages ?? null;

    if (dureeJours <= 0) {
      throw new Error('La durée doit être positive');
    }

    if (maxUsages !== null && maxUsages <= 0) {
      throw new Error('Le nombre d\'usages doit être positif');
    }

    const collectif = await collectifModel.findById(idCollectif);
    if (!collectif) {
      throw new Error('Collectif non trouvé');
    }

    const data: InvitationCreateData = {
      token: generateToken(),
      idCollectif,
      maxUsages,
      expireLe: new Date(Date.now() + dureeJours * 24 * 60 * 60 * 1000),
    };

    return await invitationModel.create(data);
  },

  async getByToken(token: string) {
    const invitation = await invitationModel.findByToken(token);

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

  async listByCollectif(idCollectif: number) {
    return await invitationModel.findByCollectif(idCollectif);
  },

  async accept(token: string, data: AcceptMembreData, photoUrl?: string) {
    const invitation = await this.getByToken(token);

    const existingPseudo = await membreModel.findByPseudo(data.pseudoMembre);
    if (existingPseudo) {
      throw new Error('Pseudo déjà utilisé');
    }

    const existingEmail = await membreModel.findByEmail(data.emailMembre);
    if (existingEmail) {
      throw new Error('Email déjà utilisé');
    }

    const codeMembre = await generateUniqueCodeMembre();

    const membreData: MembreData = {
      ...data,
      codeMembre,
      photoMembre: photoUrl,
      idCollectif: invitation.idCollectif,
    };

    const membre = await membreModel.create(membreData);

    const nextCount = invitation.usagesCount + 1;
    if (invitation.maxUsages !== null && nextCount >= invitation.maxUsages) {
      await invitationModel.update(invitation.idInvitation, {
        statut: 'EXPIRE',
      });
    } else {
      await invitationModel.incrementUsages(invitation.idInvitation);
    }

    return membre;
  },

  async revoke(id: number, idCollectif: number) {
    const invitation = await invitationModel.findById(id);

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    if (invitation.idCollectif !== idCollectif) {
      throw new Error('Vous n\'avez pas accès à cette invitation');
    }

    return await invitationModel.update(id, { statut: 'REVOQUE' });
  },

  async delete(id: number, idCollectif: number) {
    const invitation = await invitationModel.findById(id);

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    if (invitation.idCollectif !== idCollectif) {
      throw new Error('Vous n\'avez pas accès à cette invitation');
    }

    return await invitationModel.delete(id);
  },
};
