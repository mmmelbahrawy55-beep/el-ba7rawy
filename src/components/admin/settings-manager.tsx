'use client'

import { useEffect, useState } from 'react'
import {
  Settings as SettingsIcon,
  Save,
  Globe,
  MessageCircle,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface SettingsData {
  siteName: string
  siteNameEn: string
  logoUrl: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  facebook: string | null
  instagram: string | null
  geminiKey?: string | null
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch {
        toast.error('فشل تحميل الإعدادات')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        toast.success('تم حفظ الإعدادات بنجاح')
      } else {
        toast.error('فشل حفظ الإعدادات')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'branding') // تحديد مجلد خاص بالهوية البصرية
      
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        body: fd 
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setSettings((prev) => prev ? { ...prev, logoUrl: data.url } : null)
        toast.success('تم رفع الشعار بنجاح')
      } else {
        toast.error(data.error || 'فشل رفع الشعار')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('حدث خطأ أثناء الرفع، يرجى المحاولة مرة أخرى')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header - Bento Style */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white tracking-tighter">إعدادات المنصة</h2>
          <p className="text-muted-foreground font-bold mt-2">إدارة الهوية البصرية، بيانات التواصل، والروابط الاجتماعية</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-10 h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 group relative z-10"
        >
          {saving ? <Loader2 className="size-6 animate-spin ml-2" /> : <Save className="size-6 ml-2 group-hover:rotate-12 transition-transform" />}
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Identity Section - Bento Large */}
        <Card className="lg:col-span-2 border border-white/10 bg-white/5 backdrop-blur-md shadow-xl rounded-[3rem] overflow-hidden group">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 text-primary">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Globe className="size-6" />
              </div>
              <h3 className="text-2xl font-black text-white">هوية الموقع</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-muted-foreground font-black text-xs uppercase tracking-widest mr-2">اسم المنصة (عربي)</Label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-2xl h-14 font-black text-lg focus:ring-primary/20 shadow-sm text-white"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-muted-foreground font-black text-xs uppercase tracking-widest mr-2">اسم المنصة (إنجليزي)</Label>
                <Input
                  value={settings.siteNameEn}
                  onChange={(e) => setSettings({ ...settings, siteNameEn: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-2xl h-14 font-black text-lg focus:ring-primary/20 shadow-sm text-white"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="pt-6">
              <Label className="text-muted-foreground font-black text-xs uppercase tracking-widest mr-2 mb-4 block">شعار العلامة التجارية</Label>
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                <div className="size-32 rounded-[2rem] bg-[#0c0c0c] shadow-inner flex items-center justify-center overflow-hidden relative group/logo border border-white/10">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-4 group-hover/logo:scale-110 transition-transform duration-500 brightness-110" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/10">
                      <SettingsIcon className="size-10" />
                      <span className="text-[10px] font-black uppercase">NO LOGO</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed text-center sm:text-right">
                    يفضل استخدام شعار بخلفية شفافة (PNG) وبجودة عالية لضمان ظهوره بشكل ممتاز في جميع أقسام الموقع.
                  </p>
                  <label className="block cursor-pointer">
                    <Input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    <div className="h-14 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 group/btn">
                      <ImageIcon className="size-5 text-white/20 group-hover/btn:text-primary transition-colors" />
                      <span className="text-sm font-black text-muted-foreground group-hover/btn:text-primary">رفع شعار جديد</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Settings - Gemini Key */}
        <Card className="lg:col-span-2 border border-white/10 bg-white/5 backdrop-blur-md shadow-xl rounded-[3rem] overflow-hidden group">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 text-primary">
              <div className="p-3 rounded-2xl bg-primary/10">
                <SettingsIcon className="size-6" />
              </div>
              <h3 className="text-2xl font-black text-white">إعدادات الذكاء الاصطناعي</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-muted-foreground font-black text-xs uppercase tracking-widest mr-2">Gemini API Key</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={settings.geminiKey || ''}
                    onChange={(e) => setSettings({ ...settings, geminiKey: e.target.value })}
                    placeholder="أدخل مفتاح Gemini هنا..."
                    className="bg-white/5 border-white/10 rounded-2xl h-14 font-bold text-lg focus:ring-primary/20 shadow-sm text-white"
                    dir="ltr"
                  />
                  <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                      يتم استخدام هذا المفتاح لتفعيل نظام المحادثة الذكي (Chat AI). تأكد من الحصول على المفتاح من منصة Google AI Studio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info - Bento Small */}
        <Card className="lg:col-span-1 border border-white/10 bg-white/5 backdrop-blur-md text-white shadow-xl rounded-[3rem] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30" />
          <CardContent className="p-10 space-y-8 relative z-10">
            <div className="flex items-center gap-4 text-primary">
              <div className="p-3 rounded-2xl bg-white/5 shadow-sm border border-white/5">
                <MessageCircle className="size-6" />
              </div>
              <h3 className="text-2xl font-black">بيانات التواصل</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] mr-2">واتساب</Label>
                <div className="relative">
                  <MessageCircle className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                  <Input
                    value={settings.whatsapp || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-xl h-12 pr-10 font-bold text-white"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] mr-2">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                  <Input
                    value={settings.email || ''}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-xl h-12 pr-10 font-bold text-white"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] mr-2">المقر</Label>
                <div className="relative">
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                  <Input
                    value={settings.address || ''}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-xl h-12 pr-10 font-bold text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] mr-2 mb-4 block">منصات التواصل</Label>
              <div className="space-y-4">
                <div className="relative">
                  <Facebook className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                  <Input
                    value={settings.facebook || ''}
                    onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-xl h-12 pr-10 font-bold text-white"
                    dir="ltr"
                    placeholder="رابط فيسبوك"
                  />
                </div>
                <div className="relative">
                  <Instagram className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                  <Input
                    value={settings.instagram || ''}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-xl h-12 pr-10 font-bold text-white"
                    dir="ltr"
                    placeholder="رابط انستجرام"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
