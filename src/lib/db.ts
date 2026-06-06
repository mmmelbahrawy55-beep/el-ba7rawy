// Universal Database Client - Final Production Build
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Support all possible Vercel/Neon variable names
const dbUrl = process.env.DATABASE_URL || process.env.NEON_URL || process.env.POSTGRES_PRISMA_URL;

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: dbUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db as any;
