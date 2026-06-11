import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories as fallbackCategories } from "@/lib/products-data";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    // Try to get from Firestore
    let categories: any[] = [];
    try {
      categories = await db.category.findMany({
        where: isAdmin ? {} : { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
    } catch (err) {
      console.log("Firestore categories empty or error, using fallback");
    }

    // If no categories in Firestore OR categories exist but need products relationship
    if (!categories || categories.length === 0) {
      // Use fallback categories
      categories = fallbackCategories.map(cat => ({
        ...cat,
        id: cat.id,
        isActive: cat.isActive ?? true,
        sortOrder: cat.sortOrder,
        _count: { products: (cat.products || []).length },
        products: cat.products.map(p => ({
          ...p,
          id: p.id,
          price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
          isAvailable: p.isActive,
        })),
      }));

      // Save the fallback categories to Firestore so next time they're there
      try {
        console.log("Seeding default categories to Firestore...");
        for (const cat of categories) {
          // Check if already exists before creating
          const existing = await db.category.findUnique({ where: { id: cat.id } });
          if (!existing) {
            await db.category.create({
              data: {
                id: cat.id,
                name: cat.name,
                nameEn: cat.nameEn,
                icon: cat.icon,
                color: cat.color,
                sortOrder: cat.sortOrder,
                isActive: cat.isActive,
              },
            });
            // Save products too
            if (cat.products && cat.products.length) {
              for (const prod of cat.products) {
                await db.product.create({
                  data: {
                    id: prod.id,
                    name: prod.name,
                    nameEn: prod.nameEn,
                    description: prod.description,
                    price: prod.pricePerMeter ?? prod.pricePerLetter ?? prod.pricePerThousand ?? prod.priceFlat ?? 0,
                    priceUnit: prod.priceUnit,
                    unitType: prod.priceUnit,
                    deliveryDays: prod.deliveryDays,
                    imageUrl: prod.imageUrl,
                    categoryId: cat.id,
                    isAvailable: prod.isActive,
                    isActive: prod.isActive,
                    sortOrder: prod.sortOrder,
                    isHot: prod.isHot ?? false,
                    discount: prod.discount ?? null,
                  },
                });
              }
            }
          }
        }
      } catch (seedErr) {
        console.log("Seeding Firestore failed, but will show fallback data anyway:", seedErr);
      }
    }

    return NextResponse.json(categories, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error("API Categories GET Error:", error);
    return NextResponse.json(fallbackCategories.map(cat => ({
      ...cat,
      id: cat.id,
      isActive: cat.isActive ?? true,
      _count: { products: (cat.products || []).length },
      products: (cat.products || []).map(p => ({
        ...p,
        id: p.id,
        price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
        unitType: p.priceUnit,
        isAvailable: p.isActive,
      })),
    })), {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
});

export const POST = withErrorHandling(async (req: Request) => {
  try {
    console.log("POST /api/categories - Start");
    const body = await req.json();
    const { name, nameEn, icon, color, sortOrder, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "الاسم بالعربية مطلوب" }, { status: 400 });
    }

    const finalNameEn = nameEn || name;
    const newId = `cat-${Date.now()}`;

    console.log("Creating category in Firestore:", newId);
    const createdCat = await db.category.create({
      data: {
        id: newId,
        name: name,
        nameEn: finalNameEn,
        icon: icon || "Printer",
        color: color || "blue",
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
      },
    });

    console.log("Successfully created category:", createdCat);
    return NextResponse.json({
      ...createdCat,
      _count: { products: 0 },
      products: [],
    });
  } catch (error) {
    console.error("POST /api/categories Error:", error);
    return NextResponse.json({ error: "فشل إضافة التصنيف" }, { status: 500 });
  }
});