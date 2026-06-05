import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { withErrorHandling } from "../../../../lib/api-utils";

export const GET = withErrorHandling(async () => {
  const logs = await db.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, // Show last 100 activities
  });
  return NextResponse.json(logs, {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
});

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();
  const log = await db.activityLog.create({ data: body });
  return NextResponse.json(log);
});
