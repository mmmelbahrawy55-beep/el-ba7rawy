import { NextResponse } from 'next/server';
import { logger } from './logger';

export function withErrorHandling(handler: (request: Request, ...args: any[]) => Promise<NextResponse | Response>) {
  return async (request: Request, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      const timestamp = new Date().toISOString();
      const requestId = Math.random().toString(36).substring(7);
      
      logger.error(`API Error [ID: ${requestId}]`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: request.url,
      });

      return NextResponse.json({
        error: 'Internal Server Error',
        message: 'حدث خطأ في النظام، يرجى المحاولة لاحقاً',
        requestId,
        timestamp,
      }, { status: 500 });
    }
  };
}
