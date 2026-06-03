import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const logs = await db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Show last 100 activities
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const log = await db.activityLog.create({ data: body });
    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}
