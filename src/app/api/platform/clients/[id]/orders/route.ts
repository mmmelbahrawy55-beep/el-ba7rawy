import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json()
    const { id: clientId } = await params

    const order = await db.order.create({
      data: {
        clientId,
        customerName: '', // Will be updated if needed or handled by relation
        phone: '',        // Will be updated if needed
        productName: body.productName,
        categoryName: body.categoryName || 'General',
        quantity: body.quantity,
        size: body.size,
        details: body.details,
        estimatedPrice: body.estimatedPrice ? parseFloat(body.estimatedPrice) : 0,
        status: 'pending'
      }
    })

    // Update client stats
    await db.client.update({
      where: { id: clientId },
      data: {
        totalOrders: { increment: 1 },
        lastActivity: new Date()
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Add order error:', error)
    return NextResponse.json({ error: 'Failed to add order' }, { status: 500 })
  }
}
