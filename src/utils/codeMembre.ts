import { membreModel } from '../models/membreModel.js';

// Alphabet sans ambigus visuels (pas de 0/O, 1/I/L)
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 6;
const MAX_RETRIES = 10;

function randomChar(): string {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

function randomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += randomChar();
  }
  return code;
}

export function formatCodeMembre(raw: string): string {
  return `SLM-${raw}`;
}

export function isValidCodeMembreFormat(code: string): boolean {
  return /^SLM-[A-Z2-9]{6}$/.test(code);
}

export async function generateUniqueCodeMembre(): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const raw = randomCode();
    const code = formatCodeMembre(raw);
    const existing = await membreModel.findByCodeMembre(code);
    if (!existing) {
      return code;
    }
  }
  throw new Error('Impossible de générer un code membre unique après plusieurs tentatives');
}
