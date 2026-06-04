import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaOptions: any = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
}

// Add fallback for DATABASE_URL if missing
if (!process.env.DATABASE_URL) {
  // On Windows, sometimes 'file:./prisma/dev.db' or absolute paths work better
  // Let's try the most robust way for Next.js on Windows
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/')
  prismaOptions.datasources = {
    db: {
      url: `file:${dbPath}`
    }
  }
  console.log(`Prisma initialized with DB path: ${dbPath}`);
}

// Ensure DATABASE_URL is present in non-static builds
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.warn('⚠️ WARNING: DATABASE_URL is missing in production environment. Admin features will not work.');
}

export const db = globalForPrisma.prisma ?? new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
