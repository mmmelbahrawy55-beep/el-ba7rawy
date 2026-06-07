// Universal Database Client - Production Optimized
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Final Production Database Client - Neon Optimized
const dbUrl = process.env.NEON_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (!dbUrl && process.env.NODE_ENV === 'production') {
  console.warn("WARNING: No database connection string found in environment variables.");
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
  datasources: dbUrl ? {
    db: {
      url: dbUrl
    }
  } : undefined
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db as any;
