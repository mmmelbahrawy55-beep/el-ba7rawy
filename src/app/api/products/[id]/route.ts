import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { withErrorHandling } from "../../../lib/api-utils";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const { id } = await context.params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true, nameEn: true, icon: true, color: true },
      },
      _count: {
        select: { orders: true },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    isActive: product.isAvailable
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
});

export const PUT = withErrorHandling(async (request: Request, context: RouteContext) => {
  const { id } = await context.params;
  const body = await request.json();

    const {
      name,
      nameEn,
      description,
      imageUrl,
      price,
      unitType,
      deliveryDays,
      isActive,
      sortOrder,
      categoryId,
      isHot,
      discount,
    } = body as {
      name?: string;
      nameEn?: string;
      description?: string;
      imageUrl?: string;
      price?: number;
      unitType?: string;
      deliveryDays?: number;
      isActive?: boolean;
      sortOrder?: number;
      categoryId?: string;
      isHot?: boolean;
      discount?: string;
    };

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(price !== undefined && { price: Number(price) }),
        ...(unitType !== undefined && { unitType }),
        ...(deliveryDays !== undefined && { deliveryDays }),
        ...(isActive !== undefined && { isAvailable: isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isHot !== undefined && { isHot }),
        ...(discount !== undefined && { discount }),
      },
      include: {
        category: {
          select: { id: true, name: true, nameEn: true, icon: true, color: true },
        },
      },
    });

    return NextResponse.json(product);
});

export const DELETE = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const { id } = await context.params;

  await db.product.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
});
