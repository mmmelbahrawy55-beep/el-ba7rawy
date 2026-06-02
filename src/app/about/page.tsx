'use client'

import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import FloatingActions from '@/components/floating-actions'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Eye, ShieldCheck, Award, Users, Rocket } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function AboutPage() {
  const [realStats, setRealStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  
  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setRealStats(data))
      .catch(() => {});
    
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const stats = [
    { label: 'سنة خبرة', value: `+${realStats?.yearsOfExperience || 20}`, icon: Award },
    { label: 'عميل سعيد', value: `+${realStats?.totalClients || 500}`, icon: Users },
    { label: 'مشروع ناجح', value: `+${realStats?.totalProjects || 1200}`, icon: Rocket },
  ]

  const values = [
    {
      title: 'رؤيتنا',
      description: 'أن نكون الخيار الأول والملهم في عالم الدعاية والإعلان في مصر والشرق الأوسط، من خلال تقديم حلول إبداعية تتجاوز التوقعات.',
      icon: Eye,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      title: 'رسالتنا',
      description: 'تمكين العلامات التجارية من الوصول لجمهورها بأكثر الطرق فاعلية وإبداعاً، مع الالتزام بأعلى معايير الجودة والدقة في التنفيذ.',
      icon: Target,
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'قيمنا',
      description: 'النزاهة، الابتكار المستمر، والالتزام بالمواعيد هي الركائز الأساسية التي نبني عليها علاقتنا مع كل عميل.',
      icon: ShieldCheck,
      color: 'bg-emerald-500/10 text-emerald-500'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <Badge variant="outline" className="mb-8 px-6 py-2 border-primary/20 text-primary rounded-full text-xs font-black uppercase tracking-[0.3em] bg-primary/5">
                من نحن
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-10 leading-[1.3] tracking-tighter">
                عن <span className="text-primary">البحراوي</span> <br />
                <span className="text-white/90">للدعاية والإعلان</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-bold leading-relaxed mb-12 max-w-2xl text-justify">
                {settings?.description || "نحن وكالة إعلانية متكاملة نسعى لتغيير مفهوم الدعاية والإعلان في مصر من خلال الابتكار والجودة العالية، وتقديم حلول تسويقية متكاملة تلبي طموحات عملائنا."}
              </p>
              
              <div className="grid grid-cols-3 gap-6 sm:gap-12">
                {stats.map((stat, i) => (
                  <div key={i} className="text-right group">
                    <p className="text-4xl sm:text-5xl font-black text-primary mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{stat.value}</p>
                    <p className="text-sm sm:text-base font-black text-white/40 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square order-1 lg:order-2 max-w-[550px] mx-auto lg:ml-0 lg:mr-auto"
            >
              <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden flex items-center justify-center bg-white border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
                {settings?.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings?.siteName || "البحراوي للدعاية والإعلان"}
                    className="w-full h-full object-cover brightness-110 contrast-125 group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <Image
                    src="/images/logo.png"
                    alt="البحراوي للدعاية والإعلان"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="bg-white/5 py-24 relative overflow-hidden backdrop-blur-sm border-y border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-white/5 shadow-xl rounded-[2.5rem] bg-[#0a0a0a] group hover:translate-y-[-10px] transition-all duration-500">
                    <CardContent className="p-10 text-right">
                      <div className={`size-16 rounded-2xl ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                        <item.icon className="size-8" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-4">{item.title}</h3>
                      <p className="text-muted-foreground font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-8 tracking-tight">لماذا يختارنا العملاء؟</h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-12">
              نحن نؤمن بأن كل عميل هو شريك نجاح، ولذلك نحرص على تقديم استشارات فنية متكاملة قبل البدء في أي مشروع. خبرتنا الواسعة في السوق المصري جعلتنا نتفهم احتياجات مختلف القطاعات، سواء كانت شركات ناشئة أو مؤسسات كبرى.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-right">
              {[
                'أحدث ماكينات الطباعة الرقمية واللايزر',
                'فريق عمل متخصص من المصممين والفنيين',
                'خامات مستوردة تضمن طول عمر المنتج',
                'سرعة فائقة في التنفيذ والتسليم',
                'أسعار تنافسية مع أعلى معايير الجودة',
                'ضمان حقيقي على كافة أعمال التركيبات'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 shadow-sm">
                  <div className="size-3 rounded-full bg-primary" />
                  <span className="font-bold text-slate-300">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <FloatingActions />
    </div>
  )
}
