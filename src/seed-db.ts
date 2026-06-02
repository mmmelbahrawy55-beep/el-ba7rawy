import { db } from './lib/db'

const categories = [
  {
    id: "cat-sign-printing",
    name: "طباعة لافتات",
    nameEn: "Sign Printing",
    icon: "Printer",
    color: "blue",
    sortOrder: 0,
    products: [
      { id: "prod-heavy-banner", name: "بانر تقيل", nameEn: "Heavy Banner", price: 120, unitType: "meter", deliveryDays: 2, imageUrl: "/images/materials/heavy-banner.png" },
      { id: "prod-light-banner", name: "بانر خفيف", nameEn: "Light Banner", price: 75, unitType: "meter", deliveryDays: 2, imageUrl: "/images/materials/light-banner.png" },
      { id: "prod-flex-banner", name: "فليكس بانر", nameEn: "Flex Banner", price: 150, unitType: "meter", deliveryDays: 2, imageUrl: "/images/flex/flex-banner-installed.png" },
      { id: "prod-sketch-banner", name: "بانر اسكوتش", nameEn: "Sketch Banner", price: 180, unitType: "meter", deliveryDays: 3, imageUrl: "/images/materials/sketch-banner.png" },
      { id: "prod-see-thru", name: "سي ثرو", nameEn: "See Thru", price: 200, unitType: "meter", deliveryDays: 3, imageUrl: "/images/cthru/see-thru-oneway.png" },
      { id: "prod-matte-banner", name: "بانر مط", nameEn: "Matte Banner", price: 130, unitType: "meter", deliveryDays: 2, imageUrl: "/images/materials/matte-vinyl.png" },
      { id: "prod-vinyl-flex", name: "فنييل فليكس", nameEn: "Vinyl Flex", price: 160, unitType: "meter", deliveryDays: 2, imageUrl: "/images/materials/cut-vinyl.png" },
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
      { id: "prod-acrylic-letters", name: "حروف أكريليك", nameEn: "Acrylic Letters", price: 45, unitType: "letter", deliveryDays: 5, imageUrl: "/images/signage/acrylic-letters.png" },
      { id: "prod-stainless-letters", name: "حروف ستانلس ستيل", nameEn: "Stainless Letters", price: 120, unitType: "letter", deliveryDays: 7, imageUrl: "/images/signage/stainless-letters.png" },
      { id: "prod-plastic-letters", name: "حروف بلاستيك", nameEn: "Plastic Letters", price: 35, unitType: "letter", deliveryDays: 5, imageUrl: "/images/signage/plastic-letters.png" },
      { id: "prod-copper-letters", name: "حروف نحاس", nameEn: "Copper Letters", price: 180, unitType: "letter", deliveryDays: 10, imageUrl: "/images/signage/copper-letters.png" },
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
      { id: "prod-business-cards", name: "كروت شخصية", nameEn: "Business Cards", price: 800, unitType: "piece", deliveryDays: 3, imageUrl: "/images/paper/business-cards.png" },
      { id: "prod-brochures", name: "روشيتات / بروشور", nameEn: "Brochures", price: 3000, unitType: "piece", deliveryDays: 5, imageUrl: "/images/paper/brochures.png" },
      { id: "prod-folders", name: "فولدرات", nameEn: "Folders", price: 15, unitType: "piece", deliveryDays: 7, imageUrl: "/images/paper/folders.png" },
      { id: "prod-stickers", name: "ستيكرات", nameEn: "Stickers", price: 5, unitType: "piece", deliveryDays: 2, imageUrl: "/images/paper/stickers.png" },
    ],
  },
];

async function seed() {
  try {
    console.log('Cleaning DB...')
    await db.product.deleteMany();
    await db.category.deleteMany();

    console.log('Seeding categories and products...')
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
            nameEn: prod.nameEn || "",
            price: prod.price,
            unitType: prod.unitType,
            deliveryDays: prod.deliveryDays,
            imageUrl: prod.imageUrl,
            categoryId: createdCategory.id,
          },
        });
      }
    }
    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Seed failed:', error)
  }
}

seed()
