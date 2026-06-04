import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

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

    let products = await db.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, nameEn: true, icon: true, color: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    // If DB is empty, return fallback data
    if (products.length === 0) {
      const { categories } = await import("../../../lib/products-data");
      let allProducts: any[] = [];
      
      categories.forEach(cat => {
        const catProds = cat.products.map(p => ({
          ...p,
          price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
          unitType: p.priceUnit,
          isAvailable: p.isActive,
          category: {
            id: cat.id,
            name: cat.name,
            nameEn: cat.nameEn,
            icon: cat.icon,
            color: cat.color
          }
        }));
        allProducts = [...allProducts, ...catProds];
      });

      // Filter by category if requested
      if (categoryId) {
        allProducts = allProducts.filter(p => p.categoryId === categoryId);
      }

      // Filter by search if requested
      if (search) {
        const s = search.toLowerCase();
        allProducts = allProducts.filter(p => 
          p.name.includes(s) || 
          p.nameEn.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s)
        );
      }

      return NextResponse.json(allProducts, { 
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    // Map isAvailable to isActive for frontend consistency
    const mappedProducts = products.map((p: any) => ({
      ...p,
      isActive: p.isAvailable
    }));

    return NextResponse.json(mappedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
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
      isHot,
      discount,
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
      isHot?: boolean;
      discount?: string;
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
        isHot: isHot ?? false,
        discount: discount ?? null,
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
