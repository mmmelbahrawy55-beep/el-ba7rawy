import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getAllProducts } from "../../../lib/products-data";

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

    // If DB is empty and no filters, auto-seed or return fallback
    if (products.length === 0 && !categoryId && !search) {
      try {
        // Only auto-seed if we are in admin mode or explicitly requested
        const isAdmin = searchParams.get("admin") === "true";
        if (isAdmin) {
          console.log("Auto-seeding products as DB is empty...");
          const { categories } = await import("@/lib/products-data");
          
          for (const cat of categories) {
            // Check if category exists
            let dbCat = await db.category.findUnique({ where: { id: cat.id } });
            if (!dbCat) {
              dbCat = await db.category.create({
                data: {
                  id: cat.id,
                  name: cat.name,
                  nameEn: cat.nameEn,
                  icon: cat.icon,
                  color: cat.color,
                  sortOrder: cat.sortOrder,
                  isActive: cat.isActive,
                }
              });
            }

            for (const prod of cat.products) {
              const price = prod.pricePerMeter ?? prod.pricePerLetter ?? prod.pricePerThousand ?? prod.priceFlat ?? 0;
              await db.product.upsert({
                where: { id: prod.id },
                update: {},
                create: {
                  id: prod.id,
                  name: prod.name,
                  nameEn: prod.nameEn,
                  description: prod.description,
                  price: price,
                  unitType: prod.priceUnit,
                  deliveryDays: prod.deliveryDays,
                  imageUrl: prod.imageUrl,
                  categoryId: cat.id,
                  isAvailable: prod.isActive,
                  sortOrder: prod.sortOrder,
                  isHot: prod.isHot ?? false,
                  discount: prod.discount ?? null,
                }
              });
            }
          }
          
          // Re-fetch products after seeding
          products = await db.product.findMany({
            where,
            include: {
              category: {
                select: { id: true, name: true, nameEn: true, icon: true, color: true },
              },
            },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          });
        } else {
          const { getAllProducts } = await import("@/lib/products-data");
          const fallback = getAllProducts().map((p: any) => ({
            ...p,
            price: p.pricePerMeter ?? p.pricePerLetter ?? p.pricePerThousand ?? p.priceFlat ?? 0,
            unitType: p.priceUnit,
            isAvailable: p.isActive,
            isActive: p.isActive,
            category: { id: 'unknown', name: 'عام', nameEn: 'General' }
          }));
          return NextResponse.json(fallback);
        }
      } catch (seedError) {
        console.error("Auto-seed error:", seedError);
      }
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
