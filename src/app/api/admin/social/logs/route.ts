import { NextResponse } from 'next/server'
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [logs, summary] = await Promise.all([
      db.socialLinkingLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      db.socialLinkingLog.groupBy({
        by: ['status'],
        _count: { _all: true }
      })
    ]);

    const summaryData = {
      success: summary.find(s => s.status === 'success')?._count._all || 0,
      failed: summary.find(s => s.status === 'failure')?._count._all || 0,
      total: summary.reduce((acc, curr) => acc + curr._count._all, 0)
    };

    return NextResponse.json({ logs, summary: summaryData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
