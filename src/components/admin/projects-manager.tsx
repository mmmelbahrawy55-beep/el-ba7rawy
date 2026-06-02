'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import Image from 'next/image'

interface Project {
  id: string
  title: string
  titleEn: string
  imageUrl: string
  category: string
  featured: boolean
}

const categories = [
  { id: 'flex', name: 'فليكس وبانر' },
  { id: '3d-signage', name: 'لافتات 3D' },
  { id: 'cladding', name: 'واجهات كلادينج' },
  { id: 'paper', name: 'مطبوعات ورقية' },
]

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    imageUrl: '',
    category: 'flex',
    featured: false,
  })

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) setProjects(await res.json())
    } catch {
      toast.error('فشل تحميل المشاريع')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

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
        setFormData((prev) => ({ ...prev, imageUrl: data.url }))
        toast.success('تم رفع الصورة بنجاح')
      }
    } catch {
      toast.error('فشل رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl) {
      toast.error('يرجى إكمال البيانات المطلوبة')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast.success('تم إضافة المشروع بنجاح')
        setDialogOpen(false)
        setFormData({ title: '', titleEn: '', imageUrl: '', category: 'flex', featured: false })
        fetchProjects()
      }
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم حذف المشروع')
        setProjects((prev) => prev.filter((p) => p.id !== id))
      }
    } catch {
      toast.error('فشل حذف المشروع')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2">
      {/* Header & Control Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-lg">
        <div>
          <h2 className="text-xl font-black text-white tracking-tighter">معرض الأعمال</h2>
          <p className="text-slate-500 font-bold text-[10px] mt-0.5">
            لديك <span className="text-primary">{projects.length}</span> عمل في المعرض
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-9 px-4 font-black text-xs shadow-lg shadow-primary/20 flex items-center gap-2 group transition-all active:scale-95"
        >
          <Plus className="size-3 group-hover:rotate-90 transition-transform duration-300" />
          مشروع جديد
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/5 rounded-xl shadow-xl hover:border-primary/30 transition-all duration-500 aspect-square flex flex-col">
            <div className="relative flex-1 overflow-hidden">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-3">
                <div className="flex items-center justify-between gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Badge className="bg-primary/20 text-primary border-none px-2 py-0.5 rounded-md text-[8px] font-black uppercase">
                    {categories.find(c => c.id === project.category)?.name || project.category}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                    className="size-7 p-0 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-3 bg-black/40 border-t border-white/5">
              <h4 className="text-xs font-black text-white truncate">{project.title}</h4>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
                    {project.title}
                  </h4>
                  <p className="text-slate-400 text-xs font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100 uppercase tracking-widest">
                    {project.titleEn}
                  </p>
                </div>

                {/* Featured Badge */}
                {project.featured && (
                  <div className="absolute top-6 left-6 size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 z-20 animate-pulse">
                    <Star className="size-6 fill-current" />
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl bg-[#0c0c0c] border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-2xl font-arabic">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <DialogHeader className="p-8 pb-4 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight">إضافة مشروع جديد</DialogTitle>
          </DialogHeader>

          <div className="p-8 pt-0 space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Plus className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">المعلومات الأساسية</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">اسم المشروع (عربي) *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="مثال: واجهة بنك مصر"
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">اسم المشروع (English)</Label>
                    <Input
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="e.g. Banque Misr Signage"
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white placeholder:text-slate-700"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Star className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">الإعدادات والتصنيف</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">التصنيف *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val: string) => setFormData({ ...formData, category: val })}
                    >
                      <SelectTrigger className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0c0c0c] border-white/10 rounded-xl text-white font-arabic">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="font-bold">{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#050505] rounded-2xl border border-white/5">
                    <div className="space-y-0.5">
                      <p className="font-black text-sm text-white">مشروع مميز (Featured)</p>
                      <p className="text-[10px] font-bold text-slate-500">سيظهر في الصفحة الرئيسية للموقع</p>
                    </div>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(val) => setFormData({ ...formData, featured: val })}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-6">
                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl h-full">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <ImageIcon className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">صورة المشروع</h4>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="aspect-[4/3] rounded-2xl bg-[#050505] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="size-12 text-slate-800 mx-auto mb-2" />
                          <p className="text-[10px] font-bold text-slate-600">أبعاد مقترحة: 4:3 أو 3:4</p>
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
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="أو أدخل رابط الصورة مباشرة..."
                        className="bg-[#050505] border-white/10 rounded-xl h-10 text-xs text-white"
                        dir="ltr"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="project-img-upload-new"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 font-black border-none shadow-lg shadow-primary/20"
                          onClick={() => document.getElementById('project-img-upload-new')?.click()}
                          disabled={uploading}
                        >
                          <Plus className="size-5 ml-2" />
                          اختيار صورة من الجهاز
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
                {saving ? <Loader2 className="size-5 animate-spin" /> : 'إضافة المشروع للمعرض'}
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
