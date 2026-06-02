import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const accounts = await db.socialAccount.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const account = await db.socialAccount.create({
      data: body
    })
    return NextResponse.json(account)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
