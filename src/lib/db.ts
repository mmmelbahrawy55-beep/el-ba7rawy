import { PrismaClient } from '@prisma/client'

const dbUrl = "postgresql://neondb_owner:npg_Y8qt2gvcK1rf@ep-aged-bird-a4pher4ma.us-east-1.aws.neon.tech/neondb?sslmode=require";

export const db = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
})
