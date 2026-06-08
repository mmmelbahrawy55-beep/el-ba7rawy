// Universal Database Client - Production Optimized
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Final Production Database Client - Hardcoded Neon URL as a final fix to bypass Vercel environment issues
const NEON_DIRECT_URL = "postgresql://neondb_owner:npg_Y8qt2gvcK1rf@ep-aged-bird-a4pher4ma-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";
const dbUrl = NEON_DIRECT_URL;

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
