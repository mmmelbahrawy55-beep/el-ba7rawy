import { Metadata } from 'next'
import { getAllProducts } from '@/lib/products-data'
import { db } from '@/lib/db'
import ProductConfigurator from '@/components/shop/product-configurator'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import FloatingActions from '@/components/floating-actions'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  // 1. Try DB first
  try {
    const dbProduct = await db.product.findUnique({
      where: { id },
      include: { category: true }
    })
    if (dbProduct) return dbProduct
  } catch (e) {
    console.error("DB Product Fetch Error", e)
  }

  // 2. Try Fallback Data
  const fallbackProducts = getAllProducts()
  return fallbackProducts.find(p => p.id === id)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id
  const product = await getProduct(id)
  
  if (!product) return { title: 'منتج غير موجود' }
  
  return {
    title: `${product.name} | ELBA7RAWY`,
    description: product.description || `اطلب ${product.name} الآن من البحراوي للدعاية والإعلان`
  }
}

export default async function ProductPage({ params }: Props) {
  const id = (await params).id
  const product = await getProduct(id)

  if (!product) notFound()

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <SiteHeader />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <Link 
              href="/services" 
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors font-bold gap-2 mb-6"
            >
              <ArrowRight className="size-4 rotate-180" />
              العودة للمتجر
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1 bg-primary/5 font-black uppercase tracking-widest text-[10px]">
                  تخصيص الطلب
                </Badge>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">
                  {product.name}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs mb-1 font-bold">يبدأ من</p>
                <p className="text-3xl font-black text-primary">
                  {(product as any).pricePerMeter || (product as any).priceFlat || (product as any).price || 0} 
                  <span className="text-sm mr-1">ج.م</span>
                </p>
              </div>
            </div>
          </div>

          <ProductConfigurator product={product} />
        </div>
      </main>

      <SiteFooter />
      <FloatingActions />
    </div>
  )
}
