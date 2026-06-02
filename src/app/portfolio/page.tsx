'use client'

import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import FloatingActions from '@/components/floating-actions'
import PortfolioGallery from '@/components/portfolio-gallery'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      
      <main className="flex-1 pt-32 pb-24">
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 px-6 py-2 border-primary/20 text-primary rounded-full text-xs font-black uppercase tracking-[0.3em] bg-primary/5">
                معرض الأعمال
              </Badge>
              <h1 className="text-5xl sm:text-7xl font-black text-foreground tracking-tighter mb-8 leading-tight">
                إبداعاتنا في <span className="text-primary">أرض الواقع</span>
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl font-medium leading-relaxed">
                استكشف مجموعة من أبرز المشاريع التي قمنا بتنفيذها لعملائنا في مختلف القطاعات. جودة التنفيذ هي عنواننا.
              </p>
            </motion.div>
          </div>
        </section>

        <PortfolioGallery />
      </main>

      <SiteFooter />
      <FloatingActions />
    </div>
  )
}
