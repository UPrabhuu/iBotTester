// Prisma client singleton
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Create a global variable to hold the Prisma client instance
declare global {
  var prisma: PrismaClient | undefined;
  var pgPool: pg.Pool | undefined;
}

// Create PostgreSQL pool (singleton)
if (!global.pgPool) {
  global.pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

const pool = global.pgPool;
const adapter = new PrismaPg(pool);

// Create the Prisma client singleton
export const prisma = global.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, save the client to the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

export default prisma;
