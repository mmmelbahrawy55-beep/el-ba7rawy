'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Globe, 
  ImageIcon, 
  Loader2, 
  ExternalLink,
  Search,
  LayoutGrid
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Label } from '../ui/label'
import { toast } from 'sonner'
import Image from 'next/image'

interface Partner {
  id: string
  name: string
  imageUrl: string
  websiteUrl: string | null
  isActive: boolean
  sortOrder: number
}

export default function PartnersManager() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [currentPartner, setCurrentPartner] = useState<Partial<Partner>>({
    name: '',
    imageUrl: '',
    websiteUrl: '',
    sortOrder: 0,
    isActive: true
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setCurrentPartner((p) => ({ ...p, imageUrl: data.url }))
        toast.success('تم رفع الشعار بنجاح')
      } else {
        toast.error('فشل رفع الشعار')
      }
    } catch {
      toast.error('حدث خطأ أثناء الرفع')
    } finally {
      setUploading(false)
    }
  }

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/partners')
      const data = await res.json()
      setPartners(data)
    } catch (error) {
      toast.error('فشل في تحميل الشركاء')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await fetchPartners()
    }
    init()
  }, [])

  const handleSave = async () => {
    if (!currentPartner.name || !currentPartner.imageUrl) {
      toast.error('يرجى إكمال البيانات الأساسية')
      return
    }

    setSaving(true)
    try {
      const method = currentPartner.id ? 'PATCH' : 'POST'
      const res = await fetch('/api/partners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPartner)
      })

      if (res.ok) {
        toast.success(currentPartner.id ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح')
        fetchPartners()
        setDialogOpen(false)
        setCurrentPartner({ name: '', imageUrl: '', websiteUrl: '', sortOrder: 0, isActive: true })
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      const res = await fetch(`/api/partners?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPartners(partners.filter(p => p.id !== id))
        toast.success('تم الحذف بنجاح')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">شركاء النجاح</h2>
          <p className="text-muted-foreground font-bold mt-1">
            إدارة العلامات التجارية التي تضع ثقتها في <span className="text-primary">البحراوي</span>
          </p>
        </div>
        <Button
          onClick={() => {
            setCurrentPartner({ name: '', imageUrl: '', websiteUrl: '', sortOrder: 0, isActive: true })
            setDialogOpen(true)
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-14 px-8 font-black shadow-lg shadow-primary/20 flex items-center gap-3 group transition-all active:scale-95"
        >
          <Plus className="size-6 group-hover:rotate-90 transition-transform duration-300" />
          إضافة شريك جديد
        </Button>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="ابحث عن شريك نجاح..."
            className="pr-12 bg-white/5 border-white/10 text-white rounded-2xl h-14 font-bold shadow-2xl focus:ring-primary/20 placeholder:text-muted-foreground/30"
          />
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="group relative overflow-hidden bg-[#0c0c0c]/50 backdrop-blur-md border border-white/10 rounded-[2.5rem] shadow-2xl hover:border-primary/30 transition-all duration-500">
            <CardContent className="p-6">
              <div className="aspect-video relative mb-4 flex items-center justify-center bg-white/5 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                <Image
                  src={partner.imageUrl}
                  alt={partner.name}
                  fill
                  className="object-contain p-6 group-hover:scale-110 transition-transform duration-700 brightness-110 contrast-110"
                />
              </div>
              <div className="text-center">
                <p className="font-black text-white truncate text-sm">{partner.name}</p>
                <div className="flex items-center justify-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setCurrentPartner(partner)
                      setDialogOpen(true)
                    }}
                    className="size-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all"
                  >
                    <LayoutGrid className="size-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(partner.id)}
                    className="size-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#0c0c0c] border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-2xl font-arabic">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <DialogHeader className="p-8 pb-4 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight text-white">
              {currentPartner.id ? 'تعديل بيانات الشريك' : 'إضافة شريك جديد'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-8 pt-0 space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Plus className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">المعلومات الأساسية</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">اسم الشركة/الشريك *</Label>
                    <Input
                      value={currentPartner.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPartner({ ...currentPartner, name: e.target.value })}
                      placeholder="مثال: شركة الاتصالات السعودية"
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">رابط الموقع (اختياري)</Label>
                    <Input
                      value={currentPartner.websiteUrl || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPartner({ ...currentPartner, websiteUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white placeholder:text-slate-700"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl h-full">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <ImageIcon className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">شعار الشريك</h4>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="aspect-video rounded-2xl bg-[#050505] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">
                      {currentPartner.imageUrl ? (
                        <img src={currentPartner.imageUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="size-10 text-slate-800 mx-auto mb-2" />
                          <p className="text-[10px] font-bold text-slate-600">شعار بخلفية شفافة</p>
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="size-8 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        value={currentPartner.imageUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPartner({ ...currentPartner, imageUrl: e.target.value })}
                        placeholder="رابط الشعار المباشر..."
                        className="bg-[#050505] border-white/10 rounded-xl h-10 text-xs text-white"
                        dir="ltr"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="partner-img-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 font-black border-none shadow-lg shadow-primary/20"
                          onClick={() => document.getElementById('partner-img-upload')?.click()}
                          disabled={uploading}
                        >
                          اختيار شعار من الجهاز
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pb-8">
              <Button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex-1 bg-primary text-primary-foreground font-black rounded-2xl h-14 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {saving ? <Loader2 className="size-5 animate-spin" /> : (currentPartner.id ? 'حفظ التعديلات' : 'إضافة شريك جديد')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="px-10 h-14 border-white/10 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
