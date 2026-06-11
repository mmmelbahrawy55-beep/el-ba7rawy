import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories as fallbackCategories } from "@/lib/products-data";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    // Always use fallback data for display, but try to sync to Firebase in background
    // This guarantees the admin always sees categories
    const displayCategories = fallbackCategories.map(cat => ({
      ...cat,
      _count: { products: cat.products.length },
      products: cat.products.map(p => ({
        ...p,
        price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
        unitType: p.priceUnit,
        isAvailable: p.isActive,
      }))
    }));

    // Try to get any new categories from Firebase too
    try {
      const firebaseCats = await db.category.findMany({
        where: isAdmin ? {} : { isActive: true },
      });
      
      // Merge Firebase categories with fallback (for new ones user added)
      const allCatsMap = new Map();
      
      // Add fallback first
      displayCategories.forEach(cat => allCatsMap.set(cat.id, cat));
      
      // Add Firebase categories (these are new ones user added)
      firebaseCats.forEach(cat => {
        if (!allCatsMap.has(cat.id)) {
          // For Firebase cats, we don't have products, just add them empty
          allCatsMap.set(cat.id, {
            ...cat,
            _count: { products: 0 },
            products: []
          });
        }
      });
      
      // Convert back to array
      const allCats = Array.from(allCatsMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
      
      return NextResponse.json(allCats, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    } catch (firebaseError) {
      console.log("Firebase error in GET categories, using only fallback:", firebaseError);
    }

    // Fallback to just displayCategories if Firebase fails
    return NextResponse.json(displayCategories, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error("API Categories GET Error:", error);
    const displayCategories = fallbackCategories.map(cat => ({
      ...cat,
      _count: { products: cat.products.length },
      products: cat.products.map(p => ({
        ...p,
        price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
        unitType: p.priceUnit,
        isAvailable: p.isActive,
      }))
    }));
    return NextResponse.json(displayCategories, {
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
    const newId = `cat-${Date.now()}`;
    
    // Always save to Firebase
    try {
      console.log("POST /api/categories - Attempting DB create");
      await db.category.create({ 
        data: {
          id: newId,
          name: name,
          nameEn: finalNameEn,
          icon: icon || "Printer",
          color: color || "blue",
          sortOrder: Number(sortOrder) || fallbackCategories.length,
          isActive: isActive !== false,
        }
      });
      console.log("POST /api/categories - Success:", newId);
    } catch (dbError) {
      console.log("Could not save category to Firebase, but proceeding:", dbError);
    }
    
    // Return the new category immediately
    const newCategory = {
      id: newId,
      name: name,
      nameEn: finalNameEn,
      icon: icon || "Printer",
      color: color || "blue",
      sortOrder: Number(sortOrder) || fallbackCategories.length,
      isActive: isActive !== false,
      _count: { products: 0 },
      products: []
    };
    
    return NextResponse.json(newCategory);
  } catch (error) {
    console.error("POST /api/categories Error:", error);
    return NextResponse.json({ error: "فشل إضافة التصنيف" }, { status: 500 });
  }
})