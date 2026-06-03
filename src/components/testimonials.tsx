'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const fallbackTestimonials = [
  {
    name: "البحراوي 1",
    role: "مدير تسويق - شركة النور",
    content: "تعاملنا مع البحراوي في تجهيز واجهات معرضنا الجديد، الدقة في المواعيد والجودة في التنفيذ كانت مذهلة.",
    avatar: "https://i.pravatar.cc/150?u=1"
  },
  {
    name: "البحراوي 2",
    role: "صاحبة مطعم ذا جاردن",
    content: "حاسبة الأسعار في الموقع ساعدتني جداً في تخطيط ميزانية الدعاية، والتنفيذ كان مطابقاً للتوقعات تماماً.",
    avatar: "https://i.pravatar.cc/150?u=2"
  },
  {
    name: "البحراوي 3",
    role: "مهندس ديكور",
    content: "أفضل مكان للحفر بالليزر والتقطيع الرقمي. احترافية عالية جداً في التعامل مع التصاميم المعقدة.",
    avatar: "https://i.pravatar.cc/150?u=3"
  }
]

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data)
        } else {
          setTestimonials(fallbackTestimonials)
        }
      })
      .catch(() => setTestimonials(fallbackTestimonials))
  }, [])
  return (
    <section className="py-32 sm:py-48 bg-[#050505] relative overflow-hidden transition-colors duration-500">
      {/* Noise Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/10 blur-[180px] rounded-full pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-24 sm:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="px-6 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-[0.4em] inline-block mb-8 backdrop-blur-md">
              آراء الشركاء
            </span>
            <h2 className="text-6xl sm:text-8xl font-black mb-10 text-white tracking-tighter leading-[1]">
              ثقة <span className="text-primary drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">تتوارثها</span> الأجيال
            </h2>
            <p className="text-slate-400 text-xl sm:text-2xl font-bold leading-relaxed">
              نفخر بكوننا جزءاً من قصص نجاح كبرى الشركات والكيانات التجارية في مصر، بفضل التزامنا بأعلى معايير الجودة.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/5 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/5 shadow-2xl shadow-black/60 relative group hover:border-primary/40 transition-all duration-700 border-2"
            >
              <Quote className="absolute top-12 left-12 text-primary/5 size-20 group-hover:text-primary/10 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12" />
              
              <div className="flex items-center gap-6 mb-12 relative z-10">
                <div className="relative">
                  <img 
                    src={item.avatar} 
                    alt={item.name} 
                    className="size-20 rounded-[2rem] border-2 border-white/10 object-cover group-hover:border-primary/50 transition-colors duration-700 shadow-2xl"
                  />
                  <div className="absolute -bottom-3 -right-3 size-8 bg-primary rounded-xl flex items-center justify-center shadow-2xl border-4 border-[#0c0c0c]">
                    <div className="size-2.5 bg-[#0c0c0c] rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-white text-2xl tracking-tighter mb-1">{item.name}</h4>
                  <p className="text-xs text-primary font-black uppercase tracking-[0.2em]">{item.role}</p>
                </div>
              </div>
              
              <p className="text-slate-400 leading-relaxed text-xl font-bold relative z-10 italic">
                "{item.content}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
