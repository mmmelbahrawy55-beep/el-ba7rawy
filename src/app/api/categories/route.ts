import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories as fallbackCategories } from "@/lib/products-data";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    // Try to get categories from Firestore first
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

    // If nothing from Firestore (or if it's just the fallback), add the seed data too
    if (categories.length < 2) { // If we only have a few or no categories
      const firestoreCatIds = categories.map(c => c.id);
      const missingCats = fallbackCategories.filter(c => !firestoreCatIds.includes(c.id));
      
      // Add missing categories to Firestore if needed
      for (const cat of missingCats) {
        try {
          await db.category.create({ data: {
            id: cat.id,
            name: cat.name,
            nameEn: cat.nameEn,
            icon: cat.icon,
            color: cat.color,
            sortOrder: cat.sortOrder,
            isActive: cat.isActive,
            parentCategoryId: cat.parentCategoryId,
          }});
          
          // Add products for this category too
          for (const prod of cat.products) {
            await db.product.create({ data: {
              id: prod.id,
              name: prod.name,
              nameEn: prod.nameEn,
              description: prod.description,
              price: prod.pricePerMeter ?? prod.pricePerLetter ?? prod.pricePerThousand ?? prod.priceFlat ?? 0,
              unitType: prod.priceUnit,
              deliveryDays: prod.deliveryDays,
              imageUrl: prod.imageUrl,
              categoryId: cat.id,
              isAvailable: prod.isActive,
              sortOrder: prod.sortOrder,
              isHot: prod.isHot ?? false,
              discount: prod.discount ?? null,
            }});
          }
        } catch (e) {
          // Silently fail if already exists
          console.log("Category already exists in Firestore, skipping:", cat.id);
        }
      }
      
      // Refetch now that we might have added them
      categories = await db.category.findMany({
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
    }

    // Final transformation to make sure everything is good
    const transformed = categories.map(cat => ({
      ...cat,
      parentCategoryId: (cat as any).parentCategoryId || null,
      products: cat.products || [],
      _count: cat._count || { products: (cat.products || []).length }
    }));

    return NextResponse.json(transformed, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error("API Categories GET Error:", error);
    return NextResponse.json(fallbackCategories.map(cat => ({
      ...cat,
      _count: { products: cat.products.length },
      products: cat.products.map(p => ({
        ...p,
        price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
        unitType: p.priceUnit,
        isAvailable: p.isActive,
      }))
    })), {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
});

export const POST = withErrorHandling(async (req: Request) => {
  try {
    console.log("POST /api/categories - Start");
    const body = await req.json()
    console.log("POST /api/categories - Body:", body);
    const { name, nameEn, icon, color, sortOrder, isActive } = body
    
    if (!name) {
      return NextResponse.json({ error: "الاسم بالعربية مطلوب" }, { status: 400 })
    }

    const finalNameEn = nameEn || name;

    console.log("POST /api/categories - Attempting DB create");
    const category = await db.category.create({ 
      data: {
        name: name,
        nameEn: finalNameEn,
        icon: icon || "Printer",
        color: color || "blue",
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
      }
    })
    console.log("POST /api/categories - Success:", category.id);
    return NextResponse.json(category);
  } catch (error) {
    console.error("POST /api/categories Error:", error);
    return NextResponse.json({ error: "فشل إضافة التصنيف" }, { status: 500 });
  }
})