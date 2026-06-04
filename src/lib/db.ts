import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] as any : ['error'] as any,
  errorFormat: 'minimal' as any,
}

// Create a proxy to prevent errors when database is not available
const createSafeDb = () => {
  try {
    return new PrismaClient(prismaOptions)
  } catch (e) {
    console.warn('Database not available, using safe fallback proxy');
    return new Proxy({} as any, {
      get: () => {
        return () => ({
          findMany: async () => [],
          findUnique: async () => null,
          findFirst: async () => null,
          create: async () => ({}),
          update: async () => ({}),
          upsert: async () => ({}),
          delete: async () => ({}),
          count: async () => 0,
        });
      }
    });
  }
}

export const db = globalForPrisma.prisma ?? createSafeDb()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
