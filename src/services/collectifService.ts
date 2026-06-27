import { collectifModel, CollectifData, CollectifUpdateData, CollectifPreferences, PrefLang, PrefTheme } from '../models/collectifModel.js';
import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ALLOWED_LANGS: PrefLang[] = ['en', 'fr'];
const ALLOWED_THEMES: PrefTheme[] = ['dark', 'light'];

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const collectifService = {
  async register(data: CollectifData) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const collectif = await collectifModel.create({
      ...data,
      password: hashedPassword,
    });

    const profile = await collectifModel.findById(collectif.idCollectif);

    return {
      collectif: profile,
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

    if (!collectif.active && collectif.role !== 'ADMIN') {
      throw new Error('Votre compte est en attente de validation par l\'administrateur');
    }

    const token = jwt.sign(
      { userId: collectif.idCollectif, role: collectif.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const profile = await collectifModel.findById(collectif.idCollectif);

    return {
      token,
      collectif: profile,
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
    const collectif = await collectifModel.findById(id);

    if (!collectif) {
      throw new Error('Collectif non trouvé');
    }

    if (data.prefLang !== undefined && !ALLOWED_LANGS.includes(data.prefLang)) {
      throw new Error('Langue invalide (valeurs attendues: en, fr)');
    }

    if (data.prefTheme !== undefined && !ALLOWED_THEMES.includes(data.prefTheme)) {
      throw new Error('Thème invalide (valeurs attendues: dark, light)');
    }

    const updatedCollectif = await collectifModel.update(id, data);

    return updatedCollectif;
  },

  async updatePreferences(id: number, data: CollectifPreferences) {
    const collectif = await collectifModel.findById(id);

    if (!collectif) {
      throw new Error('Collectif non trouvé');
    }

    if (data.prefLang !== undefined && !ALLOWED_LANGS.includes(data.prefLang)) {
      throw new Error('Langue invalide (valeurs attendues: en, fr)');
    }

    if (data.prefTheme !== undefined && !ALLOWED_THEMES.includes(data.prefTheme)) {
      throw new Error('Thème invalide (valeurs attendues: dark, light)');
    }

    const updatedCollectif = await collectifModel.update(id, data);

    return updatedCollectif;
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

  async logout(userId: number, token: string) {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; exp: number };
    
    const expiresAt = new Date(decoded.exp * 1000);
    
    await prisma.blacklistedToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return { message: 'Déconnexion réussie' };
  },

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token },
    });

    return !!blacklisted;
  },
};
