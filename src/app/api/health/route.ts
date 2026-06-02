import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // 1. Check Database Connection
    const dbCheck = await db.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
    
    // 2. Get System Stats
    const stats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
    };

    const status = dbCheck ? 'healthy' : 'unhealthy';

    if (!dbCheck) {
      logger.error('System Health Check: Database connection failed');
    }

    return NextResponse.json({
      status,
      database: dbCheck ? 'connected' : 'disconnected',
      stats,
    }, { status: dbCheck ? 200 : 503 });
  } catch (error) {
    logger.error('Health Check Error', error);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
