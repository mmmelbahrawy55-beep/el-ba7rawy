import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const faqs = await db.faq.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })
    return NextResponse.json(faqs)
  } catch (error) {
    console.error("API FAQs Error:", error);
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    
    if (id) {
      const faq = await db.faq.update({
        where: { id },
        data
      })
      return NextResponse.json(faq)
    }

    const faq = await db.faq.create({ data })
    return NextResponse.json(faq)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save faq' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.faq.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete faq' }, { status: 500 })
  }
}
