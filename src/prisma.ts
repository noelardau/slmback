import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; 
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 

// Charger les variables d'environnement depuis le fichier .env
dotenv.config({ path: join(__dirname, '../.env') });

const prisma = new PrismaClient();


export default prisma;