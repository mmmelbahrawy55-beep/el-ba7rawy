import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories as fallbackCategories } from "@/lib/products-data";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    let categories: any[] = [];
    try {
      categories = await db.category.findMany({
        where: isAdmin ? {} : { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
    } catch (err) {
      console.log("Firestore categories fetch failed");
    }

    if (!categories || categories.length === 0) {
      categories = fallbackCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        nameEn: cat.nameEn,
        icon: cat.icon,
        color: cat.color,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive ?? true,
        _count: { products: (cat.products || []).length },
        products: (cat.products || []).map(p => ({
          id: p.id,
          name: p.name,
          nameEn: p.nameEn,
          description: p.description,
          price: (p as any).pricePerMeter ?? (p as any).pricePerLetter ?? (p as any).pricePerThousand ?? (p as any).priceFlat ?? 0,
          unitType: (p as any).priceUnit,
          isAvailable: p.isActive,
        })),
      }));
    }

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json([]);
  }
});

export const POST = withErrorHandling(async (req: Request) => {
  try {
    const body = await req.json();
    const { name, nameEn, icon, color, sortOrder, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    }

    const category = await db.category.create({
      data: {
        id: `cat-${Date.now()}`,
        name,
        nameEn: nameEn || name,
        icon: icon || "Printer",
        color: color || "blue",
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
});
