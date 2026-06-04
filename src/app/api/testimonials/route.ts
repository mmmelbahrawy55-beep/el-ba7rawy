import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(testimonials, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error) {
    console.error("API Testimonials Error:", error);
    // Return empty array instead of 500 error
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
      const testimonial = await db.testimonial.update({
        where: { id },
        data
      })
      return NextResponse.json(testimonial)
    }

    const testimonial = await db.testimonial.create({ data })
    return NextResponse.json(testimonial)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save testimonial' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
  }
}
