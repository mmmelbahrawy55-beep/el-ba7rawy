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
  // Use absolute path for SQLite to avoid issues on Vercel/Windows
  const dbPath = path.resolve(process.cwd(), 'prisma/dev.db')
  prismaOptions.datasources = {
    db: {
      url: `file:${dbPath}`
    }
  }
}

// Ensure DATABASE_URL is present in non-static builds
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.warn('⚠️ WARNING: DATABASE_URL is missing in production environment. Admin features will not work.');
}

export const db = globalForPrisma.prisma ?? new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
