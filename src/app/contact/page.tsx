'use client'

import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import FloatingActions from '@/components/floating-actions'
import ContactSection from '@/components/contact-section'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="container mx-auto px-4 mb-12 sm:mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 text-primary rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] bg-primary/5">
                تواصل معنا
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-6 leading-tight">
                نحن دائماً <span className="text-primary">بالقرب</span> منك
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed">
                سواء كان لديك استفسار، طلب سعر، أو ترغب في زيارة مقرنا، يسعدنا تواصلك معنا عبر أي من القنوات التالية.
              </p>
            </motion.div>
          </div>
        </section>

        <ContactSection />

        <section className="container mx-auto px-4 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white/5 rounded-[2rem] p-6 sm:p-8 border border-white/10 shadow-sm h-full backdrop-blur-md">
               <h3 className="text-xl font-black text-white mb-6">ساعات العمل</h3>
               <div className="space-y-4">
                 {[
                   { days: 'السبت - الخميس', hours: '٩:٠٠ ص - ١٠:٠٠ م' },
                   { days: 'الجمعة', hours: 'مغلق' }
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center pb-4 border-b border-white/10 last:border-0 last:pb-0">
                     <span className="font-bold text-xs sm:text-sm text-slate-400">{item.days}</span>
                     <span className="font-black text-xs sm:text-sm text-primary">{item.hours}</span>
                   </div>
                 ))}
               </div>
            </div>
            <div className="bg-white/5 rounded-[2rem] p-6 sm:p-8 border border-white/10 shadow-sm h-full overflow-hidden relative min-h-[250px] backdrop-blur-md">
               <h3 className="text-xl font-black text-white mb-6">موقعنا على الخريطة</h3>
               <div className="absolute inset-0 pt-20">
                 <iframe 
                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3418.847424683!2d31.3784!3d31.041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDAyJzI3LjYiTiAzMcKwMjInNDIuMiJF!5e0!3m2!1sen!2seg!4v1620000000000!5m2!1sen!2seg" 
                   width="100%" 
                   height="100%" 
                   style={{ border: 0 }} 
                   allowFullScreen={true} 
                   loading="lazy"
                   className="grayscale opacity-50 contrast-125"
                 ></iframe>
               </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <FloatingActions />
    </div>
  )
}
