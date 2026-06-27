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

const PUBLIC_SELECT = {
  idCollectif: true,
  nomCollectif: true,
  ville: true,
  email: true,
  photoCollectif: true,
  prefLang: true,
  prefTheme: true,
  role: true,
  active: true,
} as const;

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
      select: PUBLIC_SELECT,
    });
  },

  async update(id: number, data: CollectifUpdateData) {
    return await prisma.collectif.update({
      where: { idCollectif: id },
      data,
      select: PUBLIC_SELECT,
    });
  },

  async updatePassword(id: number, hashedPassword: string) {
    return await prisma.collectif.update({
      where: { idCollectif: id },
      data: { password: hashedPassword },
    });
  },

  async findAll() {
    return await prisma.collectif.findMany({
      select: PUBLIC_SELECT,
      orderBy: { idCollectif: 'asc' },
    });
  },

  async setActive(id: number, active: boolean) {
    return await prisma.collectif.update({
      where: { idCollectif: id },
      data: { active },
      select: PUBLIC_SELECT,
    });
  },

  async delete(id: number) {
    return await prisma.collectif.delete({
      where: { idCollectif: id },
      select: PUBLIC_SELECT,
    });
  },
};
