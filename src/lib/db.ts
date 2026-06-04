import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] as any : ['error'] as any,
  errorFormat: 'pretty' as any,
}

// Ensure DATABASE_URL is present in non-static builds
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.warn('⚠️ WARNING: DATABASE_URL is missing in production environment. Admin features will not work.');
}

export const db = globalForPrisma.prisma ?? new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
