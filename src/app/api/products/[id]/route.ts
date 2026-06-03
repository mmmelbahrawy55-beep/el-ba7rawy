import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
