import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories as fallbackCategories } from "@/lib/products-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    let categories = await db.category.findMany({
      where: isAdmin ? {} : { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
        products: {
          where: isAdmin ? {} : { isAvailable: true },
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            price: true,
            unitType: true,
            deliveryDays: true,
            isHot: true,
            discount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // If DB is empty and not admin, return fallback data
    if (categories.length === 0 && !isAdmin) {
      // Map fallback categories to the expected format
      return NextResponse.json(fallbackCategories.map(cat => ({
        ...cat,
        _count: { products: cat.products.length },
        products: cat.products.map(p => ({
          ...p,
          price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
          unitType: p.priceUnit,
          isAvailable: p.isActive,
        }))
      })));
    }

    // Transform to include parentCategoryId safely if it exists in the model
    const transformed = categories.map(cat => ({
      ...cat,
      parentCategoryId: (cat as any).parentCategoryId || null
    }));

    return NextResponse.json(transformed, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
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
