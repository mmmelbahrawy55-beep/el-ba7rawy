'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, MessageCircle, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const WHATSAPP_URL = `https://wa.me/201120053007?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن خدماتكم')}`;

interface FooterLink {
  label: string;
  href: string;
}

const quickLinks: FooterLink[] = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'خدماتنا', href: '#services' },
  { label: 'أعمالنا', href: '#portfolio' },
  { label: 'احسب سعرك', href: '#calculator' },
  { label: 'تواصل معنا', href: '#contact' },
];

function handleFooterNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  const target = document.querySelector(href);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

function FooterSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

export default function SiteFooter() {
  const [settings, setSettings] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [logoSource, setLogoSource] = useState('/images/logo.png');

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      setSettings(data);
      if (data.logoUrl) setLogoSource(data.logoUrl);
    }).catch(() => {});
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(data)).catch(() => {});
  }, []);

  const whatsappUrl = settings?.whatsapp 
    ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن خدماتكم')}`
    : WHATSAPP_URL;

  return (
    <footer className="bg-background text-foreground pt-12 pb-6 border-t border-border relative overflow-hidden transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Brand Card - Bento Large */}
          <div className="lg:col-span-2 bg-card/50 p-5 sm:p-6 rounded-xl border border-border backdrop-blur-sm flex flex-col justify-between group hover:border-primary/20 transition-all duration-500 shadow-xl shadow-black/10">
            <div>
              <div className="relative h-20 w-auto mb-6 flex items-center justify-start group-hover:scale-105 transition-transform duration-500">
                <img
                  src="/uploads/branding/1780350697096-766422623.jpeg"
                  alt="El Bahrawy"
                  className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] rounded-sm"
                />
              </div>
              <h3 className="text-xl font-black mb-2 tracking-tighter text-foreground">
                ELBA<span className="text-primary">7RAWY</span>
              </h3>
              <p className="text-muted-foreground text-xs font-medium leading-relaxed max-w-md">
                {settings?.description || "نقدم حلولاً إعلانية مبتكرة تجمع بين الإبداع الفني وأحدث تقنيات الطباعة والذكاء الاصطناعي."}
              </p>
            </div>
            <div className="flex gap-2 mt-6">
              {[
                { Icon: Facebook, href: settings?.facebook || '#', color: 'hover:bg-blue-600' },
                { Icon: Instagram, href: settings?.instagram || '#', color: 'hover:bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-500' },
                { Icon: Twitter, href: settings?.twitter || '#', color: 'hover:bg-sky-500' },
                { Icon: Youtube, href: settings?.youtube || '#', color: 'hover:bg-red-600' },
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`size-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-white transition-all duration-300 ${social.color}`}
                >
                  <social.Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Bento Small */}
          <div className="bg-card/50 p-5 sm:p-6 rounded-xl border border-border backdrop-blur-sm hover:border-primary/20 transition-all duration-500 shadow-xl shadow-black/10">
            <h4 className="text-base font-black mb-4 text-primary uppercase tracking-widest flex items-center gap-2">
              <div className="w-4 h-0.5 bg-primary rounded-full" />
              روابط
            </h4>
            <nav className="flex flex-col gap-3">
              {[
                { label: 'الرئيسية', id: '' },
                { label: 'خدماتنا', id: 'services' },
                { label: 'أعمالنا', id: 'portfolio' },
                { label: 'حاسبة الأسعار', id: 'quote-calculator' },
                { label: 'تواصل معنا', id: 'contact' }
              ].map((link, i) => (
                <Link 
                  key={i} 
                  href={`/${link.id ? '#' + link.id : ''}`} 
                  className="text-muted-foreground hover:text-primary transition-all font-bold no-underline flex items-center gap-2 group text-xs"
                >
                  <div className="size-1 rounded-full bg-border group-hover:bg-primary group-hover:scale-150 transition-all" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact - Bento Small */}
          <div className="bg-secondary p-5 sm:p-6 rounded-xl border border-border hover:border-primary/20 transition-all duration-500 relative overflow-hidden group shadow-xl shadow-black/20">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className="text-base font-black mb-4 text-primary uppercase tracking-widest flex items-center gap-2 relative z-10">
              <div className="w-4 h-0.5 bg-primary rounded-full" />
              تواصـل
            </h4>
            <div className="space-y-4 relative z-10">
              <a href={`tel:${settings?.phone || '+201120053007'}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all no-underline group/item">
                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-primary/10 group-hover/item:scale-110 transition-all border border-white/5">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">اتصل بنا</p>
                  <p className="font-black text-white text-sm" dir="ltr">{settings?.phone || '+201120053007'}</p>
                </div>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-green-400 transition-all no-underline group/item">
                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-green-400/10 group-hover/item:scale-110 transition-all border border-white/5">
                  <MessageCircle className="size-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">واتساب</p>
                  <p className="font-black text-white text-sm" dir="ltr">{settings?.whatsapp || '+201120053007'}</p>
                </div>
              </a>
              <div className="flex items-center gap-3 text-muted-foreground group/item">
                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">المقر</p>
                  <p className="font-bold text-white text-[10px] leading-tight">{settings?.address || 'العاشر من رمضان / الزقازيق، الشرقية'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
               <img src="/uploads/branding/1780350697096-766422623.jpeg" alt="Small Logo" className="w-8 h-8 object-contain" />
            </div>
            <p className="text-muted-foreground text-xs font-bold tracking-tight">
              © {new Date().getFullYear()} {settings?.siteName || 'البحراوي للدعاية والإعلان'}. جميع الحقوق محفوظة.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            <span>تصميم وتنفيذ</span>
            <span className="text-primary/50">El Bahrawy Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
