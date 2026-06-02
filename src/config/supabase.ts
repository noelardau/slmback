import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger le fichier .env au démarrage
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables manquantes:', {
    supabaseUrl: !!supabaseUrl,
    supabaseKey: !!supabaseKey
  });
  throw new Error('Les variables d\'environnement Supabase sont manquantes');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const STORAGE_BUCKET = 'collectif-photos';
export const STORAGE_FOLDER = 'profiles';