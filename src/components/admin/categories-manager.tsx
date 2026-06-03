'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Printer,
  Box,
  Building2,
  FileText,
  Palette,
  Car,
  Eye,
  Monitor,
  Pen,
  Lightbulb,
  Star,
  FolderTree,
  Image as ImageIcon,
  Package,
  Settings,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Card, CardContent } from '../ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { ScrollArea } from '../ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  nameEn: string
  icon: string
  color: string
  sortOrder: number
  isActive: boolean
  _count: {
    products: number
  }
}

const iconOptions = [
  { value: 'Printer', label: 'طابعة', Icon: Printer },
  { value: 'Box', label: 'صندوق', Icon: Box },
  { value: 'Building2', label: 'مبنى', Icon: Building2 },
  { value: 'FileText', label: 'ملف', Icon: FileText },
  { value: 'Palette', label: 'ألوان', Icon: Palette },
  { value: 'Car', label: 'سيارة', Icon: Car },
  { value: 'Eye', label: 'عرض', Icon: Eye },
  { value: 'Monitor', label: 'شاشة', Icon: Monitor },
  { value: 'Pen', label: 'تصميم', Icon: Pen },
  { value: 'Lightbulb', label: 'إبداع', Icon: Lightbulb },
  { value: 'Star', label: 'نجمة', Icon: Star },
]

const colorOptions = [
  { value: 'blue', label: 'أزرق', class: 'bg-blue-400' },
  { value: 'amber', label: 'ذهبي', class: 'bg-amber-400' },
  { value: 'emerald', label: 'أخضر', class: 'bg-emerald-400' },
  { value: 'purple', label: 'بنفسجي', class: 'bg-purple-400' },
  { value: 'rose', label: 'وردي', class: 'bg-rose-400' },
  { value: 'cyan', label: 'سماوي', class: 'bg-cyan-400' },
  { value: 'orange', label: 'برتقالي', class: 'bg-orange-400' },
]

interface CategoryFormData {
  name: string
  nameEn: string
  icon: string
  color: string
  isActive: boolean
  sortOrder: number
}

const emptyForm: CategoryFormData = {
  name: '',
  nameEn: '',
  icon: 'Printer',
  color: 'blue',
  isActive: true,
  sortOrder: 0,
}

function CategoryIcon({ iconName, className }: { iconName: string; className?: string }) {
  const iconMap: Record<string, typeof Printer> = {
    Printer,
    Box,
    Building2,
    FileText,
    Palette,
    Car,
    Eye,
    Monitor,
    Pen,
    Lightbulb,
    Star,
  }
  const IconComponent = iconMap[iconName] || Printer
  return <IconComponent className={className} />
}

function ColorDot({ color }: { color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
    purple: 'bg-purple-400',
    rose: 'bg-rose-400',
    cyan: 'bg-cyan-400',
    orange: 'bg-orange-400',
  }
  return (
    <span className={`inline-block w-3 h-3 rounded-full ${colorMap[color] || 'bg-gray-400'}`} />
  )
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    nameEn: '',
    price: '',
    unitType: 'meter',
    deliveryDays: '3',
    imageUrl: ''
  })

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories?admin=true')
      if (res.ok) setCategories(await res.json())
    } catch {
      toast.error('فشل تحميل التصنيفات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSave = async () => {
    if (!formData.name || !formData.nameEn) {
      toast.error('يرجى إدخال الاسم بالعربية والإنجليزية')
      return
    }

    setSaving(true)
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editingCategory ? 'تم تحديث التصنيف' : 'تم إضافة التصنيف')
        setDialogOpen(false)
        fetchCategories()
      } else {
        toast.error('فشل الحفظ')
      }
    } catch {
      toast.error('خطأ في الاتصال')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم حذف التصنيف')
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || 'فشل حذف التصنيف')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setDeleteId(null)
    }
  }

  const fetchCategoryProducts = async (categoryId: string) => {
    setProductsLoading(true)
    try {
      const res = await fetch(`/api/products?categoryId=${categoryId}`)
      if (res.ok) {
        const data = await res.json()
        setCategoryProducts(data)
      }
    } catch (error) {
      toast.error('فشل تحميل المنتجات')
    } finally {
      setProductsLoading(false)
    }
  }

  const handleOpenProducts = (cat: Category) => {
    setSelectedCategory(cat)
    fetchCategoryProducts(cat.id)
    setIsProductsDialogOpen(true)
  }

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (res.ok) {
        setCategoryProducts(prev => prev.map(p => p.id === productId ? { ...p, isActive: !currentStatus } : p))
        toast.success(currentStatus ? 'تم إخفاء المنتج' : 'تم تفعيل المنتج')
      }
    } catch (error) {
      toast.error('فشل تحديث الحالة')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (res.ok) {
        setCategoryProducts(prev => prev.filter(p => p.id !== productId))
        toast.success('تم حذف المنتج بنجاح')
        fetchCategories()
      }
    } catch (error) {
      toast.error('فشل حذف المنتج')
    }
  }

  const handleAddProduct = async () => {
    if (!selectedCategory || !newProduct.name) return
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          categoryId: selectedCategory.id,
          price: parseFloat(newProduct.price) || 0,
          deliveryDays: parseInt(newProduct.deliveryDays) || 3
        })
      })

      if (res.ok) {
        toast.success('تم إضافة المنتج للقسم بنجاح')
        setIsAddProductOpen(false)
        setNewProduct({ name: '', nameEn: '', price: '', unitType: 'meter', deliveryDays: '3', imageUrl: '' })
        fetchCategoryProducts(selectedCategory.id)
        fetchCategories()
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الإضافة')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formDataObj = new FormData()
    formDataObj.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formDataObj })
      if (res.ok) {
        const data = await res.json()
        setNewProduct(prev => ({ ...prev, imageUrl: data.url }))
        toast.success('تم رفع الصورة')
      }
    } catch {
      toast.error('فشل الرفع')
    } finally {
      setUploading(false)
    }
  }

  const openAddDialog = () => {
    setEditingCategory(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      nameEn: cat.nameEn,
      icon: cat.icon,
      color: cat.color,
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
    })
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">إدارة الأقسام</h2>
          <p className="text-muted-foreground font-bold mt-1">
            لديك حالياً <span className="text-primary">{categories.length}</span> تصنيف رئيسي في السيستم
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-14 px-8 font-black shadow-lg shadow-primary/20 flex items-center gap-3 group transition-all active:scale-95"
        >
          <Plus className="size-6 group-hover:rotate-90 transition-transform duration-300" />
          إضافة قسم جديد
        </Button>
      </div>

      {/* Categories Grid */}
      {!Array.isArray(categories) || categories.length === 0 ? (
        <Card className="bg-[#0c0c0c]/50 backdrop-blur-md border-white/10 rounded-[2.5rem] border-dashed">
          <CardContent className="p-24 text-center">
            <div className="bg-white/5 size-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
              <FolderTree className="size-12 text-white/10" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">لا توجد أقسام</h3>
            <p className="text-muted-foreground font-bold max-w-xs mx-auto">ابدأ بإضافة أول قسم لتنظيم منتجاتك وخدماتك</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Card key={cat.id} className="group bg-[#0c0c0c]/50 backdrop-blur-md border-white/10 rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-xl relative">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className={`p-5 rounded-3xl bg-white/5 border border-white/10 group-hover:scale-110 transition-all duration-500 shadow-inner`}>
                    <CategoryIcon iconName={cat.icon} className={`size-8 text-primary shadow-primary/20 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border-none ${cat.isActive ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5' : 'bg-white/10 text-muted-foreground'}`}>
                      {cat.isActive ? 'نشط' : 'متوقف'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-8">
                  <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors tracking-tight">{cat.name}</h3>
                  <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">{cat.nameEn}</p>
                </div>

                <div className="flex items-center justify-between py-5 border-y border-white/5 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Package className="size-5 text-white/20" />
                    </div>
                    <div>
                      <p className="text-white font-black text-lg">{cat._count?.products || 0}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">منتج مسجل</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenProducts(cat)}
                    className="text-primary hover:text-white hover:bg-primary font-black text-xs rounded-xl px-4 h-10 border border-primary/20 hover:border-primary transition-all shadow-lg shadow-primary/5"
                  >
                    عرض المنتجات
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => openEditDialog(cat)}
                    variant="outline"
                    className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl h-12 font-black transition-all"
                  >
                    <Edit2 className="size-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => setDeleteId(cat.id)}
                    variant="outline"
                    className="size-12 p-0 bg-red-500/5 border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl bg-[#0c0c0c] border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-2xl font-arabic">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <DialogHeader className="p-8 pb-4 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight">
              {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 pt-0 space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Names */}
              <div className="space-y-6">
                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Edit2 className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">المعلومات الأساسية</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">اسم القسم (بالعربي)</Label>
                    <Input
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: لوحات إعلانية"
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">اسم القسم (English)</Label>
                    <Input
                      value={formData.nameEn}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Signboards"
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white placeholder:text-slate-700"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Settings className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">إعدادات العرض</h4>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#050505] rounded-2xl border border-white/5">
                    <div className="space-y-0.5">
                      <p className="font-black text-sm text-white">حالة القسم</p>
                      <p className="text-[10px] font-bold text-slate-500">تفعيل أو إخفاء القسم من المتجر</p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(val: boolean) => setFormData({ ...formData, isActive: val })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-400 font-bold text-xs">ترتيب العرض (Sort Order)</Label>
                    <Input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                      className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Icon & Color Selection */}
              <div className="space-y-6">
                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl h-full">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Palette className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">الأيقونة والمظهر</h4>
                  </div>
                  
                  <Label className="text-slate-400 font-bold text-xs">اختر أيقونة معبرة</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {iconOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFormData({ ...formData, icon: opt.value })}
                        className={`size-14 rounded-2xl flex items-center justify-center transition-all border ${
                          formData.icon === opt.value 
                          ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110' 
                          : 'bg-[#050505] border-white/5 text-slate-500 hover:border-white/10'
                        }`}
                        title={opt.label}
                      >
                        <opt.Icon className="size-6" />
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 space-y-3">
                    <Label className="text-slate-400 font-bold text-xs">لون القسم الرئيسي</Label>
                    <div className="flex flex-wrap gap-3">
                      {colorOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFormData({ ...formData, color: opt.value })}
                          className={`size-10 rounded-full border-2 transition-all p-0.5 ${
                            formData.color === opt.value ? 'border-primary scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className={`w-full h-full rounded-full ${opt.class}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pb-8">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground font-black rounded-2xl h-14 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {saving ? <Loader2 className="size-5 animate-spin" /> : (editingCategory ? 'حفظ التغييرات' : 'إنشاء القسم الجديد')}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[#0c0c0c] border border-white/10 shadow-2xl rounded-3xl text-white max-w-sm p-8 font-arabic" dir="rtl">
          <AlertDialogHeader>
            <div className="bg-red-500/10 size-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 className="size-8 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-center">حذف التصنيف؟</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-center font-bold mt-2">
              هل أنت متأكد من حذف هذا التصنيف؟ لا يمكن التراجع عن هذه الخطوة، وسيتم الحذف فقط إذا كان التصنيف خالياً من المنتجات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-row gap-3">
            <AlertDialogCancel className="flex-1 bg-white/5 text-muted-foreground hover:bg-white/10 border-white/10 h-12 rounded-xl font-bold mt-0">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 h-12 rounded-xl font-bold border-none"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Products Manager Dialog */}
      <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
        <DialogContent className="bg-[#0c0c0c] border border-white/10 shadow-2xl rounded-[2.5rem] text-white max-w-3xl p-0 overflow-hidden font-arabic" dir="rtl">
          <DialogHeader className="p-8 bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`size-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  colorOptions.find((c) => c.value === selectedCategory?.color)?.class || 'bg-primary'
                }`}>
                  <CategoryIcon iconName={selectedCategory?.icon || 'Box'} className="size-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-white">منتجات قسم {selectedCategory?.name}</DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground">إدارة المنتجات المضافة لهذا القسم حالياً</DialogDescription>
                </div>
              </div>
              <Button onClick={() => setIsAddProductOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl gap-2">
                <Plus className="size-4" />
                إضافة منتج للقسم
              </Button>
            </div>
          </DialogHeader>

          <div className="p-8">
            {productsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="font-bold text-muted-foreground">جاري تحميل المنتجات...</p>
              </div>
            ) : categoryProducts.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 text-muted-foreground">
                <Package className="size-16 opacity-20" />
                <p className="text-xl font-black">لا توجد منتجات في هذا القسم بعد</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {categoryProducts.map((product) => (
                    <div key={product.id} className="group flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-[1.5rem] hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="size-16 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="size-6 text-muted-foreground/20" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-white">{product.name}</h4>
                          <p className="text-primary font-black text-sm">{product.price.toLocaleString()} ج.م</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-1 ml-4">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">الحالة</span>
                          <Switch 
                            checked={product.isAvailable} 
                            onCheckedChange={() => handleToggleProductStatus(product.id, product.isAvailable)}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="size-10 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="size-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end">
            <Button onClick={() => setIsProductsDialogOpen(false)} className="bg-primary text-primary-foreground font-black px-8 h-12 rounded-xl">
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Add Product to Category */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="bg-[#0c0c0c] border border-white/10 shadow-2xl rounded-[2.5rem] text-white max-w-md p-8 font-arabic" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-right">إضافة منتج لـ {selectedCategory?.name}</DialogTitle>
            <DialogDescription className="text-right font-bold text-muted-foreground">أدخل تفاصيل المنتج الجديد ليظهر في هذا القسم.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-black">اسم المنتج (عربي)</Label>
              <Input 
                placeholder="مثال: لافته فليكس" 
                value={newProduct.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, name: e.target.value})}
                className="font-bold rounded-xl h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black">السعر</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={newProduct.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, price: e.target.value})}
                  className="font-bold rounded-xl h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black">أيام التنفيذ</Label>
                <Input 
                  type="number" 
                  placeholder="3" 
                  value={newProduct.deliveryDays}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, deliveryDays: e.target.value})}
                  className="font-bold rounded-xl h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black">صورة المنتج</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="رابط الصورة أو ارفع ملف" 
                  value={newProduct.imageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  className="font-bold rounded-xl h-12 flex-1 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30"
                />
                <div className="relative">
                  <input 
                    type="file" 
                    id="product-img-upload"
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('product-img-upload')?.click()}
                    className="h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10" 
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsAddProductOpen(false)} className="font-bold rounded-xl text-muted-foreground hover:text-white hover:bg-white/5">إلغاء</Button>
            <Button onClick={handleAddProduct} className="bg-primary text-primary-foreground font-black rounded-xl px-8 flex-1">حفظ المنتج</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
