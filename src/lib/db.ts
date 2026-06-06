import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Support for Vercel Neon Postgres and other environments
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.NEON_URL;

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
  datasources: dbUrl ? {
    db: {
      url: dbUrl
    }
  } : undefined
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db as any;
