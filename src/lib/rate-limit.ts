import { NextResponse } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(request: Request, limit: number = 100, windowMs: number = 60000) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return null;
  }

  const data = rateLimitMap.get(ip);

  if (now - data.lastReset > windowMs) {
    data.count = 1;
    data.lastReset = now;
    return null;
  }

  data.count++;

  if (data.count > limit) {
    return NextResponse.json({
      error: 'Too Many Requests',
      message: 'لقد تجاوزت حد الطلبات المسموح به، يرجى المحاولة لاحقاً',
    }, { status: 429 });
  }

  return null;
}
