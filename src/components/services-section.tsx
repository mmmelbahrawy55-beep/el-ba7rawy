'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { logger } from '@/lib/logger'
import {
  Printer,
  Box,
  Building2,
  FileText,
  Palette,
  Car,
  Layers,
  Clock,
  InboxIcon,
  Eye,
  TrendingUp,
  ArrowUpDown,
  Calendar,
  MessageCircle,
  Zap,
  ShieldCheck,
} from 'lucide-react'
import { categories as fallbackCategories } from '@/lib/products-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number
  unitType: string
  deliveryDays: number
  salesCount?: number
  createdAt?: string
  isHot?: boolean
  discount?: string
}

interface CategoryWithProducts {
  id: string
  name: string
  nameEn: string
  icon: string
  color: string
  sortOrder: number
  isActive: boolean
  parentCategoryId?: string | null
  products: Product[]
}

// ─── Icon mapping ─────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  Printer: <Printer className="size-6" />,
  Box: <Box className="size-6" />,
  Building2: <Building2 className="size-6" />,
  FileText: <FileText className="size-6" />,
  Palette: <Palette className="size-6" />,
  Car: <Car className="size-6" />,
  Eye: <Eye className="size-6" />,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(product: any): string | null {
  // Handle both DB product and hardcoded product structures
  const price = product.price ?? product.pricePerMeter ?? product.pricePerLetter ?? product.pricePerThousand ?? product.priceFlat ?? 0;
  
  const unitType = product.unitType || (product.pricePerMeter ? 'meter' : product.pricePerLetter ? 'letter' : 'piece');

  if (unitType === 'meter') return `${price} ج.م/متر`
  if (unitType === 'letter') return `${price} ج.م/حرف`
  return `${price} ج.م`
}

// ─── Loading Skeletons ────────────────────────────────────────────────────────

function TabSkeleton() {
  return (
    <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-muted/50 border border-border">
      <Skeleton className="size-6 rounded-full bg-muted" />
      <Skeleton className="h-5 w-24 bg-muted" />
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-card border-border rounded-[2.5rem]">
      <Skeleton className="w-full aspect-[16/11] bg-muted" />
      <CardContent className="p-8 space-y-4">
        <Skeleton className="h-8 w-3/4 bg-muted" />
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-16 w-full rounded-2xl bg-muted" />
      </CardContent>
    </Card>
  )
}

// ─── Product Card ────────────────────────────────────────────────────────────

import Link from 'next/link'

const ProductCard: React.FC<{
  product: Product
  index: number
  categoryName: string
  categoryId: string
  className?: string
}> = ({
  product,
  index,
  categoryName,
  categoryId,
  className = "",
}) => {
  const price = formatPrice(product)
  const whatsappNumber = "201120053007"
  const whatsappMsg = `مرحباً محمد البحراوي، أريد الاستفسار عن خدمة: ${product.name} (قسم ${categoryName})`
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      layout
      className={className}
    >
      <motion.div
        whileHover={{ y: -8, transition: { duration: 0.4 } }}
        className="h-full group"
      >
        <Card className="relative overflow-hidden bg-white/5 backdrop-blur-2xl border-white/5 hover:border-primary/50 transition-all duration-700 rounded-[2rem] h-full flex flex-col shadow-2xl shadow-black/40 hover:shadow-primary/20 border-2">
          {/* Badge Overlay */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            {product.isHot && (
              <Badge className="bg-primary text-primary-foreground border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-primary/40 flex items-center gap-2">
                <Zap className="size-2.5 fill-current" />
                الأكثر طلباً
              </Badge>
            )}
            {product.discount && (
              <Badge className="bg-blue-600 text-white border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/40">
                خصم {product.discount}
              </Badge>
            )}
          </div>

          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={product.imageUrl || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />
            
            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
               <div className="flex items-center gap-2 text-white/90 text-[10px] font-black">
                 <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                   <ShieldCheck className="size-3 text-primary" />
                 </div>
                 <span>ضمان الجودة والتركيب</span>
               </div>
               <div className="flex items-center gap-2 text-white/90 text-[10px] font-black">
                 <div className="size-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                   <Clock className="size-3 text-blue-400" />
                 </div>
                 <span>تسليم خلال {product.deliveryDays} يوم</span>
               </div>
            </div>
          </div>

          <CardContent className="p-6 flex-1 flex flex-col text-right">
            <h4 className="text-xl sm:text-2xl font-black text-white mb-2 group-hover:text-primary transition-colors duration-500 tracking-tighter">
              {product.name}
            </h4>

            <div className="flex items-center justify-end gap-3 mb-6">
               {price ? (
                 <div className="flex items-baseline gap-1.5">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{price.split(' ').slice(1).join(' ')}</span>
                   <span className="text-primary font-black text-2xl sm:text-3xl drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">{price.split(' ')[0]}</span>
                 </div>
               ) : (
                 <span className="text-slate-500 text-xs font-black">السعر عند الطلب</span>
               )}
            </div>

            <p className="text-slate-400 text-sm font-bold mb-6 line-clamp-2 leading-relaxed h-10">
              {product.description || "نقدم حلولاً إعلانية مبتكرة بأعلى جودة وأفضل الأسعار"}
            </p>

            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black h-10"
                asChild
              >
                <Link href={`/services/${categoryId}`}>
                  التفاصيل
                </Link>
              </Button>
              <Button 
                size="sm"
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black h-10"
                asChild
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  اطلب الآن
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      className="text-center mb-10 sm:mb-12"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8 }}
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-4 backdrop-blur-md">
        <Layers className="size-3" />
        <span>خدماتنا الإبداعية</span>
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-4 leading-tight max-w-4xl mx-auto">
        نحن نصنع <span className="text-primary drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">المستقبل</span> البصري لعلامتك
      </h2>
      <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm md:text-base font-bold leading-relaxed px-4">
        استكشف عالمنا من الحلول الطباعية والإعلانية المبتكرة التي تجمع بين دقة التنفيذ وجمال التصميم.
      </p>
    </motion.div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 mb-8 shadow-2xl">
        <InboxIcon className="size-14 text-slate-500" />
      </div>
      <h3 className="text-2xl font-black text-white mb-3 tracking-tighter">
        لا توجد منتجات حالياً
      </h3>
      <p className="text-lg text-slate-500 font-bold max-w-sm">
        يرجى المحاولة مرة أخرى لاحقاً أو التواصل معنا مباشرة
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServicesSection() {
  const [activeMainCat, setActiveMainCat] = useState<string>('')
  const [activeSubCat, setActiveSubCat] = useState<string>('')
  const [allCategories, setAllCategories] = useState<CategoryWithProducts[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('popular')

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setAllCategories(data)
          if (data.length > 0) {
            const firstMain = data.find((c: any) => !c.parentCategoryId) || data[0]
            setActiveMainCat(firstMain.id)
            const firstSub = data.find((c: any) => c.parentCategoryId === firstMain.id)
            if (firstSub) {
              setActiveSubCat(firstSub.id)
            } else {
              setActiveSubCat(firstMain.id)
            }
          }
        } else {
          setAllCategories(fallbackCategories as any)
        }
      } catch (error) {
        logger.error('Failed to fetch categories', error)
        setAllCategories(fallbackCategories as any)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const mainCategories = allCategories.filter(c => !c.parentCategoryId)
  const subCategories = allCategories.filter(c => c.parentCategoryId === activeMainCat)

  // Handle main category change
  const handleMainCatChange = (id: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setActiveMainCat(id)
      const firstSub = allCategories.find(c => c.parentCategoryId === id)
      if (firstSub) {
        setActiveSubCat(firstSub.id || '')
      } else {
        setActiveSubCat(id)
      }
      setIsLoading(false)
    }, 400) // Simulated smooth loading
  }

  // Handle subcategory change with smooth transition
  const handleSubCatChange = (id: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setActiveSubCat(id)
      setIsLoading(false)
    }, 300)
  }

  const activeCategory = allCategories.find(c => c.id === activeSubCat) || allCategories.find(c => c.id === activeMainCat)
  const products = activeCategory?.products || []

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    if (sortOrder === 'price-low') return a.price - b.price
    if (sortOrder === 'price-high') return b.price - a.price
    return (b.salesCount || 0) - (a.salesCount || 0)
  })

  return (
    <section id="services" className="py-20 sm:py-32 bg-[#050505] relative overflow-hidden transition-colors duration-500">
      {/* Noise Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Background patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeading />

        <div className="space-y-16">
          {/* Categories Tabs Container */}
          <div className="space-y-10 bg-white/5 p-10 rounded-[3.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
            {/* Main Categories */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {isLoading && allCategories.length === 0 ? (
                Array(4).fill(0).map((_, i) => <TabSkeleton key={i} />)
              ) : (
                mainCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleMainCatChange(cat.id)}
                    className={`
                      flex items-center gap-4 px-10 py-5 rounded-[2rem] text-lg font-black transition-all duration-700 relative overflow-hidden group border-2
                      ${activeMainCat === cat.id 
                        ? 'bg-primary text-primary-foreground border-primary shadow-[0_20px_40px_-10px_rgba(251,191,36,0.3)] scale-105' 
                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <div className={`${activeMainCat === cat.id ? 'text-primary-foreground' : 'text-primary'} group-hover:scale-110 transition-transform duration-500`}>
                      {ICON_MAP[cat.icon] || <Layers className="size-7" />}
                    </div>
                    {cat.name}
                  </button>
                ))
              )}
            </div>

            {/* Subcategories Tabs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSubCatChange(sub.id)}
                  className={`
                    px-10 py-4 rounded-2xl text-sm font-black transition-all duration-500 border-2
                    ${activeSubCat === sub.id 
                      ? 'bg-white text-[#050505] border-white shadow-2xl' 
                      : 'text-slate-500 border-white/5 hover:bg-white/5 hover:text-slate-300'}
                  `}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {/* Sort & Stats */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
              <div className="flex items-center gap-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-5 text-primary" />
                  <span>{products.length} خدمة متاحة</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-primary" />
                  <span>تحديث: يونيو ٢٠٢٦</span>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto">
                <span className="text-xs font-black text-slate-500 whitespace-nowrap uppercase tracking-[0.2em]">فرز حسب:</span>
                <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
                  <SelectTrigger className="h-14 w-[220px] rounded-2xl border-white/5 bg-white/5 font-black text-xs text-white focus:ring-primary border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="font-arabic bg-[#0c0c0c] border-white/10 text-white">
                    <SelectItem value="popular">الأكثر مبيعاً</SelectItem>
                    <SelectItem value="newest">الأحدث وصولاً</SelectItem>
                    <SelectItem value="price-low">السعر: من الأقل</SelectItem>
                    <SelectItem value="price-high">السعر: من الأعلى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="min-h-[600px] relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                  {Array(6).fill(0).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </motion.div>
              ) : products.length > 0 ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                  {sortedProducts.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      categoryName={activeCategory?.name || ''}
                      categoryId={activeCategory?.id || ''}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-40 text-center space-y-8"
                >
                  <div className="size-32 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shadow-2xl">
                    <InboxIcon className="size-16" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-white tracking-tighter">لا يوجد خدمات حالياً</h3>
                    <p className="text-slate-500 font-bold max-w-sm text-lg leading-relaxed">
                      نحن نعمل على إضافة خدمات جديدة لهذا القسم قريباً. تابعنا للمزيد!
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleMainCatChange(mainCategories[0]?.id)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl px-12 h-16 text-lg shadow-2xl shadow-primary/20"
                  >
                    عرض جميع الأقسام
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
