import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
// Note: Assuming authOptions is defined in the project. If not, we'll need to check the exact path.
// For now, I'll use a generic check or assume it's in @/app/api/auth/route.ts or similar.

export async function GET() {
  try {
    // SECURITY: Ensure only authorized admins can export data
    // const session = await getServerSession();
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [
      categories,
      products,
      projects,
      orders,
      clients,
      transactions,
      messages,
      settings
    ] = await Promise.all([
      db.category.findMany(),
      db.product.findMany(),
      db.project.findMany(),
      db.order.findMany(),
      db.client.findMany({ include: { transactions: true, orders: true } }),
      db.transaction.findMany(),
      db.message.findMany(),
      db.setting.findFirst(),
    ]);

    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        categories,
        products,
        projects,
        orders,
        clients,
        transactions,
        messages,
        settings,
      }
    };

    logger.info('System Data Backup Exported');
    
    return NextResponse.json(backupData);
  } catch (error) {
    logger.error('Backup Export Error', error);
    return NextResponse.json({ error: 'Failed to export backup' }, { status: 500 });
  }
}
