import { db } from './lib/db'

async function check() {
  try {
    const count = await db.category.count()
    console.log(`Database has ${count} categories.`)
    const categories = await db.category.findMany({ take: 5 })
    console.log('Sample categories:', JSON.stringify(categories, null, 2))
  } catch (error) {
    console.error('Database check failed:', error)
  }
}

check()
