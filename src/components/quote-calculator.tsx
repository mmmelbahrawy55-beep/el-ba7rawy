'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  nameEn: string
  _count?: { products: number }
}

interface Product {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number
  unitType: string
  deliveryDays: number
}

export default function QuoteCalculator() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [width, setWidth] = useState<number>(1)
  const [height, setHeight] = useState<number>(1)
  const [letters, setLetters] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data && data.length > 0) {
          const mapped = data.map((c: any) => ({
            ...c,
            _count: { products: c.products?.length ?? 0 },
          }))
          setCategories(mapped)
          if (mapped.length > 0) setSelectedCategory(mapped[0])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Reset product when category changes
  useEffect(() => {
    const updateProduct = async () => {
      if (selectedCategory && (selectedCategory as any).products?.length > 0) {
        setSelectedProduct((selectedCategory as any).products[0])
      } else {
        setSelectedProduct(null)
      }
    }
    updateProduct()
  }, [selectedCategory])

  // Calculate total whenever inputs change
  useEffect(() => {
    const calculate = async () => {
      if (!selectedProduct) {
        setTotal(0)
        return
      }

      const pPrice = Number(selectedProduct.price) || 0
      const q = Number(quantity) || 1
      const w = Number(width) || 0
      const h = Number(height) || 0
      const l = Number(letters) || 0

      let calculatedTotal = 0
      if (selectedProduct.unitType === 'meter') {
        calculatedTotal = (w * h / 10000) * pPrice * q
      } else if (selectedProduct.unitType === 'letter') {
        calculatedTotal = l * pPrice * q
      } else {
        calculatedTotal = pPrice * q
      }

      setTotal(isNaN(calculatedTotal) ? 0 : Math.round(calculatedTotal))
    }
    calculate()
  }, [selectedProduct, quantity, width, height, letters])

  const handleOrderSubmit = async () => {
    if (!customerName || !phone) {
      toast.error('يرجى إدخال الاسم ورقم الهاتف')
      return
    }

    setIsSubmitting(true)
    try {
      const orderData = {
        customerName,
        phone,
        productId: selectedProduct?.id,
        productName: selectedProduct?.name,
        categoryName: selectedCategory?.name,
        quantity: selectedProduct?.unitType === 'meter' ? `${width}x${height} سم` : 
                  selectedProduct?.unitType === 'letter' ? `${letters} حرف` : 
                  `${quantity} قطعة`,
        details,
        estimatedPrice: total,
        deliveryDays: selectedProduct?.deliveryDays || 3
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (res.ok) {
        toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.')
        setIsOrderDialogOpen(false)
        setCustomerName('')
        setPhone('')
        setDetails('')
      } else {
        throw new Error('Failed to submit order')
      }
    } catch (error) {
      toast.error('عذراً، حدث خطأ أثناء إرسال الطلب.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <section id="quote-calculator" className="py-32 sm:py-48 bg-[#050505] relative overflow-hidden transition-colors duration-500">
      {/* Noise Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none" />

      <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-primary/10 blur-[180px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24 sm:mb-32">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.4em] mb-8 backdrop-blur-md">
            <Clock className="size-4" />
            <span>حاسبة الأسعار الذكية</span>
          </div>
          <h2 className="text-6xl sm:text-8xl font-black text-white tracking-tight mb-12 leading-[1.3] max-w-5xl mx-auto">
            خطط لمشروعك <br className="sm:hidden" />
            <span className="text-primary drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">بدقة</span> واحترافية
          </h2>
          <p className="text-slate-400 max-w-4xl mx-auto text-xl sm:text-3xl font-bold leading-[1.8] px-4">
            احصل على تقدير فوري ودقيق لتكلفة إعلانك القادم، مع خيارات مخصصة تناسب احتياجات علامتك التجارية.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-3xl border-white/5 rounded-[4rem] overflow-hidden shadow-2xl shadow-black/60 border-2">
            <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
              {/* Form Side */}
              <div className="lg:col-span-3 p-10 sm:p-16 space-y-12 border-b lg:border-b-0 lg:border-l border-white/5">
                <div className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-4 text-right">
                      <Label className="text-slate-500 font-black text-sm uppercase tracking-widest mr-3">اختر القسم</Label>
                      <Select 
                        value={selectedCategory?.id} 
                        onValueChange={(val: string) => {
                          const cat = categories.find(c => c.id === val)
                          if (cat) setSelectedCategory(cat)
                        }}
                      >
                        <SelectTrigger className="bg-[#0c0c0c] border-white/5 text-white rounded-2xl h-20 font-black text-xl focus:ring-primary/30 border-2" dir="rtl">
                          <SelectValue placeholder="اختر القسم..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic" dir="rtl">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="font-bold py-4 cursor-pointer text-white hover:bg-white/5">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4 text-right">
                      <Label className="text-slate-500 font-black text-sm uppercase tracking-widest mr-3">نوع الخدمة</Label>
                      <Select 
                        value={selectedProduct?.id} 
                        onValueChange={(val: string) => {
                          const prod = (selectedCategory as any)?.products?.find((p: any) => p.id === val)
                          if (prod) setSelectedProduct(prod)
                        }}
                      >
                        <SelectTrigger className="bg-[#0c0c0c] border-white/5 text-white rounded-2xl h-20 font-black text-xl focus:ring-primary/30 border-2" dir="rtl">
                          <SelectValue placeholder="اختر الخدمة..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic" dir="rtl">
                          {(selectedCategory as any)?.products?.map((prod: any) => (
                            <SelectItem key={prod.id} value={prod.id} className="font-bold py-4 cursor-pointer text-white hover:bg-white/5">
                              {prod.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dynamic Inputs Based on Price Unit */}
                  <div className="bg-[#0c0c0c] p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-inner">
                    {selectedProduct?.unitType === 'meter' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-6 duration-700">
                        <div className="space-y-4 text-right">
                          <Label className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mr-3">العرض (سم)</Label>
                          <Input 
                            type="number" 
                            value={width} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWidth(Number(e.target.value))}
                            className="bg-white/5 border-white/5 text-white rounded-2xl h-20 font-black text-2xl text-center focus:ring-primary border-2"
                          />
                        </div>
                        <div className="space-y-4 text-right">
                          <Label className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mr-3">الارتفاع (سم)</Label>
                          <Input 
                            type="number" 
                            value={height} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeight(Number(e.target.value))}
                            className="bg-white/5 border-white/5 text-white rounded-2xl h-20 font-black text-2xl text-center focus:ring-primary border-2"
                          />
                        </div>
                      </div>
                    ) : selectedProduct?.unitType === 'letter' ? (
                      <div className="space-y-4 text-right animate-in fade-in slide-in-from-top-6 duration-700">
                        <Label className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mr-3">عدد الحروف التقريبي</Label>
                        <Input 
                          type="number" 
                          value={letters} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLetters(Number(e.target.value))}
                          className="bg-white/5 border-white/5 text-white rounded-2xl h-20 font-black text-2xl text-center focus:ring-primary border-2"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-6 duration-700">
                        <Label className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mr-3 text-right block">الكمية (بالقطعة)</Label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
                          className="bg-white/5 border-white/5 text-white rounded-2xl h-20 font-black text-2xl text-center focus:ring-primary border-2"
                        />
                      </div>
                    )}

                    <div className="space-y-4 text-right">
                      <Label className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mr-3">الكمية / عدد النسخ</Label>
                      <div className="flex items-center gap-6">
                        <Button 
                          variant="outline" 
                          className="size-20 rounded-2xl border-white/5 bg-white/5 text-white text-3xl font-black hover:bg-white/10 border-2"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </Button>
                        <Input 
                          type="number" 
                          value={quantity} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Math.max(1, Number(e.target.value))) 
                          }
                          className="flex-1 bg-white/5 border-white/5 text-white rounded-2xl h-20 font-black text-2xl text-center border-2"
                        />
                        <Button 
                          variant="outline" 
                          className="size-20 rounded-2xl border-white/5 bg-white/5 text-white text-3xl font-black hover:bg-white/10 border-2"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Side */}
              <div className="lg:col-span-2 bg-white/5 p-10 sm:p-16 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2" />
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-black text-white mb-10 tracking-tighter">ملخص التقدير</h3>
                  <div className="space-y-8">
                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                      <span className="text-slate-500 font-black text-xs uppercase tracking-widest">الخدمة المختارة</span>
                      <span className="text-white font-black text-left text-lg tracking-tighter">{selectedProduct?.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                      <span className="text-slate-500 font-black text-xs uppercase tracking-widest">نظام التسعير</span>
                      <span className="text-white font-black text-left text-lg tracking-tighter">
                        {selectedProduct?.unitType === 'meter' ? 'بالمتر المربع' : 
                         selectedProduct?.unitType === 'letter' ? 'بالحرف' : 
                         'بالقطعة'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                      <span className="text-slate-500 font-black text-xs uppercase tracking-widest">الكمية</span>
                      <span className="text-white font-black text-left text-lg tracking-tighter">
                        {selectedProduct?.unitType === 'meter' ? `${width}×${height} سم (×${quantity})` : 
                         selectedProduct?.unitType === 'letter' ? `${letters} حرف (×${quantity})` : 
                         `${quantity} قطعة`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                      <span className="text-slate-500 font-black text-xs uppercase tracking-widest">وقت التنفيذ</span>
                      <div className="flex items-center gap-3 text-primary font-black">
                        <Clock className="size-5" />
                        <span className="text-lg tracking-tighter">{selectedProduct?.deliveryDays || 3} أيام عمل</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-16 space-y-10 relative z-10">
                  <div className="text-center">
                    <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4">الإجمالي التقديري</p>
                    <div className="flex items-baseline justify-center gap-3">
                      <span className="text-primary font-black text-2xl">ج.م</span>
                      <span className="text-7xl sm:text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                        {total.toLocaleString('ar-EG')}
                      </span>
                    </div>
                  </div>

                  <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-20 rounded-3xl text-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                        أرسل طلبي الآن
                        <CheckCircle2 className="mr-4 size-7 group-hover:scale-110 transition-transform" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0c0c0c] border-white/10 rounded-[3.5rem] p-10 font-arabic max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.8)]" dir="rtl">
                      <DialogHeader className="mb-10">
                        <DialogTitle className="text-3xl font-black text-white tracking-tighter">تأكيد طلب السعر</DialogTitle>
                        <DialogDescription className="text-slate-500 font-bold text-lg">أدخل بياناتك لنتواصل معك ونبدأ في تنفيذ طلبك الإبداعي</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-8">
                        <div className="space-y-3 text-right">
                          <Label className="text-slate-500 font-black mr-3 text-xs uppercase tracking-widest">الاسم بالكامل</Label>
                          <Input 
                            value={customerName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                            placeholder="أدخل اسمك الكريم"
                            className="bg-white/5 border-white/5 h-16 rounded-2xl text-white font-bold text-right focus:ring-primary border-2"
                          />
                        </div>
                        <div className="space-y-3 text-right">
                          <Label className="text-slate-500 font-black mr-3 text-xs uppercase tracking-widest">رقم الهاتف</Label>
                          <Input 
                            value={phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                            placeholder="رقم الواتساب للتواصل"
                            className="bg-white/5 border-white/5 h-16 rounded-2xl text-white font-bold focus:ring-primary border-2"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-3 text-right">
                          <Label className="text-slate-500 font-black mr-3 text-xs uppercase tracking-widest">ملاحظات إضافية</Label>
                          <Textarea 
                            value={details}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDetails(e.target.value)}
                            placeholder="أي تفاصيل أخرى تود إضافتها..."
                            className="bg-white/5 border-white/5 rounded-2xl text-white font-bold text-right h-32 resize-none focus:ring-primary border-2 p-6"
                          />
                        </div>
                        <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20 flex justify-between items-center shadow-inner">
                          <span className="text-slate-300 font-black text-sm uppercase tracking-widest">السعر التقديري</span>
                          <span className="text-primary font-black text-3xl drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">{total.toLocaleString('ar-EG')} ج.م</span>
                        </div>
                      </div>
                      <DialogFooter className="mt-12">
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-16 rounded-2xl text-xl shadow-2xl shadow-primary/20"
                          onClick={handleOrderSubmit}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? <Loader2 className="animate-spin size-6" /> : 'تأكيد وإرسال الطلب'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <p className="text-[11px] text-slate-600 font-black text-center leading-relaxed uppercase tracking-widest">
                    * هذا السعر تقديري وقد يختلف قليلاً حسب التفاصيل الفنية النهائية.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
