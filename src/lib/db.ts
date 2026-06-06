import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
  datasources: dbUrl ? {
    db: {
      url: dbUrl
    }
  } : undefined
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db as any;
