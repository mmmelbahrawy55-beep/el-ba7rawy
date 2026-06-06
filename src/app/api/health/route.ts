import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // 1. Check Database Connection
    const startTime = Date.now();
    let dbStatus = 'disconnected';
    let dbLatency = 0;
    
    try {
      await db.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      dbLatency = Date.now() - startTime;
    } catch (e: any) {
      dbStatus = `error: ${e.message}`;
    }
    
    // 2. Check Environment Variables
    const requiredEnv = [
      'DATABASE_URL',
      'ADMIN_EMAIL',
      'ADMIN_PASSWORD',
      'GEMINI_API_KEY'
    ];
    
    const envStatus: Record<string, boolean> = {};
    requiredEnv.forEach(env => {
      envStatus[env] = !!process.env[env];
    });

    // 3. Get System Stats
    const stats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
    };

    const isHealthy = dbStatus === 'connected';

    if (!isHealthy) {
      logger.error('System Health Check: Database connection failed');
    }

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`
      },
      environment: envStatus,
      stats,
    }, { status: isHealthy ? 200 : 503 });
  } catch (error: any) {
    logger.error('Health Check Error', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}
