import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { logger } from '../../../../lib/logger';
import { withErrorHandling } from '../../../../lib/api-utils';

export const GET = withErrorHandling(async () => {
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
  
  return NextResponse.json(backupData, {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
});
