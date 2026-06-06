import { NextResponse } from 'next/server'
import { db } from '@/lib/db';

export async function GET() {
  try {
    const account = await db.socialAccount.findFirst({
      where: { platform: 'facebook', isActive: true },
      select: {
        id: true,
        accountName: true,
        profilePicture: true,
        grantedScopes: true,
        missingScopes: true,
        lastVerified: true,
      }
    });

    if (!account) {
      return NextResponse.json({ linked: false });
    }

    return NextResponse.json({
      linked: true,
      account,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
