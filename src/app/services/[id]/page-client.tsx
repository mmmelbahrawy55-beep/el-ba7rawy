'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import FloatingActions from '@/components/floating-actions'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, MessageCircle, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

export default function ServiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories`)
        const data = await res.json()
        const found = data.find((c: any) => c.id === params.id)
        if (found) {
          setCategory(found)
        } else {
          router.push('/services')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategory()
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 pt-40 pb-24">
          <Skeleton className="h-12 w-1/3 mb-8 bg-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-64 rounded-3xl bg-white/5" />
            <Skeleton className="h-64 rounded-3xl bg-white/5" />
            <Skeleton className="h-64 rounded-3xl bg-white/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!category) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-8 hover:bg-white/5 font-bold text-muted-foreground hover:text-white"
          >
            <ArrowRight className="ml-2 size-4" />
            العودة للخدمات
          </Button>

          <div className="max-w-4xl mb-16">
            <Badge variant="outline" className="mb-6 px-6 py-2 border-primary/20 text-primary rounded-full text-xs font-black uppercase tracking-[0.3em] bg-primary/5">
              تفاصيل القسم
            </Badge>
            <h1 className="text-5xl sm:text-7xl font-black text-foreground tracking-tighter mb-8 leading-tight">
              {category.name} <br />
              <span className="text-primary">{category.nameEn}</span>
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-medium leading-relaxed">
              نقدم حلولاً متكاملة في قسم {category.name}، مع الالتزام بأعلى معايير الجودة والسرعة في التنفيذ لضمان رضاكم التام.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {category.products?.map((product: any, i: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 hover:border-primary/20 transition-all group shadow-sm hover:shadow-xl backdrop-blur-md"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                  <Image
                    src={product.imageUrl || '/images/hero-bg.png'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{product.name}</h3>
                <p className="text-muted-foreground text-sm font-medium mb-6 line-clamp-2">
                  {product.description || 'خدمة متميزة تضمن لك أفضل النتائج بأعلى جودة ممكنة.'}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 text-primary font-black">
                    <Clock className="size-4" />
                    <span className="text-xs">{product.deliveryDays} أيام</span>
                  </div>
                  <Button variant="ghost" className="text-primary font-black text-sm group-hover:translate-x-[-5px] transition-transform">
                    تفاصيل السعر
                    <ArrowRight className="mr-2 size-4 rotate-180" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="bg-slate-900 rounded-[3rem] p-12 sm:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="text-right">
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-8">لماذا تختار {category.name} من البحراوي؟</h2>
                <div className="space-y-4">
                  {[
                    'دقة متناهية في الألوان والمقاسات',
                    'استخدام أفضل أنواع الأحبار والخامات',
                    'فريق تركيبات محترف وسريع',
                    'ضمان حقيقي على كافة المنتجات'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-slate-400">
                      <CheckCircle2 className="size-6 text-primary" />
                      <span className="text-lg font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 text-center">
                <ShieldCheck className="size-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-black text-white mb-4">اطلب عرض سعر الآن</h3>
                <p className="text-slate-400 mb-8">سنتواصل معك في أقل من ٢٤ ساعة لمناقشة تفاصيل طلبك.</p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black h-16 rounded-2xl text-xl shadow-xl shadow-primary/20">
                  تواصل عبر واتساب
                  <MessageCircle className="mr-3 size-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <FloatingActions />
    </div>
  )
}
