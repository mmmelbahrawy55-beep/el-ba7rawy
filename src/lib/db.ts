import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] as any : ['error'] as any,
  errorFormat: 'minimal' as any,
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Optional: Test connection on startup in development
if (process.env.NODE_ENV === 'development') {
  db.$connect()
    .then(() => console.log('Successfully connected to the database'))
    .catch((err) => console.error('Failed to connect to the database on startup:', err))
}
