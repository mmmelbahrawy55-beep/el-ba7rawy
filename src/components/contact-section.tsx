'use client'

import { motion } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function ContactSection() {
  const [settings, setSettings] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'تم إرسال رسالتك بنجاح')
        setFormData({
          name: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        toast.error(data.error || 'حدث خطأ أثناء إرسال الرسالة')
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال بالسيرفر')
    } finally {
      setIsSubmitting(false)
    }
  }

  const socialLinks = [
    { icon: Facebook, href: settings?.facebook || "#", color: 'hover:bg-blue-600' },
    { icon: Instagram, href: settings?.instagram || "#", color: 'hover:bg-pink-600' },
    { icon: Twitter, href: settings?.twitter || "#", color: 'hover:bg-sky-500' },
    { icon: Youtube, href: settings?.youtube || "#", color: 'hover:bg-red-600' },
  ]

  const contactInfo = [
    {
      icon: Phone,
      label: 'اتصل بنا',
      value: settings?.phone || '+201120053007',
      href: `tel:${settings?.phone || '+201120053007'}`,
      color: 'text-blue-400 bg-blue-400/10'
    },
    {
      icon: Mail,
      label: 'البريد الإلكتروني',
      value: settings?.email || 'info@elbahrawy.com',
      href: `mailto:${settings?.email || 'info@elbahrawy.com'}`,
      color: 'text-primary bg-primary/10'
    },
    {
      icon: MapPin,
      label: 'موقعنا',
      value: settings?.address || 'العاشر من رمضان / الزقازيق، الشرقية',
      href: '#',
      color: 'text-emerald-400 bg-emerald-400/10'
    }
  ]

  return (
    <section id="contact" className="py-16 sm:py-24 bg-background relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Info Side */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4">
                <Send className="size-3.5" />
                <span>تواصل معنا</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-tight">
                لنصنع شيئاً <span className="text-primary">مذهلاً</span> معاً
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                فريقنا جاهز دائماً لمساعدتك في تحويل رؤيتك إلى واقع. تواصل معنا اليوم واستمتع بخدمة إعلانية استثنائية.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {contactInfo.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-card/40 backdrop-blur-md border border-border hover:border-primary/20 transition-all duration-300 group no-underline shadow-xl shadow-black/10"
                  whileHover={{ x: -8 }}
                >
                  <div className={`p-3 rounded-xl ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-md shadow-black/5`}>
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors" dir="ltr">{item.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 text-right">تابعنا على منصات التواصل</p>
              <div className="flex gap-3 justify-end">
                {socialLinks.map((link, i) => (
                  <motion.a
                    key={i}
                    href={link.href}
                    className={`size-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground transition-all duration-300 ${link.color} hover:text-white hover:border-transparent shadow-md shadow-black/5`}
                    whileHover={{ y: -4, scale: 1.1 }}
                  >
                    <link.icon className="size-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Form Side */}
          <Card className="bg-card/40 border border-border p-6 sm:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group backdrop-blur-md">
            {/* Background Glow */}
            <div className="absolute -top-16 -right-16 size-32 bg-primary/5 blur-[40px] rounded-full group-hover:bg-primary/10 transition-colors duration-500" />
            
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6" dir="rtl">
              <div className="space-y-1.5 text-right">
                <h3 className="text-2xl font-black text-foreground">أرسل لنا رسالة</h3>
                <p className="text-sm text-muted-foreground font-medium">سنتواصل معك في أقرب وقت ممكن.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <Label className="text-muted-foreground font-black mr-2 text-[10px] uppercase tracking-widest">الاسم</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسمك" 
                    className="bg-muted/50 border-border text-foreground rounded-xl h-12 font-bold focus:ring-primary text-right text-sm"
                    required
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-muted-foreground font-black mr-2 text-[10px] uppercase tracking-widest">رقم الهاتف</Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01xxxxxxxxx" 
                    className="bg-muted/50 border-border text-foreground rounded-xl h-12 font-bold focus:ring-primary text-right text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground font-black mr-2 text-[10px] uppercase tracking-widest">الموضوع</Label>
                <Input 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="موضوع الرسالة" 
                  className="bg-muted/50 border-border text-foreground rounded-xl h-12 font-bold focus:ring-primary text-right text-sm"
                  required
                />
              </div>

              <div className="space-y-2 text-right">
                <Label className="text-muted-foreground font-black mr-2 text-[10px] uppercase tracking-widest">الرسالة</Label>
                <Textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="كيف يمكننا مساعدتك؟" 
                  className="bg-muted/50 border-border text-foreground rounded-xl min-h-[120px] font-bold focus:ring-primary text-right text-sm resize-none"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl font-black text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                <Send className="mr-2 size-4 rotate-180" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}
