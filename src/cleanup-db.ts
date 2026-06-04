import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up database images...')
  
  try {
    const products = await prisma.product.findMany({
      where: {
        imageUrl: {
          contains: 'unsplash.com'
        }
      }
    })

    console.log(`Found ${products.length} products with Unsplash images.`)

    for (const product of products) {
      let newUrl = '/images/logo.png'
      if (product.name.includes('أكريليك')) newUrl = '/images/signage/acrylic-letters.png'
      else if (product.name.includes('ستانلس')) newUrl = '/images/signage/stainless-letters.png'
      else if (product.name.includes('نيون')) newUrl = '/images/signage/neon-sign.png'
      else if (product.name.includes('كلادينج')) newUrl = '/images/cladding/composite-cladding.png'
      else if (product.name.includes('بانر')) newUrl = '/images/materials/heavy-banner.png'
      else if (product.name.includes('فينيل')) newUrl = '/images/materials/glossy-vinyl.png'
      else if (product.name.includes('كروت')) newUrl = '/images/paper/business-cards.png'
      else if (product.name.includes('بروشور')) newUrl = '/images/paper/brochures.png'
      
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: newUrl }
      })
      console.log(`Updated product: ${product.name} -> ${newUrl}`)
    }

    const categories = await prisma.category.findMany()
    console.log(`Checked ${categories.length} categories.`)

  } catch (err) {
    console.log("Database error:", err);
  }

  console.log('Database cleanup complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
