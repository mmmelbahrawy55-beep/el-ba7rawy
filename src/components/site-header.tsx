'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, MessageCircle, ShieldCheck, Sun, Moon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

import { useRouter, usePathname } from 'next/navigation';

const WHATSAPP_URL = `https://wa.me/201120053007?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن خدماتكم')}`;

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'الرئيسية', href: '/' },
  { label: 'خدماتنا', href: '/services' },
  { label: 'أعمالنا', href: '/portfolio' },
  { label: 'تتبع طلبك', href: '/track-order' },
  { label: 'من نحن', href: '/about' },
  { label: 'احسب سعرك', href: '/#quote-calculator' },
  { label: 'تواصل معنا', href: '/contact' },
];

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href === pathname) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href.startsWith('/#')) {
      const targetId = href.substring(2);
      if (pathname === '/') {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const init = async () => {
      setMounted(true);
      // Fetch site settings
      try {
        const res = await fetch('/api/settings', { signal: controller.signal })
        if (res.ok && isMounted) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Settings fetch error:', err);
        }
      }
    }
    init()
    
    return () => {
      isMounted = false;
      controller.abort();
    }
  }, []);

  const whatsappUrl = settings?.whatsapp 
    ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن خدماتكم')}`
    : WHATSAPP_URL;

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
    if (latest > lastScrollY && latest > 200) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(latest);
  });

  return (
    <>
      <AnimatePresence>
        <motion.header
          initial={{ y: 0 }}
          animate={{ y: isVisible ? 0 : -100 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
            isScrolled
              ? 'bg-background/80 backdrop-blur-xl border-b border-border py-2 shadow-lg shadow-black/20'
              : 'bg-transparent py-4'
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 sm:h-24">
              {/* Left side: Navigation links for desktop */}
              <nav className="hidden lg:flex items-center gap-1 flex-1">
                {navLinks.slice(0, 3).map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => handleNavClick(e as any, link.href)}
                      className={`px-4 py-2 text-sm font-bold transition-all duration-300 no-underline relative group ${
                          isScrolled ? 'text-muted-foreground hover:text-primary' : 'text-slate-400 hover:text-primary'
                        }`}
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-4 right-4 h-0.5 bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Center: Brand Name */}
              <div className="flex justify-center flex-1 lg:flex-none">
                <Link href="/" className="relative group">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground">
                      ELBA<span className="text-primary">7RAWY</span>
                    </h1>
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                  </motion.div>
                </Link>
              </div>

              {/* Right side: Action buttons and mobile menu */}
              <div className="flex items-center justify-end flex-1 gap-4">
                <div className="hidden lg:flex items-center gap-4">
                  {navLinks.slice(3).map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (index + 3) * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => handleNavClick(e as any, link.href)}
                        className={`px-4 py-2 text-sm font-bold transition-all duration-300 no-underline relative group ${
                            isScrolled ? 'text-muted-foreground hover:text-primary' : 'text-slate-400 hover:text-primary'
                          }`}
                      >
                        {link.label}
                        <span className="absolute -bottom-1 left-4 right-4 h-0.5 bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Theme toggle removed for dark mode only */}
                  
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-black bg-primary text-primary-foreground border border-primary rounded-2xl transition-all duration-300 hover:bg-primary/90 shadow-lg shadow-primary/10"
                  >
                    <ShieldCheck className="size-4.5" />
                    تسجيل الدخول
                  </Link>
                </div>

                <div className="lg:hidden flex items-center gap-2">
                  <motion.a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button size="icon" variant="ghost" className="text-foreground hover:text-primary hover:bg-muted">
                      <MessageCircle className="size-6" />
                    </Button>
                  </motion.a>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-foreground hover:text-primary hover:bg-muted"
                      >
                        <Menu className="size-7" />
                        <span className="sr-only">فتح القائمة</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-background border-border w-80">
                      <SheetHeader className="border-b border-border pb-6">
                        <SheetTitle className="text-primary text-2xl font-black text-right">
                          {settings?.siteName || "البحراوي"}
                        </SheetTitle>
                      </SheetHeader>
                      <nav className="flex flex-col gap-2 mt-8 px-2">
                        {navLinks.map((link, index) => (
                          <motion.div
                            key={link.href}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              href={link.href}
                              onClick={(e) => {
                                handleNavClick(e as any, link.href);
                              }}
                              className="flex items-center px-5 py-4 text-lg font-bold text-muted-foreground hover:text-primary hover:bg-muted rounded-2xl transition-all no-underline text-right w-full"
                            >
                              {link.label}
                            </Link>
                          </motion.div>
                        ))}
                        <Separator className="my-4 bg-border" />
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-5 py-4 text-lg font-bold text-muted-foreground hover:text-primary hover:bg-muted rounded-2xl transition-all no-underline text-right"
                        >
                          <ShieldCheck className="size-6" />
                          تسجيل الدخول
                        </Link>
                        <Button asChild className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black h-16 rounded-2xl text-lg shadow-xl shadow-primary/20">
                          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="size-6 ml-3" />
                            تواصل معنا
                          </a>
                        </Button>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </div>
        </motion.header>
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg shadow-green-500/30 transition-colors"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="تواصل عبر واتساب"
      >
        <MessageCircle className="size-7 text-white" />
      </motion.a>
    </>
  );
}
