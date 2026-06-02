import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(testimonials)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const testimonial = await db.testimonial.create({ data: body })
    return NextResponse.json(testimonial)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}
