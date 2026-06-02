import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const faqs = await db.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })
    return NextResponse.json(faqs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch faqs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const faq = await db.fAQ.create({ data: body })
    return NextResponse.json(faq)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create faq' }, { status: 500 })
  }
}
