import { collectifModel, CollectifData, CollectifUpdateData } from '../models/collectifModel.js';
import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const collectifService = {
  async register(data: CollectifData) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const collectif = await collectifModel.create({
      ...data,
      password: hashedPassword,
    });

    return {
      message: 'Compte créé avec succès',
      idCollectif: collectif.idCollectif,
    };
  },

  async login(email: string, password: string) {
    const collectif = await collectifModel.findByEmail(email);

    if (!collectif) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, collectif.password);

    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const token = jwt.sign(
      { userId: collectif.idCollectif },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      idCollectif: collectif.idCollectif,
      nomCollectif: collectif.nomCollectif,
    };
  },

  async getProfile(id: number) {
    const collectif = await collectifModel.findById(id);

    if (!collectif) {
      throw new Error('Collectif non trouvé');
    }

    return collectif;
  },

  async updateProfile(id: number, data: CollectifUpdateData) {
    const collectif = await collectifModel.update(id, data);

    if (!collectif) {
      throw new Error('Collectif non trouvé');
    }

    return collectif;
  },

  async updatePassword(id: number, currentPassword: string, newPassword: string) {
    const existingCollectif = await prisma.collectif.findUnique({
      where: { idCollectif: id },
    });

    if (!existingCollectif) {
      throw new Error('Collectif non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, existingCollectif.password);

    if (!isPasswordValid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await collectifModel.updatePassword(id, hashedPassword);

    return { message: 'Mot de passe modifié avec succès' };
  },
};
