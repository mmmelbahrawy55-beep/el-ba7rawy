import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { categories } from "../../../lib/products-data";
import { withErrorHandling } from "@/lib/api-utils";

export const GET = withErrorHandling(async () => {
  // Clear existing data
  await db.product.deleteMany();
  await db.category.deleteMany();

    // Create Main Categories first
    const mainCategories = categories.filter(c => !c.parentCategoryId);
    const subCategories = categories.filter(c => c.parentCategoryId);

    for (const cat of mainCategories) {
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
    }

    // Create Sub Categories and their products
    for (const cat of subCategories) {
      const createdCategory = await db.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          nameEn: cat.nameEn,
          icon: cat.icon,
          color: cat.color,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
          parentCategoryId: cat.parentCategoryId,
        },
      });

      for (const prod of cat.products) {
        // Map price from various fields to a single 'price' field
        const price = prod.pricePerMeter ?? prod.pricePerLetter ?? prod.pricePerThousand ?? prod.priceFlat ?? 0;
        
        await db.product.create({
          data: {
            id: prod.id,
            name: prod.name,
            nameEn: prod.nameEn,
            description: prod.description,
            price: price,
            unitType: prod.priceUnit,
            deliveryDays: prod.deliveryDays,
            imageUrl: prod.imageUrl,
            categoryId: createdCategory.id,
            isAvailable: prod.isActive,
            sortOrder: prod.sortOrder,
            isHot: prod.isHot ?? false,
            discount: prod.discount ?? null,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "تم تحديث البيانات بنجاح من ملف البيانات المدمج!" });
});
