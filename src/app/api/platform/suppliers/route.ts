import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      include: {
        transactions: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(suppliers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, phone, category, paidAmount, remainingAmount } = body

    const supplier = await db.$transaction(async (tx) => {
      const s = await tx.supplier.create({
        data: {
          name,
          phone,
          category: category || "عام",
          totalPaid: parseFloat(paidAmount) || 0,
          totalDebt: parseFloat(remainingAmount) || 0,
        }
      })

      // Create initial payment transaction if exists
      if (parseFloat(paidAmount) > 0) {
        await tx.supplierTransaction.create({
          data: {
            supplierId: s.id,
            type: 'payment',
            amount: parseFloat(paidAmount),
            description: 'دفعة افتتاحية مسددة للمورد',
          }
        })
      }

      // Create initial debt transaction if exists
      if (parseFloat(remainingAmount) > 0) {
        await tx.supplierTransaction.create({
          data: {
            supplierId: s.id,
            type: 'debt',
            amount: parseFloat(remainingAmount),
            description: 'مديونية افتتاحية للمورد',
          }
        })
      }

      return s
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Create supplier error:', error)
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
  }
}
