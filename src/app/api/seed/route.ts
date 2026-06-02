import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const categories = [
  {
    id: "cat-flex-banner",
    name: "طباعة فليكس وبانر",
    nameEn: "Flex & Banner Printing",
    icon: "Printer",
    color: "blue",
    sortOrder: 0,
    products: [
      { id: "prod-heavy-banner", name: "بانر تقيل", price: 120, unitType: "meter", deliveryDays: 2, imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800" },
      { id: "prod-light-banner", name: "بانر خفيف", price: 75, unitType: "meter", deliveryDays: 2, imageUrl: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&q=80&w=800" },
      { id: "prod-glossy-vinyl", name: "فنيل لامع", price: 150, unitType: "meter", deliveryDays: 3, imageUrl: "https://images.unsplash.com/photo-1572375927502-1f247ba26e98?auto=format&fit=crop&q=80&w=800" },
    ],
  },
  {
    id: "cat-3d-letters",
    name: "حروف بارزة",
    nameEn: "3D Letters",
    icon: "Box",
    color: "amber",
    sortOrder: 2,
    products: [
      { id: "prod-acrylic-letters", name: "حروف أكريليك", price: 45, unitType: "letter", deliveryDays: 5, imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=800" },
      { id: "prod-stainless-letters", name: "حروف ستانلس ستيل", price: 120, unitType: "letter", deliveryDays: 7, imageUrl: "https://images.unsplash.com/photo-1563245332-692146e10db1?auto=format&fit=crop&q=80&w=800" },
    ],
  },
  {
    id: "cat-paper-prints",
    name: "مطبوعات ورقية",
    nameEn: "Paper Prints",
    icon: "FileText",
    color: "amber",
    sortOrder: 4,
    products: [
      { id: "prod-business-cards", name: "كروت شخصية", price: 800, unitType: "piece", deliveryDays: 3, imageUrl: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6?auto=format&fit=crop&q=80&w=800" },
      { id: "prod-brochures", name: "روشيتات", price: 3000, unitType: "piece", deliveryDays: 5, imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800" },
    ],
  },
];

export async function GET() {
  try {
    // Clear existing data
    await db.product.deleteMany();
    await db.category.deleteMany();

    for (const cat of categories) {
      const createdCategory = await db.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          nameEn: cat.nameEn,
          icon: cat.icon,
          color: cat.color,
          sortOrder: cat.sortOrder,
        },
      });

      for (const prod of cat.products) {
        await db.product.create({
          data: {
            id: prod.id,
            name: prod.name,
            price: prod.price,
            unitType: prod.unitType,
            deliveryDays: prod.deliveryDays,
            imageUrl: prod.imageUrl,
            categoryId: createdCategory.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "تم تحديث البيانات بنجاح!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
