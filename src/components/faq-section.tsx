'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  HelpCircle,
  ChevronDown,
} from 'lucide-react'

const fallbackFaqs = [
  {
    question: "ما هي المدة المستغرقة لتنفيذ لافتات الحروف البارزة (3D)؟",
    answer: "تستغرق عملية التصنيع والتركيب عادةً من 7 إلى 10 أيام عمل، حسب حجم المشروع والتعقيد الفني للتصميم."
  },
  {
    question: "هل تقدمون خدمات التصميم الجرافيكي أم الطباعة فقط؟",
    answer: "نقدم خدمة متكاملة تشمل التصميم الإبداعي من قبل مهندسي تصميم متخصصين، ثم التنفيذ والطباعة والتركيب النهائي."
  },
  {
    question: "هل يوجد ضمان على واجهات الكلادينج واللافتات المضيئة؟",
    answer: "نعم، نقدم ضماناً يصل إلى 5 سنوات على جودة الخامات وثبات الألوان، وضماناً لمدة عام على التوصيلات الكهربائية والإضاءة."
  },
  {
    question: "كيف يمكنني الحصول على عرض سعر دقيق لمشروعي؟",
    answer: "يمكنك استخدام حاسبة الأسعار الذكية في موقعنا للحصول على تقدير فوري، أو التواصل معنا مباشرة عبر الواتساب لإرسال المقاسات والحصول على مقايسة دقيقة."
  },
  {
    question: "هل تقومون بالتركيب في محافظات خارج القاهرة؟",
    answer: "نعم، لدينا فرق تركيب متخصصة تغطي جميع محافظات الجمهورية، مع الالتزام التام بمعايير الجودة والأمان."
  }
]

export default function FAQSection() {
  const [faqs, setFaqs] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data)
        } else {
          setFaqs(fallbackFaqs)
        }
      })
      .catch(() => setFaqs(fallbackFaqs))
  }, [])
  return (
    <section className="py-32 sm:py-48 bg-[#050505] relative overflow-hidden transition-colors duration-500">
      {/* Noise Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-primary/10 blur-[180px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-24 sm:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.4em] mb-8 backdrop-blur-md">
              <HelpCircle className="size-4" />
              مركز المعرفة
            </div>
            <h2 className="text-6xl sm:text-8xl font-black mb-12 text-white tracking-tight leading-[1.3]">
              إجابات <span className="text-primary drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">تريح</span> بالك
            </h2>
            <p className="text-slate-400 text-xl sm:text-3xl font-bold leading-[1.8] max-w-4xl mx-auto px-4">
              كل ما تحتاج معرفته عن خدماتنا الاحترافية، فترات التنفيذ، والضمان الذهبي الذي نقدمه.
            </p>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto">
          <Accordion type="single" collapsible className="space-y-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <AccordionItem 
                  value={`item-${index}`}
                  className="bg-white/5 backdrop-blur-3xl border-white/5 rounded-[3rem] px-12 overflow-hidden hover:border-primary/40 transition-all duration-700 group data-[state=open]:border-primary/50 data-[state=open]:bg-white/10 shadow-2xl shadow-black/60 border-2"
                >
                  <AccordionTrigger className="text-right text-2xl font-black text-white hover:no-underline py-10 group-hover:text-primary transition-colors data-[state=open]:text-primary tracking-tighter">
                    <span className="flex-1 leading-tight">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400 text-xl leading-relaxed pb-12 text-right font-bold">
                    <div className="pt-6 border-t border-white/5">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
