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
        } else {
          throw new Error('API error')
        }
      } catch (err) {
        console.error('Settings fetch error:', err)
        // Fallback settings if API fails
        setSettings({
          siteName: "البحراوي للدعاية والإعلان",
          siteNameEn: "ELBAHRAWY ADVERTISING",
          logoUrl: "/images/logo.png",
          whatsapp: "01120053007",
          email: "admin@elbahrawy.com",
          address: "العاشر من رمضان، الشرقية",
          facebook: "https://facebook.com",
          instagram: "https://instagram.com",
        })
        toast.error('تم تحميل الإعدادات الافتراضية')
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
        const data = await res.json()
        toast.error(data.error || 'فشل حفظ الإعدادات')
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
      fd.append('folder', 'branding')
      
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
      toast.error('حدث خطأ أثناء الرفع')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="max-w-5xl mx-auto space-y-4 px-4">
      {/* Header - Compact */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
        <div className="relative z-10">
          <h2 className="text-xl font-black text-white tracking-tighter">إعدادات المنصة</h2>
          <p className="text-muted-foreground text-[10px] font-bold">إدارة الهوية والبيانات</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-lg shadow-lg transition-all active:scale-95 group relative z-10 text-xs h-9 px-4"
        >
          {saving ? <Loader2 className="size-3 animate-spin ml-2" /> : <Save className="size-3 ml-2 group-hover:rotate-12 transition-transform" />}
          حفظ الإعدادات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Info - Bento Small */}
        <Card className="md:col-span-2 border border-white/5 bg-white/5 backdrop-blur-md rounded-xl overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Globe className="size-4" />
              <h3 className="text-sm font-black text-white">الهوية البصرية</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground font-black text-[9px] uppercase tracking-widest mr-1">الاسم (عربي)</Label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-lg h-9 font-bold text-xs focus:ring-primary/20 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground font-black text-[9px] uppercase tracking-widest mr-1">الاسم (EN)</Label>
                <Input
                  value={settings.siteNameEn}
                  onChange={(e) => setSettings({ ...settings, siteNameEn: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-lg h-9 font-bold text-xs focus:ring-primary/20 text-white"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="pt-2">
              <Label className="text-muted-foreground font-black text-[9px] uppercase tracking-widest mr-1 mb-2 block">الشعار</Label>
              <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="size-16 rounded-lg bg-black flex items-center justify-center overflow-hidden border border-white/10">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <ImageIcon className="size-6 text-white/10" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-black cursor-pointer transition-all border border-white/10 w-full justify-center"
                  >
                    {uploading ? <Loader2 className="size-3 animate-spin" /> : <ImageIcon className="size-3" />}
                    {uploading ? 'جاري الرفع...' : 'تغيير الشعار'}
                  </Label>
                  <p className="text-[8px] text-muted-foreground text-center">PNG, JPG (Max 2MB)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact - Bento Side */}
        <Card className="border border-white/5 bg-white/5 backdrop-blur-md rounded-xl overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <MessageCircle className="size-4" />
              <h3 className="text-sm font-black text-white">بيانات التواصل</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                  <MessageCircle className="size-3" /> واتساب
                </Label>
                <Input
                  value={settings.whatsapp || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  className="bg-white/5 border-white/10 rounded-lg h-9 font-bold text-xs focus:ring-primary/20 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="size-3" /> البريد
                </Label>
                <Input
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-lg h-9 font-bold text-xs focus:ring-primary/20 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="size-3" /> العنوان
                </Label>
                <Input
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-lg h-9 font-bold text-xs focus:ring-primary/20 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social - Bento Side */}
        <Card className="border border-white/5 bg-white/5 backdrop-blur-md rounded-xl overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Globe className="size-4" />
              <h3 className="text-sm font-black text-white">التواصل الاجتماعي</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                  <Facebook className="size-3" /> فيسبوك
                </Label>
                <Input
                  value={settings.facebook || ''}
                  onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-lg h-9 font-bold text-xs focus:ring-primary/20 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                  <Instagram className="size-3" /> انستجرام
                </Label>
                <Input
                  value={settings.instagram || ''}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-lg h-9 font-bold text-xs focus:ring-primary/20 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Key - Bento Side */}
        <Card className="md:col-span-2 border border-white/5 bg-white/5 backdrop-blur-md rounded-xl overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="size-4" />
              <h3 className="text-sm font-black text-white">إعدادات الذكاء الاصطناعي</h3>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-black text-[9px] uppercase tracking-widest">Gemini API Key</Label>
              <Input
                type="password"
                value={settings.geminiKey || ''}
                onChange={(e) => setSettings({ ...settings, geminiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="bg-white/5 border-white/10 rounded-lg h-9 font-bold text-xs focus:ring-primary/20 text-white"
              />
              <p className="text-[8px] text-muted-foreground">يستخدم لتوليد المنشورات التسويقية والردود الذكية</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
