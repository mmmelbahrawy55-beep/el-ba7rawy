import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Robust DB initialization with error handling
const getPrismaClient = () => {
  try {
    return new PrismaClient({
      log: ['error'],
    });
  } catch (error) {
    console.error("Prisma Initialization Failed:", error);
    return null;
  }
};

export const db = globalForPrisma.prisma ?? getPrismaClient()!;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db as any;
