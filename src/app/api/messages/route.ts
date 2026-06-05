import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { withErrorHandling } from "../../../lib/api-utils";

export const GET = withErrorHandling(async () => {
  const messages = await db.message.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(messages, {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
});

export const PATCH = withErrorHandling(async (request: Request) => {
  const { id, status } = await request.json();
  const message = await db.message.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(message);
});

export const DELETE = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await db.message.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
