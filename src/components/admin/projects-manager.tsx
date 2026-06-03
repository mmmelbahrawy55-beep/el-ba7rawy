'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Tag,
  Layout,
  Briefcase,
  FileText,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Switch } from '../ui/switch'
import { toast } from 'sonner'

interface Project {
  id: string
  title: string
  description: string | null
  imageUrl: string
  category: string
  clientName: string | null
  completionDate: string | null
  isFeatured: boolean
  sortOrder: number
}

interface ProjectFormData {
  title: string
  description: string
  imageUrl: string
  category: string
  clientName: string
  completionDate: string
  isFeatured: boolean
  sortOrder: number
}

const emptyForm: ProjectFormData = {
  title: '',
  description: '',
  imageUrl: '',
  category: '3D Letters',
  clientName: '',
  completionDate: '',
  isFeatured: false,
  sortOrder: 0,
}

const categories = [
  '3D Letters',
  'Printing',
  'Signboards',
  'Interior',
  'Exhibition',
  'Cladding',
  'Other'
]

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        // Sort projects by sortOrder, then by isFeatured
        const sorted = data.sort((a: Project, b: Project) => {
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return a.sortOrder - b.sortOrder
        })
        setProjects(sorted)
      }
    } catch {
      toast.error('فشل تحميل المشاريع')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await fetchProjects()
    }
    init()
  }, [fetchProjects])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formDataObj = new FormData()
    formDataObj.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, imageUrl: data.url }))
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
      toast.error('يرجى إدخال العنوان وصورة المشروع')
      return
    }

    setSaving(true)
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
      const method = editingProject ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editingProject ? 'تم تحديث المشروع' : 'تم إضافة المشروع')
        setDialogOpen(false)
        fetchProjects()
      }
    } catch {
      toast.error('خطأ في الاتصال')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id))
        toast.success('تم حذف المشروع')
      }
    } catch {
      toast.error('فشل الحذف')
    }
  }

  const openAddDialog = () => {
    setEditingProject(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description || '',
      imageUrl: project.imageUrl,
      category: project.category,
      clientName: project.clientName || '',
      completionDate: project.completionDate ? new Date(project.completionDate).toISOString().split('T')[0] : '',
      isFeatured: project.isFeatured,
      sortOrder: project.sortOrder,
    })
    setDialogOpen(true)
  }

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="بحث في معرض الأعمال..."
            className="pr-11 bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 rounded-2xl h-14 font-bold text-white"
          />
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-14 px-8 font-black shadow-lg shadow-primary/20 flex items-center gap-3 group transition-all active:scale-95"
        >
          <Plus className="size-6 group-hover:rotate-90 transition-transform duration-300" />
          إضافة مشروع جديد
        </Button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="bg-[#0c0c0c]/50 backdrop-blur-md border-white/10 rounded-[2.5rem] border-dashed">
          <CardContent className="p-24 text-center">
            <div className="bg-white/5 size-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
              <Layout className="size-12 text-white/10" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">لا توجد مشاريع</h3>
            <p className="text-muted-foreground font-bold max-w-xs mx-auto">ابدأ بإضافة أعمالك السابقة لتعرضها لعملائك</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="group bg-[#0c0c0c]/50 backdrop-blur-md border-white/10 rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-xl">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge className="bg-black/50 backdrop-blur-md text-white border-white/10 font-black text-[10px]">
                    {project.category}
                  </Badge>
                  {project.isFeatured && (
                    <Badge className="bg-primary text-primary-foreground border-none font-black text-[10px] shadow-lg shadow-primary/20">
                      مميز
                    </Badge>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Briefcase className="size-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{project.clientName || 'عميل خاص'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <Button
                    onClick={() => openEditDialog(project)}
                    variant="outline"
                    className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl h-11 font-black transition-all"
                  >
                    <Edit2 className="size-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(project.id)}
                    variant="outline"
                    className="size-11 p-0 bg-red-500/5 border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl bg-[#0c0c0c] border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-2xl font-arabic" dir="rtl">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <DialogHeader className="p-8 pb-4 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight">
              {editingProject ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 pt-0 space-y-8 relative z-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Edit2 className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">المعلومات الأساسية</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">عنوان المشروع *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="مثال: واجهة معرض سيارات"
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">التصنيف</Label>
                    <Select value={formData.category} onValueChange={(val: string) => setFormData({ ...formData, category: val })}>
                      <SelectTrigger className="h-12 rounded-xl border-white/10 bg-[#050505] font-bold text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <ImageIcon className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">صورة المشروع</h4>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="size-24 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="size-8 text-white/10" />
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="size-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <Input
                        value={formData.imageUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="رابط الصورة المباشر..."
                        className="bg-[#050505] border-white/10 rounded-xl h-10 text-xs text-white"
                        dir="ltr"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="project-img-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full bg-primary/10 text-primary hover:bg-primary/20 rounded-xl h-10 text-xs font-black border border-primary/10"
                          onClick={() => document.getElementById('project-img-upload')?.click()}
                          disabled={uploading}
                        >
                          رفع صورة جديدة
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Details */}
              <div className="space-y-6">
                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Tag className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">تفاصيل إضافية</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">اسم العميل</Label>
                    <Input
                      value={formData.clientName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="اختياري"
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">تاريخ الإنجاز</Label>
                    <Input
                      type="date"
                      value={formData.completionDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, completionDate: e.target.value })}
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Layout className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">إعدادات العرض</h4>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#050505] rounded-2xl border border-white/5">
                    <div className="space-y-0.5">
                      <p className="font-black text-sm text-white">مشروع مميز</p>
                      <p className="text-[10px] font-bold text-slate-500">يظهر في الصفحة الرئيسية</p>
                    </div>
                    <Switch
                      checked={formData.isFeatured}
                      onCheckedChange={(val: boolean) => setFormData({ ...formData, isFeatured: val })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">ترتيب العرض</Label>
                    <Input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-3 text-primary mb-2">
                <FileText className="size-4" />
                <h4 className="font-black text-xs uppercase tracking-widest">وصف المشروع</h4>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="اكتب تفاصيل إضافية عن المشروع..."
                className="w-full bg-[#050505] border-white/10 rounded-2xl min-h-[120px] p-4 font-bold text-white focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-8 border-t border-white/5 flex gap-4 relative z-10">
            <Button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex-1 bg-primary text-primary-foreground font-black rounded-2xl h-14 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {saving ? <Loader2 className="size-5 animate-spin" /> : (editingProject ? 'حفظ التغييرات' : 'إضافة المشروع للمعرض')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="px-10 h-14 border-white/10 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
