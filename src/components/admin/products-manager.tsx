'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Settings,
  FileText,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Card, CardContent } from '../ui/card'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  nameEn: string
}

interface Product {
  id: string
  name: string
  nameEn: string
  description: string
  imageUrl: string
  price: number
  unitType: string
  deliveryDays: number
  isActive: boolean
  sortOrder: number
  isHot: boolean
  discount: string | null
  category: {
    id: string
    name: string
    nameEn: string
  }
}

interface ProductFormData {
  categoryId: string
  name: string
  nameEn: string
  description: string
  imageUrl: string
  unitType: string
  price: number
  deliveryDays: number
  isActive: boolean
  sortOrder: number
  isHot: boolean
  discount: string
}

const emptyForm: ProductFormData = {
  categoryId: '',
  name: '',
  nameEn: '',
  description: '',
  imageUrl: '',
  unitType: 'meter',
  price: 0,
  deliveryDays: 3,
  isActive: true,
  sortOrder: 0,
  isHot: false,
  discount: '',
}

const unitTypeLabels: Record<string, string> = {
  meter: 'بالمتر المربع',
  piece: 'بالقطعة',
  letter: 'بالحرف',
  sheet: 'بالفرخ',
  thousand: 'بالألف قطعة',
  project: 'بالمشروع',
  car: 'بالسيارة',
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [productsRes, catsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories?admin=true'),
      ])
      
      let productsData = []
      let categoriesData = []

      if (productsRes.ok) {
        productsData = await productsRes.json()
      }
      
      if (catsRes.ok) {
        categoriesData = await catsRes.json()
      }

      setProducts(Array.isArray(productsData) ? productsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Fetch error:', error)
      setProducts([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSync = async () => {
    if (!confirm('سيتم حذف جميع المنتجات الحالية واستبدالها بالبيانات الافتراضية. هل أنت متأكد؟')) return

    setSyncing(true)
    try {
      const res = await fetch('/api/seed')
      if (res.ok) {
        toast.success('تمت مزامنة البيانات بنجاح')
        fetchData()
      } else {
        toast.error('فشل في مزامنة البيانات')
      }
    } catch (error) {
      toast.error('خطأ في الاتصال')
    } finally {
      setSyncing(false)
    }
  }

  const filteredProducts = (Array.isArray(products) ? products : []).filter((p) => {
    const matchesSearch =
      !search ||
      p?.name?.includes(search) ||
      p?.nameEn?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      filterCategory === 'all' || p?.category?.id === filterCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))

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
        setFormData((p) => ({ ...p, imageUrl: data.url }))
        toast.success('تم رفع الصورة بنجاح')
      } else {
        toast.error('فشل رفع الصورة')
      }
    } catch {
      toast.error('حدث خطأ أثناء رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.categoryId || !formData.name || !formData.nameEn) {
      toast.error('يرجى ملء الحقول المطلوبة')
      return
    }

    setSaving(true)
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editingProduct ? 'تم تحديث المنتج' : 'تم إضافة المنتج')
        setDialogOpen(false)
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم حذف المنتج')
        setProducts((prev) => prev.filter((p) => p.id !== deleteId))
      } else {
        toast.error('فشل حذف المنتج')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setDeleteId(null)
    }
  }

  const openAddDialog = () => {
    setEditingProduct(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      categoryId: product.category.id,
      name: product.name,
      nameEn: product.nameEn,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      unitType: product.unitType,
      price: product.price,
      deliveryDays: product.deliveryDays,
      isActive: product.isActive,
      sortOrder: product.sortOrder,
      isHot: product.isHot,
      discount: product.discount || '',
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
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="بحث باسم المنتج (عربي أو إنجليزي)..."
              className="pr-10 bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 rounded-xl h-10 font-bold text-[11px] text-white placeholder:text-muted-foreground/50"
            />
          </div>
          <Select value={filterCategory} onValueChange={(val: string) => setFilterCategory(val)}>
            <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 rounded-xl h-10 font-bold text-[11px] text-foreground">
              <SelectValue placeholder="كل التصنيفات" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/10 bg-card text-foreground">
              <SelectItem value="all">كل التصنيفات</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="border-primary/20 hover:bg-primary/10 text-primary rounded-xl h-10 px-4 font-black flex items-center gap-1.5 transition-all active:scale-95 text-[10px]"
          >
            {syncing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            مزامنة البيانات
          </Button>
          <Button
            onClick={openAddDialog}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 px-4 font-black shadow-lg shadow-primary/20 flex items-center gap-1.5 group transition-all active:scale-95 text-[10px]"
          >
            <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
            إضافة منتج
          </Button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar no-scrollbar">
         <button 
           onClick={() => setFilterCategory('all')}
           className={`px-4 py-2 rounded-xl font-black text-[10px] whitespace-nowrap transition-all border ${
             filterCategory === 'all' 
             ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10' 
             : 'bg-white/5 text-muted-foreground border-white/5 hover:border-white/10 hover:text-white'
           }`}
         >
           الكل ({products.length})
         </button>
         {categories.map(cat => (
           <button 
             key={cat.id}
             onClick={() => setFilterCategory(cat.id)}
             className={`px-4 py-2 rounded-xl font-black text-[10px] whitespace-nowrap transition-all border ${
               filterCategory === cat.id 
               ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10' 
               : 'bg-white/5 text-muted-foreground border-white/5 hover:border-white/10 hover:text-white'
             }`}
           >
             {cat.name} ({products.filter(p => p.category?.id === cat.id).length})
           </button>
         ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-md border-white/10 rounded-3xl border-dashed">
          <CardContent className="p-16 text-center">
            <div className="bg-white/5 size-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Package className="size-8 text-white/10" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">لا توجد منتجات</h3>
            <p className="text-muted-foreground font-bold text-xs max-w-xs mx-auto">لم يتم العثور على أي منتجات في هذا التصنيف حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group bg-card/50 backdrop-blur-md border-white/10 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-xl">
              <div className="relative h-44 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <ImageIcon className="size-10 text-white/10" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <Badge className={`px-2 py-0.5 rounded-full font-black text-[8px] uppercase tracking-widest border-none ${product.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-muted-foreground'}`}>
                    {product.isActive ? 'نشط' : 'متوقف'}
                  </Badge>
                  <Badge className="bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded-full font-black text-[8px] border border-white/10">
                    {product.sortOrder}#
                  </Badge>
                </div>
                {product.isHot && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-primary text-primary-foreground border-none px-2 py-0.5 rounded-full font-black text-[8px] flex items-center gap-1 shadow-lg shadow-primary/20">
                      <Zap className="size-2 fill-current" />
                      الأكثر طلباً
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 right-3">
                  <Badge className="bg-primary/20 text-primary border-none font-black text-[8px] px-2 py-0.5 rounded-full backdrop-blur-md">
                    {product.category?.name}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="text-base font-black text-white group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-tight line-clamp-1 mt-0.5">{product.nameEn}</p>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-white/5 mb-4">
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">السعر التقريبي</p>
                    <p className="text-lg font-black text-primary">
                      {product.price.toLocaleString('ar-EG')} 
                      <span className="text-[9px] mr-1">ج.م</span>
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">وحدة السعر</p>
                    <p className="text-xs font-black text-slate-200">{unitTypeLabels[product.unitType]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => openEditDialog(product)}
                    variant="outline"
                    className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl h-11 font-black transition-all"
                  >
                    <Edit2 className="size-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => setDeleteId(product.id)}
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
        <DialogContent className="max-w-4xl bg-card border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-2xl font-arabic max-h-[90vh] flex flex-col">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <DialogHeader className="p-8 pb-4 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight text-white">
              {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-8 relative z-10 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Edit2 className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">المعلومات الأساسية</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground font-bold text-xs">التصنيف الرئيسي *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(val: string) => setFormData((p) => ({ ...p, categoryId: val }))}
                    >
                      <SelectTrigger className="bg-background border-white/10 text-white h-12 rounded-xl font-bold">
                        <SelectValue placeholder="اختر التصنيف المناسب" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10 text-white font-arabic">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="font-bold">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground font-bold text-xs">اسم المنتج (عربي) *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: لافتة مضيئة"
                      className="bg-background border-white/10 rounded-xl h-12 font-bold text-white placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground font-bold text-xs">اسم المنتج (English) *</Label>
                    <Input
                      value={formData.nameEn}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Light Box"
                      className="bg-background border-white/10 rounded-xl h-12 font-bold text-white placeholder:text-muted-foreground/50"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <ImageIcon className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">صورة المنتج</h4>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="size-24 rounded-2xl bg-background border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="size-8 text-slate-800" />
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
                        className="bg-background border-white/10 rounded-xl h-10 text-xs text-white"
                        dir="ltr"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="img-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full bg-primary/10 text-primary hover:bg-primary/20 rounded-xl h-10 text-xs font-black border border-primary/10"
                          onClick={() => document.getElementById('img-upload')?.click()}
                          disabled={uploading}
                        >
                          رفع صورة من الجهاز
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Settings */}
              <div className="space-y-6">
                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <DollarSign className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">التسعير والوحدات</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-400 font-bold text-xs">السعر التقديري</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400 font-bold text-xs">مدة التنفيذ (أيام)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.deliveryDays}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, deliveryDays: parseInt(e.target.value) || 1 })}
                        className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-400 font-bold text-xs">طريقة حساب السعر (الوحدة)</Label>
                    <Select 
                      value={formData.unitType} 
                      onValueChange={(v: string) => setFormData({ ...formData, unitType: v })}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-white/10 bg-[#050505] font-bold text-white">
                        <SelectValue placeholder="اختر نوع الوحدة" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic">
                        <SelectItem value="meter">بالمتر المربع</SelectItem>
                        <SelectItem value="piece">بالقطعة</SelectItem>
                        <SelectItem value="letter">بالحرف</SelectItem>
                        <SelectItem value="sheet">بالفرخ</SelectItem>
                        <SelectItem value="thousand">بالألف قطعة</SelectItem>
                        <SelectItem value="project">بالمشروع</SelectItem>
                        <SelectItem value="car">بالسيارة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center gap-3 text-primary mb-2">
                    <Settings className="size-4" />
                    <h4 className="font-black text-xs uppercase tracking-widest">إعدادات العرض</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-[#050505] rounded-2xl border border-white/5">
                      <div className="space-y-0.5">
                        <p className="font-black text-[10px] text-white">الحالة</p>
                        <p className="text-[8px] font-bold text-slate-500">تفعيل/إخفاء</p>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(val: boolean) => setFormData({ ...formData, isActive: val })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#050505] rounded-2xl border border-white/5">
                      <div className="space-y-0.5">
                        <p className="font-black text-[10px] text-white">Hot</p>
                        <p className="text-[8px] font-bold text-slate-500">الأكثر طلباً</p>
                      </div>
                      <Switch
                        checked={formData.isHot}
                        onCheckedChange={(val: boolean) => setFormData({ ...formData, isHot: val })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-400 font-bold text-xs">نسبة الخصم</Label>
                      <Input
                        value={formData.discount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, discount: e.target.value })}
                        placeholder="مثال: 15%"
                        className="bg-[#050505] border-white/10 rounded-xl h-12 font-bold text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400 font-bold text-xs">الترتيب</Label>
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
            </div>

            <div className="space-y-4 bg-white/5 border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-3 text-primary mb-2">
                <FileText className="size-4" />
                <h4 className="font-black text-xs uppercase tracking-widest">وصف المنتج وتفاصيله</h4>
              </div>
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="اكتب وصفاً مفصلاً للمنتج ومميزاته..."
                className="bg-[#050505] border-white/10 rounded-2xl min-h-[120px] font-bold text-white placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="p-8 border-t border-white/5 flex gap-4 relative z-10">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary text-primary-foreground font-black rounded-2xl h-14 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {saving ? <Loader2 className="size-5 animate-spin" /> : (editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج للسيستم')}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-neutral-200 text-neutral-900 rounded-[2rem] p-8 font-arabic" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">حذف المنتج</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 text-lg font-bold">
              هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="bg-neutral-100 text-neutral-500 hover:bg-neutral-200 border-0 rounded-xl h-12 px-6 font-bold">
              تراجع
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl h-12 px-6 font-bold"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
