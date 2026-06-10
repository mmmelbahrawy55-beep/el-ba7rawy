import { PrismaClient } from '@prisma/client'

// Final Local SQLite Solution for 100% Stability on Vercel
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
