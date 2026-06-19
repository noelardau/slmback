import prisma from '../prisma.js';

export type PrefLang = 'en' | 'fr';
export type PrefTheme = 'dark' | 'light';

export interface CollectifData {
  nomCollectif: string;
  ville: string;
  email: string;
  password: string;
  photoCollectif?: string;
  prefLang?: PrefLang;
  prefTheme?: PrefTheme;
}

export interface CollectifUpdateData {
  nomCollectif?: string;
  ville?: string;
  email?: string;
  photoCollectif?: string;
  prefLang?: PrefLang;
  prefTheme?: PrefTheme;
}

export interface CollectifPreferences {
  prefLang?: PrefLang;
  prefTheme?: PrefTheme;
}

export const collectifModel = {
  async create(data: CollectifData) {
    return await prisma.collectif.create({
      data,
    });
  },

  async findByEmail(email: string) {
    return await prisma.collectif.findUnique({
      where: { email },
    });
  },

  async findById(id: number) {
    return await prisma.collectif.findUnique({
      where: { idCollectif: id },
      select: {
        idCollectif: true,
        nomCollectif: true,
        ville: true,
        email: true,
        photoCollectif: true,
        prefLang: true,
        prefTheme: true,
      },
    });
  },

  async update(id: number, data: CollectifUpdateData) {
    return await prisma.collectif.update({
      where: { idCollectif: id },
      data,
      select: {
        idCollectif: true,
        nomCollectif: true,
        ville: true,
        email: true,
        photoCollectif: true,
        prefLang: true,
        prefTheme: true,
      },
    });
  },

  async updatePassword(id: number, hashedPassword: string) {
    return await prisma.collectif.update({
      where: { idCollectif: id },
      data: { password: hashedPassword },
    });
  },
};
