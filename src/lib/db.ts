import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Initializing Prisma Client for Cloud Database (PostgreSQL)
// Optimized for Vercel Serverless Functions
const prismaOptions: any = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
}

// Add connection pooling and timeout settings for stability
export const db = globalForPrisma.prisma ?? new PrismaClient({
  ...prismaOptions,
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})
.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now();
        try {
          return await query(args);
        } catch (error: any) {
          console.error(`Prisma Error [${model}.${operation}]:`, error.message);
          throw error;
        } finally {
          const end = Date.now();
          if (end - start > 1000) {
            console.warn(`Slow Query [${model}.${operation}]: ${end - start}ms`);
          }
        }
      },
    },
  },
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
