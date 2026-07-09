import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';
import dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaMariaDb(process.env.DATABASE_URL || '');
const prisma = new PrismaClient({ adapter });

export default prisma;
