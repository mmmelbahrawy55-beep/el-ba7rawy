import { PrismaClient } from '@prisma/client'
import path from 'path'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`
    }
  }
})

async function main() {
  try {
    console.log('Testing database write...')
    const category = await prisma.category.create({
      data: {
        name: 'Test Category ' + Date.now(),
        nameEn: 'Test Category EN',
        icon: 'Printer',
        color: 'blue'
      }
    })
    console.log('Successfully created category:', category)
    
    // Clean up
    await prisma.category.delete({
      where: { id: category.id }
    })
    console.log('Successfully cleaned up test category.')
  } catch (error) {
    console.error('Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
