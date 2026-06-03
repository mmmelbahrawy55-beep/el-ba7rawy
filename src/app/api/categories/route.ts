import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { categories as fallbackCategories } from "../../../lib/products-data";

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
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    
    if (id) {
      const category = await db.category.update({
        where: { id },
        data: {
          name: data.name,
          nameEn: data.nameEn,
          icon: data.icon,
          color: data.color,
          sortOrder: Number(data.sortOrder) || 0,
          isActive: data.isActive ?? true,
        }
      })
      return NextResponse.json(category)
    }

    const category = await db.category.create({ 
      data: {
        name: data.name,
        nameEn: data.nameEn,
        icon: data.icon ?? "Printer",
        color: data.color ?? "blue",
        sortOrder: Number(data.sortOrder) || 0,
        isActive: data.isActive ?? true,
      }
    })
    return NextResponse.json(category)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save category";
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    // Check if category has products
    const productCount = await db.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return NextResponse.json({ error: 'لا يمكن حذف تصنيف يحتوي على منتجات. قم بنقل المنتجات أولاً.' }, { status: 400 })
    }

    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
