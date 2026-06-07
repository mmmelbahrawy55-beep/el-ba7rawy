import { PrismaClient } from '@prisma/client'

async function diagnose() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_URL;
  
  console.log('--- Database Diagnostic ---');
  console.log('Time:', new Date().toLocaleString());
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('NEON_URL present:', !!process.env.NEON_URL);
  
  if (!dbUrl) {
    console.error('ERROR: No database connection string found in environment variables.');
    console.log('Please add DATABASE_URL to your .env file.');
    return;
  }

  console.log('Attempting to connect to database...');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - startTime;
    console.log('SUCCESS: Database connection established!');
    console.log(`Latency: ${duration}ms`);
    
    const categoryCount = await prisma.category.count();
    console.log(`Database content: ${categoryCount} categories found.`);
    
  } catch (error: any) {
    console.error('FAILURE: Could not connect to database.');
    console.error('Error message:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n--- DIAGNOSIS ---');
      console.log('The database server is unreachable. This usually means:');
      console.log('1. Your Supabase project is PAUSED. Go to https://supabase.com and resume it.');
      console.log('2. The hostname is incorrect or has changed.');
      console.log('3. Your current network (ISP/Firewall) is blocking port 5432.');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n--- DIAGNOSIS ---');
      console.log('Invalid password or username. Check your connection string.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
