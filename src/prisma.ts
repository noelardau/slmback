import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({
  connectionString: connectionString || 'postgresql://admin:admin@localhost:5432/slmnt',
});

const prisma = new PrismaClient({ adapter });

export default prisma;