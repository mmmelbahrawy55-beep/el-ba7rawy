import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { withErrorHandling } from '../../../lib/api-utils'

type RouteContext = {
  params: Promise<{ id: string }>
}

export const PUT = withErrorHandling(async (request: Request, context: RouteContext) => {
  const { id } = await context.params
  const body = await request.json()

  const { name, nameEn, icon, color, isActive, sortOrder } = body as {
    name?: string
    nameEn?: string
    icon?: string
    color?: string
    isActive?: boolean
    sortOrder?: number
  }

  const category = await db.category.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(nameEn !== undefined && { nameEn }),
      ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  })

  return NextResponse.json(category)
})

export const DELETE = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const { id } = await context.params

  // Check if category has products
  const productCount = await db.product.count({ where: { categoryId: id } })
  if (productCount > 0) {
    return NextResponse.json(
      { error: `لا يمكن حذف التصنيف لأنه يحتوي على ${productCount} منتج` },
      { status: 400 }
    )
  }

  await db.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
})
