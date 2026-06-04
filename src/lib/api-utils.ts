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

      const isDev = process.env.NODE_ENV === 'development';
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';

      // Special handling for database connection errors
      if (errorMessage.includes('prisma') || errorMessage.includes('database')) {
        return NextResponse.json({
          error: "Database Connection Error",
          message: "فشل الاتصال بقاعدة البيانات. تأكد من صحة رابط DATABASE_URL في إعدادات فيرسل.",
          details: isDev ? errorMessage : undefined,
          requestId,
          timestamp,
        }, { status: 500 });
      }

      return NextResponse.json({
        error: errorMessage,
        message: isDev && error instanceof Error ? error.message : 'حدث خطأ في النظام، يرجى المحاولة لاحقاً',
        stack: isDev && error instanceof Error ? error.stack : undefined,
        requestId,
        timestamp,
      }, { status: 500 });
    }
  };
}
