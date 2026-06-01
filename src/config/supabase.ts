import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Les variables d\'environnement Supabase sont manquantes');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const STORAGE_BUCKET = 'collectif-photos';
export const STORAGE_FOLDER = 'profiles';