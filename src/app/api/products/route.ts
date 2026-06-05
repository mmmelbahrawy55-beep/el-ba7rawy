import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { withErrorHandling } from "../../../lib/api-utils";

export const GET = withErrorHandling(async (request: Request) => {
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

  try {
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
          'Cache-Control': 'no-store, max-age=0',
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
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error("API Products Error:", error);
    // Return fallback data on error
    const { categories } = await import("../../../lib/products-data");
    let allProducts: any[] = [];
    categories.forEach(cat => {
      const catProds = cat.products.map(p => ({
        ...p,
        price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
        unitType: p.priceUnit,
        isAvailable: p.isActive,
        category: { id: cat.id, name: cat.name, nameEn: cat.nameEn, icon: cat.icon, color: cat.color }
      }));
      allProducts = [...allProducts, ...catProds];
    });
    if (categoryId) allProducts = allProducts.filter(p => p.categoryId === categoryId);
    return NextResponse.json(allProducts, { headers: { 'Cache-Control': 'no-store' } });
  }
});

export const POST = withErrorHandling(async (request: Request) => {
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

    if (!categoryId || !name) {
      return NextResponse.json(
        { error: "categoryId and name are required" },
        { status: 400 }
      );
    }

    const finalNameEn = nameEn || name;

    const product = await db.product.create({
      data: {
        categoryId,
        name,
        nameEn: finalNameEn,
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
});

export const PATCH = withErrorHandling(async (request: Request) => {
  const body = await request.json();
  const { id, ...data } = body;
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const product = await db.product.update({
    where: { id },
    data,
    include: {
      category: {
        select: { id: true, name: true, nameEn: true, icon: true, color: true },
      },
    },
  });

  return NextResponse.json(product);
});
