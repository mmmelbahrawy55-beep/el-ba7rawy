import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { categories as fallbackCategories } from "../../../lib/products-data";
import { withErrorHandling } from "../../../lib/api-utils";

export const GET = withErrorHandling(async (request: Request) => {
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

    if (categories.length === 0 && !isAdmin) {
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
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }

    const transformed = categories.map(cat => ({
      ...cat,
      parentCategoryId: (cat as any).parentCategoryId || null
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
    return NextResponse.json(category)
  } catch (error: any) {
    console.error("CRITICAL: Category Creation Error:", error);
    
    let detailedError = "حدث خطأ أثناء الاتصال بقاعدة البيانات";
    if (error.code === 'P1001') detailedError = "لا يمكن الوصول لسيرفر قاعدة البيانات (Supabase). يرجى التأكد من تشغيل المشروع في Supabase.";
    if (error.code === 'P2002') detailedError = "هذا الاسم موجود بالفعل في قاعدة البيانات.";
    if (error.message?.includes("authentication failed")) detailedError = "فشل التحقق من كلمة سر قاعدة البيانات. يرجى مراجعة DATABASE_URL في Vercel.";
    
    return NextResponse.json({ 
      error: detailedError,
      technical: error.message,
      code: error.code 
    }, { status: 500 });
  }
});
