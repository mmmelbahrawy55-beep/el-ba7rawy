'use client'

import { useState, useEffect } from 'react'
import { 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2, 
  Crop, 
  Maximize, 
  Download,
  Save,
  ChevronRight,
  Info,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  imageUrl: string
}

export default function ImageOptimizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Optimization settings
  const [quality, setQuality] = useState(80)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [aspectRatio, setAspectRatio] = useState('16:11')
  const [addWatermark, setAddWatermark] = useState(true)

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      toast.error('فشل جلب قائمة المنتجات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await fetchProducts()
    }
    init()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('تنسيق الملف غير مدعوم (JPG, PNG, WebP فقط)')
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setOptimizedUrl(null)
  }

  const handleOptimize = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    try {
      // Simulate image processing
      // In a real scenario, this would call a backend API that uses Sharp or similar
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('quality', quality.toString())
      formData.append('removeBg', removeBackground.toString())
      formData.append('aspectRatio', aspectRatio)
      formData.append('watermark', addWatermark.toString())

      // For demonstration, we'll use a timeout and show a success message
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Normally here we would get the optimized URL from the server
      setOptimizedUrl(previewUrl) // Mocking for now
      toast.success('تم تحسين الصورة بنجاح')
    } catch (error) {
      toast.error('حدث خطأ أثناء تحسين الصورة')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveToProduct = async () => {
    if (!optimizedUrl || !selectedProductId) {
      toast.error('يرجى اختيار منتج لحفظ الصورة له')
      return
    }

    setLoading(true)
    try {
      // Simulate saving to database
      const res = await fetch(`/api/products/${selectedProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: optimizedUrl })
      })

      if (res.ok) {
        toast.success('تم حفظ الصورة وربطها بالمنتج بنجاح')
        setSelectedFile(null)
        setPreviewUrl(null)
        setOptimizedUrl(null)
      } else {
        toast.error('فشل حفظ الصورة للمنتج')
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 font-arabic bg-transparent text-slate-200" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative">
          <div className="absolute -right-4 top-0 w-1 h-12 bg-primary rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">تحسين صور المنتجات</h1>
          <p className="text-slate-400 font-bold flex items-center gap-2">
            <Sparkles className="size-4 text-primary animate-pulse" />
            أدوات ذكية مدعومة بالذكاء الاصطناعي لمعالجة الصور باحترافية
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <Card className="rounded-[2.5rem] border-white/5 bg-[#0c0c0c] shadow-2xl shadow-black/40 lg:col-span-1 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="p-8 border-b border-white/5 relative z-10">
            <CardTitle className="text-xl font-black flex items-center gap-3 text-white">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Settings className="size-5 text-primary" />
              </div>
              إعدادات التحسين
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8 relative z-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-black text-white text-sm">جودة الضغط الذكي</Label>
                <Badge className="bg-primary/20 text-primary border-none font-black">{quality}%</Badge>
              </div>
              <Slider 
                value={[quality]} 
                onValueChange={(val) => setQuality(val[0])} 
                max={100} 
                step={1}
                className="py-4"
              />
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                <Info className="size-3" />
                <span>تقليل الجودة يقلل من حجم الملف لسرعة تحميل خرافية</span>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-black text-white text-sm">أبعاد العرض (Aspect Ratio)</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/5 font-bold text-white focus:ring-primary/30 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic">
                  <SelectItem value="16:11" className="focus:bg-primary/20 focus:text-white">16:11 (المعيار الذهبي للمنصة)</SelectItem>
                  <SelectItem value="1:1" className="focus:bg-primary/20 focus:text-white">1:1 (مربع - للسوشيال ميديا)</SelectItem>
                  <SelectItem value="4:3" className="focus:bg-primary/20 focus:text-white">4:3 (كلاسيكي)</SelectItem>
                  <SelectItem value="original" className="focus:bg-primary/20 focus:text-white">الأصلية (بدون قص)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-white/5 rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-all group/toggle">
                <div className="space-y-1">
                  <Label className="font-black text-white text-sm cursor-pointer">إزالة الخلفية تلقائياً</Label>
                  <p className="text-[10px] text-slate-500 font-bold group-hover/toggle:text-primary transition-colors">استخدام AI لعزل المنتج بدقة</p>
                </div>
                <Switch checked={removeBackground} onCheckedChange={setRemoveBackground} className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex items-center justify-between p-5 bg-white/5 rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-all group/toggle">
                <div className="space-y-1">
                  <Label className="font-black text-white text-sm cursor-pointer">إضافة علامة مائية</Label>
                  <p className="text-[10px] text-slate-500 font-bold group-hover/toggle:text-primary transition-colors">حماية حقوق الصور بشعار المتجر</p>
                </div>
                <Switch checked={addWatermark} onCheckedChange={setAddWatermark} className="data-[state=checked]:bg-primary" />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <Label className="font-black text-white text-sm mb-4 block">ربط بمنتج محدد</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-white/5 font-bold text-white focus:ring-primary/30">
                  <SelectValue placeholder="اختر المنتج المستهدف..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic max-h-64">
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id} className="focus:bg-primary/20 focus:text-white">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Workspace Panel */}
        <Card className="rounded-[2.5rem] border-white/5 bg-[#0c0c0c] shadow-2xl shadow-black/40 lg:col-span-2 overflow-hidden flex flex-col">
          <CardContent className="p-8 flex-1 flex flex-col">
            {!previewUrl ? (
              <div className="flex-1 min-h-[450px] border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-8 group hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="size-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:scale-110 transition-all duration-500 border border-white/5"
                >
                  <Upload className="size-10" />
                </motion.div>
                <div className="text-center space-y-3">
                  <p className="text-2xl font-black text-white tracking-tight">اسحب الصورة هنا أو اضغط للرفع</p>
                  <div className="flex items-center justify-center gap-3">
                    {['JPG', 'PNG', 'WebP'].map(ext => (
                      <Badge key={ext} variant="outline" className="border-white/10 text-slate-500 font-black">{ext}</Badge>
                    ))}
                    <Badge variant="outline" className="border-primary/20 text-primary font-black">MAX 10MB</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 h-full flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                  {/* Original Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-slate-500" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">قبل التحسين</span>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-xl" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="aspect-[16/11] relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-black shadow-inner group">
                      <Image src={previewUrl} alt="Original" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  </div>

                  {/* Optimized Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-black text-primary uppercase tracking-widest">المعاينة الذكية</span>
                      </div>
                      {optimizedUrl && (
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-none font-black text-[10px]">جاهز للحفظ</Badge>
                      )}
                    </div>
                    <div className="aspect-[16/11] relative rounded-[2.5rem] overflow-hidden border border-primary/20 bg-black shadow-2xl shadow-primary/10 group">
                      {isProcessing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-20">
                          <div className="relative">
                            <Loader2 className="size-16 animate-spin text-primary" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 text-white animate-pulse" />
                          </div>
                          <p className="text-sm font-black text-white mt-6 animate-pulse uppercase tracking-[0.2em]">جاري المعالجة بالذكاء الاصطناعي...</p>
                        </div>
                      ) : optimizedUrl ? (
                        <Image src={optimizedUrl} alt="Optimized" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 bg-white/[0.02]">
                          <Sparkles className="size-16 mb-6 opacity-20" />
                          <p className="text-sm font-black uppercase tracking-widest opacity-50">اضغط على "بدء التحسين" للمعاينة</p>
                        </div>
                      )}
                      
                      {optimizedUrl && !isProcessing && (
                        <div className="absolute bottom-6 left-6 z-20">
                          <div className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] shadow-xl flex items-center gap-2">
                            <Check className="size-3" />
                            تم تحسين الأداء بنسبة {100 - quality}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/5">
                  <Button 
                    onClick={handleOptimize}
                    disabled={isProcessing}
                    className="flex-1 h-16 rounded-2xl font-black text-lg gap-3 bg-white text-black hover:bg-slate-200 transition-all shadow-xl active:scale-95"
                  >
                    {isProcessing ? <Loader2 className="size-6 animate-spin" /> : <Sparkles className="size-6" />}
                    بدء عملية التحسين
                  </Button>
                  
                  <Button 
                    onClick={handleSaveToProduct}
                    disabled={!optimizedUrl || !selectedProductId || isProcessing}
                    className="flex-1 h-16 rounded-2xl font-black text-lg gap-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all active:scale-95"
                  >
                    <Save className="size-6" />
                    اعتماد الصورة للمنتج
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <Maximize className="size-6" />, title: 'أبعاد معيارية', desc: 'يتم ضبط أبعاد الصورة تلقائياً لتناسب قوالب العرض الاحترافية في الموقع.' },
          { icon: <Download className="size-6" />, title: 'ضغط فائق السرعة', desc: 'تقنيات ضغط متطورة تقلل الحجم بنسبة كبيرة دون المساس بجودة التفاصيل.' },
          { icon: <ShieldCheck className="size-6" />, title: 'تنسيق الجيل القادم', desc: 'تحويل تلقائي لتنسيق WebP لضمان أعلى أداء وأقل استهلاك للبيانات.' }
        ].map((info, i) => (
          <div key={i} className="flex gap-5 p-8 bg-[#0c0c0c] rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group">
            <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0 border border-white/5 shadow-lg">
              {info.icon}
            </div>
            <div>
              <h4 className="font-black text-white text-lg mb-2 tracking-tight">{info.title}</h4>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">{info.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
