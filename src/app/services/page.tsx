'use client'

import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import FloatingActions from '@/components/floating-actions'
import ServicesSection from '@/components/services-section'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export default function ServicesPage() {
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
                خدماتنا المتكاملة
              </Badge>
              <h1 className="text-5xl sm:text-7xl font-black text-foreground tracking-tighter mb-8 leading-tight">
                حلول إعلانية <span className="text-primary">مبتكرة</span> لكل مشروع
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl font-medium leading-relaxed">
                نقدم مجموعة واسعة من الخدمات الطباعية والإعلانية التي تغطي كافة احتياجات علامتك التجارية، من الهوية البصرية إلى اللوحات العملاقة.
              </p>
            </motion.div>
          </div>
        </section>

        <ServicesSection />

        <section className="container mx-auto px-4 py-24">
          <div className="bg-slate-900 rounded-[3rem] p-12 sm:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-8">هل لديك طلب خاص؟</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                إذا لم تجد ما تبحث عنه ضمن خدماتنا المعروضة، فلا تتردد في التواصل معنا. فريقنا الفني قادر على تنفيذ أي فكرة إبداعية تخطر ببالك.
              </p>
              <a 
                href="/#contact" 
                className="inline-flex items-center justify-center px-10 h-16 rounded-2xl bg-primary text-white font-black text-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
              >
                اطلب استشارة مجانية
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <FloatingActions />
    </div>
  )
}
