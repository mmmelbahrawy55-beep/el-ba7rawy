'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import { MessageCircle, ChevronDown, Sparkles, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WHATSAPP_URL = `https://wa.me/201120053007?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن خدماتكم')}`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any },
  },
};

const FloatingElement = ({ children, delay = 0, duration = 5 }: { children: React.ReactNode, delay?: number, duration?: number }) => (
  <motion.div
    animate={{ 
      y: [0, -20, 0],
      rotate: [0, 5, 0],
      scale: [1, 1.05, 1]
    }}
    transition={{ 
      duration, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
  >
    {children}
  </motion.div>
);

export default function HeroSection() {
  const [settings, setSettings] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateX = useTransform(y, [-500, 500], [5, -5]);
  const rotateY = useTransform(x, [-500, 500], [-5, 5]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [settingsRes, statsRes] = await Promise.all([
          fetch('/api/settings', { signal: controller.signal }),
          fetch('/api/stats', { signal: controller.signal })
        ]);
        
        if (isMounted) {
          const settingsData = await settingsRes.json();
          const statsData = await statsRes.json();
          setSettings(settingsData);
          setStats(statsData);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
        }
      }
    };

    fetchData();

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX - innerWidth / 2);
      mouseY.set(clientY - innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      isMounted = false;
      controller.abort();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  function scrollToCalculator() {
    const target = document.querySelector('#quote-calculator');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const whatsappUrl = settings?.whatsapp 
    ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن خدماتكم')}`
    : WHATSAPP_URL;

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#050505] transition-colors duration-500 selection:bg-primary selection:text-primary-foreground"
    >
      {/* Noise Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          style={{ x: useTransform(x, [-500, 500], [50, -50]), y: useTransform(y, [-500, 500], [50, -50]) }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full" 
        />
        <motion.div 
          style={{ x: useTransform(x, [-500, 500], [-50, 50]), y: useTransform(y, [-500, 500], [-50, 50]) }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0%,transparent_70%)]" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
        <div className="absolute top-1/4 left-[10%]">
          <FloatingElement delay={0} duration={6}>
            <div className="size-32 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-transparent border border-white/10 backdrop-blur-3xl rotate-12 flex items-center justify-center">
              <Sparkles className="size-10 text-primary/50" />
            </div>
          </FloatingElement>
        </div>
        <div className="absolute bottom-1/4 right-[15%]">
          <FloatingElement delay={1} duration={7}>
            <div className="size-40 rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent border border-white/5 backdrop-blur-2xl flex items-center justify-center">
              <Zap className="size-12 text-blue-400/30" />
            </div>
          </FloatingElement>
        </div>
        <div className="absolute top-1/3 right-[10%]">
          <FloatingElement delay={2} duration={8}>
            <div className="w-20 h-48 rounded-full bg-gradient-to-b from-primary/10 to-transparent border border-white/5 backdrop-blur-xl -rotate-45 flex items-center justify-center">
              <Star className="size-8 text-primary/40 mt-10" />
            </div>
          </FloatingElement>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="flex flex-col items-center text-center"
        >
          {/* Logo with Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="relative mb-4 mt-12 sm:mt-16 md:mt-20"
          >
            <div className="relative h-40 sm:h-52 md:h-64 w-full flex items-center justify-center">
              {settings?.logoUrl ? (
                <div className="relative h-full w-auto flex items-center justify-center bg-white rounded-3xl overflow-hidden px-6 py-2 shadow-2xl">
                  <img
                    src={settings.logoUrl}
                    alt="ELBA7RAWY"
                    className="h-full w-auto object-contain brightness-110 contrast-125"
                    loading="eager"
                  />
                </div>
              ) : (
                <Image
                  src="/images/logo.png"
                  alt="ELBA7RAWY"
                  width={400}
                  height={400}
                  className="h-full w-auto object-contain drop-shadow-[0_0_50px_rgba(251,191,36,0.4)]"
                  priority
                  loading="eager"
                />
              )}
            </div>
          </motion.div>

          {/* Title and Description */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="px-6 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-[0.4em] inline-block mb-8 backdrop-blur-md">
                الريادة في عالم الإعلان
              </span>
            </motion.div>

            <motion.h1 
              className="text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] font-black text-white mb-10 tracking-tight leading-[1.1] flex flex-col items-center"
              variants={itemVariants}
            >
              <div className="flex flex-row items-center justify-center gap-4 sm:gap-6" dir="ltr">
                <span className="relative inline-block drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  ELBA
                </span>
                <span className="text-primary relative drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                  7RAWY
                </span>
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary bg-[length:200%_auto] animate-shimmer text-3xl sm:text-5xl md:text-7xl lg:text-9xl uppercase tracking-[0.25em] sm:tracking-[0.4em] font-black mt-10 sm:mt-14 block opacity-90">
                Advertising
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl sm:text-2xl md:text-4xl text-slate-400 mb-12 sm:mb-20 max-w-5xl mx-auto leading-[1.6] font-bold px-4"
              variants={itemVariants}
            >
              {settings?.description || "نصنع الهوية، نبني الثقة، ونقود علامتك التجارية نحو مستقبل مشرق بإبداع لا يعرف الحدود."}
            </motion.p>

            {/* Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-16 sm:mb-24 px-4"
              variants={itemVariants}
            >
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-[1.5rem] sm:rounded-[2rem] px-8 sm:px-12 h-16 sm:h-20 text-xl sm:text-2xl font-black shadow-[0_25px_50px_-12px_rgba(251,191,36,0.4)] hover:scale-105 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                asChild
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                  <MessageCircle className="ml-3 sm:ml-4 size-6 sm:size-7 group-hover:rotate-12 transition-transform" />
                  ابدأ رحلة نجاحك
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={scrollToCalculator}
                className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] sm:rounded-[2rem] px-8 sm:px-12 h-16 sm:h-20 text-xl sm:text-2xl font-black backdrop-blur-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-2"
              >
                احصل على عرض سعر
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats in a Bento Grid Style */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full max-w-6xl px-4"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {[
              { label: 'سنة من الخبرة الإبداعية', value: `+20`, color: 'from-amber-500/20 to-orange-600/20', textColor: 'text-primary' },
              { label: 'عميل يثق في تميزنا', value: `+2500`, color: 'from-blue-500/20 to-indigo-600/20', textColor: 'text-blue-400' },
              { label: 'مشروع إعلاني ناجح', value: `+8000`, color: 'from-emerald-500/20 to-teal-600/20', textColor: 'text-emerald-400' },
              { label: 'خبير في الدعاية والإعلان', value: `+50`, color: 'from-purple-500/20 to-fuchsia-600/20', textColor: 'text-purple-400' },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-2xl transition-all duration-500 group overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <p className={`text-3xl sm:text-5xl md:text-6xl font-black mb-2 sm:mb-3 tracking-tighter ${stat.textColor} group-hover:scale-110 transition-transform duration-500`}>{stat.value}</p>
                  <p className="text-[10px] sm:text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Down Arrow */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        onClick={() => document.querySelector('#why-choose-us')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <div className="flex flex-col items-center gap-4">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">اكتشف المزيد</span>
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="size-14 rounded-full border-2 border-white/10 flex items-center justify-center text-primary bg-white/5 backdrop-blur-md hover:border-primary/50 transition-colors"
          >
            <ChevronDown className="size-6" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
