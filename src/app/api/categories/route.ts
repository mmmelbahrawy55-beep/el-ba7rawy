import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
        products: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            price: true,
            unitType: true,
            deliveryDays: true,
            createdAt: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Transform to include parentCategoryId safely if it exists in the model
    const transformed = categories.map(cat => ({
      ...cat,
      parentCategoryId: (cat as any).parentCategoryId || null
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, nameEn, icon, color, isActive, sortOrder } = body as {
      name: string;
      nameEn: string;
      icon?: string;
      color?: string;
      isActive?: boolean;
      sortOrder?: number;
    };

    if (!name || !nameEn) {
      return NextResponse.json(
        { error: "name and nameEn are required" },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        nameEn,
        icon: icon ?? "Printer",
        color: color ?? "blue",
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
