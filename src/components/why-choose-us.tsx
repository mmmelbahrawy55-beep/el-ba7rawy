'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Award, BadgePercent, BrainCircuit, Sparkles } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  iconBg: string
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <div className="h-full group relative perspective-1000">
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-[3rem] blur-3xl -z-10`} />
        
        <Card
          className="h-full border-white/5 bg-white/5 backdrop-blur-2xl rounded-[3rem] overflow-hidden group transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 relative z-10 border-2"
        >
          <CardContent className="p-10 flex flex-col items-center text-center gap-8">
            <div className={`p-6 rounded-3xl ${feature.iconBg} group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl shadow-black/40 border border-white/5`}>
              {feature.icon}
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-primary transition-colors duration-300 tracking-tighter">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-lg font-bold leading-relaxed">
                {feature.description}
              </p>
            </div>
            
            <div className="mt-auto w-full pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="text-primary font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                اكتشف المزيد <Sparkles className="size-4" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
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
      className="text-center mb-24"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="px-6 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-[0.4em] inline-block mb-8 backdrop-blur-md">
        لماذا نحن؟
      </span>
      <h2 className="text-6xl sm:text-8xl font-black text-white mb-12 tracking-tight leading-[1.3]">
        قوتنا تكمن في <span className="text-primary drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">التفاصيل</span>
      </h2>
      <p className="text-slate-400 text-xl sm:text-3xl max-w-5xl mx-auto leading-[1.8] font-bold px-4">
        نحن لا نصنع مجرد لوحات إعلانية، نحن نصنع واجهة تعكس هوية مشروعك وتجذب عملاءك من النظرة الأولى.
      </p>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WhyChooseUs() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const experienceYears = stats?.yearsOfExperience || 15;

  const features: Feature[] = [
    {
      icon: <Award className="size-10" />,
      title: 'خبرة عريقة واحترافية',
      description: `نمتلك خبرة تمتد لأكثر من ${experienceYears} عاماً في سوق الدعاية المصري، نفذنا خلالها آلاف المشاريع الناجحة.`,
      gradient: 'from-amber-500/30 to-orange-600/10',
      iconBg: 'bg-amber-500/10 text-amber-500',
    },
    {
      icon: <BrainCircuit className="size-10" />,
      title: 'حلول إبداعية ذكية',
      description: 'لا نكتفي بالطباعة فقط، بل نبتكر لك تصاميم وحلولاً هندسية تجعل إعلانك يتحدث عن علامتك التجارية.',
      gradient: 'from-blue-500/30 to-indigo-600/10',
      iconBg: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: <Clock className="size-10" />,
      title: 'سرعة التنفيذ الفائقة',
      description: 'نحن نقدّر وقتك، لذا نلتزم بأدق المواعيد مع الحفاظ على أعلى معايير الجودة في كل تفصيلة.',
      gradient: 'from-emerald-500/30 to-teal-600/10',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      icon: <BadgePercent className="size-10" />,
      title: 'أفضل قيمة مقابل سعر',
      description: 'نقدم حلولاً تناسب جميع الميزانيات مع الحفاظ على جودة الخامات ودقة الألوان المعهودة.',
      gradient: 'from-rose-500/30 to-pink-600/10',
      iconBg: 'bg-rose-500/10 text-rose-500',
    },
  ]

  return (
    <section id="why-choose-us" className="py-32 sm:py-48 bg-[#050505] relative overflow-hidden transition-colors duration-500">
      {/* Noise Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <SectionHeading />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
