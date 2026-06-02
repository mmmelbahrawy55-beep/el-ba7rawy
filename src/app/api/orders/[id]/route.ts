import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const {
      customerName,
      phone,
      productName,
      categoryName,
      quantity,
      size,
      details,
      estimatedPrice,
      deliveryDays,
      status,
      productId,
    } = body as {
      customerName?: string;
      phone?: string;
      productName?: string;
      categoryName?: string;
      quantity?: string | null;
      size?: string | null;
      details?: string | null;
      estimatedPrice?: number | null;
      deliveryDays?: number;
      status?: string;
      productId?: string | null;
    };

    if (status) {
      const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
    }

    const order = await db.order.update({
      where: { id },
      data: {
        ...(customerName !== undefined && { customerName }),
        ...(phone !== undefined && { phone }),
        ...(productName !== undefined && { productName }),
        ...(categoryName !== undefined && { categoryName }),
        ...(quantity !== undefined && { quantity }),
        ...(size !== undefined && { size }),
        ...(details !== undefined && { details }),
        ...(estimatedPrice !== undefined && { estimatedPrice }),
        ...(deliveryDays !== undefined && { deliveryDays }),
        ...(status !== undefined && { status }),
        ...(productId !== undefined && { productId }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await db.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
