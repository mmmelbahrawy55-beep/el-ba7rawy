// Universal Database Client - Production Optimized
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Final Production Database Client - Vercel/Neon/Supabase Optimized
// We prioritize NEON_URL and POSTGRES_URL to avoid the old Supabase DATABASE_URL if it still exists in Vercel
const dbUrl = process.env.NEON_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

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
