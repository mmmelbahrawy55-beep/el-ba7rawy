import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { nameEn: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const products = await db.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, nameEn: true, icon: true, color: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    // Map isAvailable to isActive for frontend consistency
    const mappedProducts = products.map(p => ({
      ...p,
      isActive: p.isAvailable
    }));

    return NextResponse.json(mappedProducts);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      categoryId,
      name,
      nameEn,
      description,
      imageUrl,
      price,
      unitType,
      deliveryDays,
      isActive,
      sortOrder,
    } = body as {
      categoryId: string;
      name: string;
      nameEn: string;
      description?: string;
      imageUrl?: string;
      price: number;
      unitType?: string;
      deliveryDays?: number;
      isActive?: boolean;
      sortOrder?: number;
    };

    if (!categoryId || !name || !nameEn) {
      return NextResponse.json(
        { error: "categoryId, name, and nameEn are required" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        categoryId,
        name,
        nameEn: nameEn ?? "",
        description: description ?? "",
        imageUrl: imageUrl ?? "",
        price: Number(price) || 0,
        unitType: unitType ?? "meter",
        deliveryDays: deliveryDays ?? 3,
        isAvailable: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        category: {
          select: { id: true, name: true, nameEn: true, icon: true, color: true },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
