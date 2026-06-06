import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withErrorHandling } from "@/lib/api-utils"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { supplierId, type, amount, description } = body

    const transaction = await db.$transaction(async (tx) => {
      const t = await tx.supplierTransaction.create({
        data: {
          supplierId,
          type,
          amount: parseFloat(amount),
          description,
        }
      })

      // Update supplier totals
      const supplier = await tx.supplier.findUnique({ where: { id: supplierId } })
      if (supplier) {
        let newPaid = supplier.totalPaid
        let newDebt = supplier.totalDebt

        if (type === 'payment') {
          newPaid += parseFloat(amount)
          newDebt -= parseFloat(amount)
        } else {
          newDebt += parseFloat(amount)
        }

        await tx.supplier.update({
          where: { id: supplierId },
          data: {
            totalPaid: newPaid,
            totalDebt: newDebt,
            lastActivity: new Date()
          }
        })
      }

      return t
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Supplier transaction error:', error)
    return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 })
  }
}
