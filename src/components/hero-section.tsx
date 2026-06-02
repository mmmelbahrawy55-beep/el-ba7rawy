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
            className="relative mb-4 mt-6 sm:mt-8"
          >
            <div className="relative h-16 sm:h-20 md:h-24 w-full flex items-center justify-center">
              {settings?.logoUrl ? (
                <div className="relative h-full w-auto flex items-center justify-center bg-transparent overflow-hidden px-2 py-1">
                  <img
                    src={settings.logoUrl}
                    alt="ELBA7RAWY"
                    className="h-full w-auto object-contain"
                    loading="eager"
                  />
                </div>
              ) : (
                <div className="relative h-full w-auto flex items-center justify-center bg-transparent overflow-hidden px-2 py-1">
                  <Image
                    src="/images/logo.png"
                    alt="ELBA7RAWY"
                    width={150}
                    height={150}
                    className="h-full w-auto object-contain"
                    priority
                  />
                </div>
              )}
              {/* Logo Glow Effect */}
              <div className="absolute inset-0 bg-primary/20 blur-2xl -z-10 rounded-full scale-125 opacity-30" />
            </div>
          </motion.div>

          {/* Hero Title */}
          <motion.div variants={itemVariants} className="relative mb-6">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
              <Sparkles className="size-2.5 text-primary" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-primary">الريادة في عالم الإعلان</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-tight mb-3">
              ELBA <span className="text-primary">7RAWY</span>
              <br />
              <span className="text-2xl sm:text-4xl md:text-5xl text-slate-400">ADVERTISING</span>
            </h1>
            <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-base text-slate-400 font-medium leading-relaxed px-4">
              نصنع الهوية، نبني الثقة، ونقود علامتك التجارية نحو التميز من خلال حلول إعلانية مبتكرة ومتكاملة
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-12 sm:mb-16 px-4"
            variants={itemVariants}
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl sm:rounded-2xl px-6 sm:px-10 h-12 sm:h-14 text-base sm:text-lg font-black shadow-lg shadow-primary/20 hover:scale-105 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                <MessageCircle className="ml-2 sm:ml-3 size-5 sm:size-6 group-hover:rotate-12 transition-transform" />
                ابدأ رحلة نجاحك
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={scrollToCalculator}
              className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl sm:rounded-2xl px-6 sm:px-10 h-12 sm:h-14 text-base sm:text-lg font-black backdrop-blur-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-2"
            >
              احصل على عرض سعر
            </Button>
          </motion.div>

          {/* Stats in a Bento Grid Style */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full max-w-5xl px-4"
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
                whileHover={{ y: -5, scale: 1.02 }}
                className={`relative p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl transition-all duration-500 group overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <p className={`text-2xl sm:text-3xl md:text-4xl font-black mb-1.5 sm:mb-2 tracking-tighter ${stat.textColor} group-hover:scale-110 transition-transform duration-500`}>{stat.value}</p>
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider">{stat.label}</p>
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
