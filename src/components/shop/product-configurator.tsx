'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  Ruler, 
  Layers, 
  Upload, 
  FileText, 
  ShoppingCart, 
  ArrowLeft,
  Info,
  Link as LinkIcon,
  Palette,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useCartStore, CartItem } from '@/lib/cart-store'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'

interface ProductConfiguratorProps {
  product: any
}

const MATERIALS = [
  { id: 'standard', name: 'خامة قياسية', description: 'مناسبة للاستخدام الداخلي والخارجي الخفيف', priceMod: 1 },
  { id: 'premium', name: 'خامة فاخرة', description: 'جودة عالية وألوان أكثر حيوية', priceMod: 1.3 },
  { id: 'heavy-duty', name: 'خامة شديدة التحمل', description: 'مقاومة للعوامل الجوية القاسية', priceMod: 1.6 },
]

export default function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  
  const [step, setStep] = useState(1)
  const [material, setMaterial] = useState(MATERIALS[0])
  const [size, setSize] = useState({ width: 1, height: 1 })
  const [designOption, setDesignOption] = useState<'upload' | 'request'>('upload')
  const [designData, setDesignData] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const calculatePrice = () => {
    let basePrice = product.pricePerMeter || product.priceFlat || 0
    if (product.unitType === 'meter') {
      basePrice = basePrice * size.width * size.height
    }
    return Math.round(basePrice * material.priceMod)
  }

  const currentPrice = calculatePrice()

  const handleAddToCart = () => {
    setIsAdding(true)
    
    const cartItem: CartItem = {
      id: uuidv4(),
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      material: material.name,
      size: size,
      designOption: designOption,
      designData: designData,
      price: currentPrice,
      quantity: quantity,
    }

    addItem(cartItem)
    
    toast.success('تمت الإضافة إلى العربة بنجاح')
    setIsAdding(false)
    router.push('/cart')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Product Image & Info */}
      <div className="lg:col-span-5 space-y-6">
        <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/10">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 right-6 text-right">
            <Badge className="mb-2 bg-primary text-black font-black uppercase tracking-widest">
              {product.unitType === 'meter' ? 'سعر للمتر' : 'سعر ثابت'}
            </Badge>
            <h2 className="text-3xl font-black text-white">{product.name}</h2>
          </div>
        </div>
        
        <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl">
          <h3 className="font-black text-white mb-4 flex items-center gap-2">
            <Info className="size-4 text-primary" />
            حول المنتج
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>
        </Card>
      </div>

      {/* Configurator Steps */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 1, name: 'الخامة', icon: Layers },
            { id: 2, name: 'المقاس', icon: Ruler },
            { id: 3, name: 'التصميم', icon: FileText },
            { id: 4, name: 'التأكيد', icon: ShoppingCart },
          ].map((s) => (
            <div 
              key={s.id}
              onClick={() => step > s.id && setStep(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                step === s.id 
                  ? 'bg-primary border-primary text-black font-black' 
                  : step > s.id 
                    ? 'bg-primary/20 border-primary/30 text-primary font-bold' 
                    : 'bg-white/5 border-white/10 text-muted-foreground'
              }`}
            >
              <s.icon className="size-4" />
              <span className="text-xs">{s.name}</span>
              {step > s.id && <Check className="size-3" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white text-right">اختر نوع الخامة</h3>
                <RadioGroup 
                  value={material.id} 
                  onValueChange={(val) => setMaterial(MATERIALS.find(m => m.id === val)!)}
                  className="grid grid-cols-1 gap-4"
                >
                  {MATERIALS.map((m) => (
                    <Label
                      key={m.id}
                      className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                        material.id === m.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <RadioGroupItem value={m.id} className="sr-only" />
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-lg font-black text-white">{m.name}</span>
                        {m.priceMod > 1 && (
                          <Badge variant="outline" className="text-primary border-primary/20">
                            +{Math.round((m.priceMod - 1) * 100)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <Button onClick={() => setStep(2)} className="w-full bg-primary font-black h-12 rounded-xl">المتابعة للمقاس</Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white text-right">حدد المقاسات المطلوبة</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white font-bold block text-right">العرض (متر)</Label>
                    <Input 
                      type="number" 
                      min="0.1" 
                      step="0.1"
                      value={size.width}
                      onChange={(e) => setSize({ ...size, width: parseFloat(e.target.value) })}
                      className="bg-white/5 border-white/10 h-12 text-center text-lg font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white font-bold block text-right">الارتفاع (متر)</Label>
                    <Input 
                      type="number" 
                      min="0.1" 
                      step="0.1"
                      value={size.height}
                      onChange={(e) => setSize({ ...size, height: parseFloat(e.target.value) })}
                      className="bg-white/5 border-white/10 h-12 text-center text-lg font-black"
                    />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                  <Info className="size-5 text-blue-400" />
                  <p className="text-xs text-blue-100 font-medium">إجمالي المساحة: <span className="font-black">{(size.width * size.height).toFixed(2)} متر مربع</span></p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-white/10 bg-white/5 font-black h-12 rounded-xl">السابق</Button>
                <Button onClick={() => setStep(3)} className="flex-[2] bg-primary font-black h-12 rounded-xl">المتابعة للتصميم</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-6">
                <h3 className="text-xl font-black text-white text-right">خيارات التصميم</h3>
                <RadioGroup 
                  value={designOption} 
                  onValueChange={(val: any) => {
                    setDesignOption(val)
                    setDesignData('')
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all gap-3 ${
                    designOption === 'upload' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10'
                  }`}>
                    <RadioGroupItem value="upload" className="sr-only" />
                    <Upload className={`size-8 ${designOption === 'upload' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-black text-sm">لدي تصميم</span>
                  </Label>
                  <Label className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all gap-3 ${
                    designOption === 'request' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10'
                  }`}>
                    <RadioGroupItem value="request" className="sr-only" />
                    <Palette className={`size-8 ${designOption === 'request' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-black text-sm">طلب تصميم جديد</span>
                  </Label>
                </RadioGroup>

                {designOption === 'upload' ? (
                  <div className="space-y-4">
                    <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 text-center space-y-4">
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <LinkIcon className="size-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-bold">ارفع ملف التصميم أو ضع رابطاً</p>
                        <p className="text-xs text-muted-foreground">PDF, AI, PSD, JPG, PNG (Max 50MB)</p>
                      </div>
                      <Input 
                        placeholder="ضع رابط التحميل (Drive, WeTransfer) أو ارفع ملفاً"
                        value={designData}
                        onChange={(e) => setDesignData(e.target.value)}
                        className="bg-black/20 border-white/10"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label className="text-white font-bold block text-right">تفاصيل التصميم المطلوب</Label>
                    <Textarea 
                      placeholder="اشرح لنا فكرتك، الألوان المطلوبة، والنصوص التي تريد إضافتها..."
                      className="bg-white/5 border-white/10 min-h-[150px] rounded-xl text-right"
                      value={designData}
                      onChange={(e) => setDesignData(e.target.value)}
                    />
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                      <Sparkles className="size-5 text-primary" />
                      <p className="text-xs text-primary font-medium">سيقوم فريق المصممين لدينا بالتواصل معك لمراجعة الفكرة قبل التنفيذ</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-white/10 bg-white/5 font-black h-12 rounded-xl">السابق</Button>
                <Button onClick={() => setStep(4)} className="flex-[2] bg-primary font-black h-12 rounded-xl">مراجعة الطلب</Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white text-right">ملخص الطلب</h3>
                <Card className="p-6 bg-white/5 border-white/10 space-y-4 text-right">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-primary font-black">{product.name}</span>
                    <span className="text-muted-foreground text-xs">المنتج</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white font-bold">{material.name}</span>
                    <span className="text-muted-foreground text-xs">الخامة</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white font-bold">{size.width} × {size.height} متر</span>
                    <span className="text-muted-foreground text-xs">المقاس</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-white font-bold">{designOption === 'upload' ? 'تصميم مرفق' : 'طلب تصميم جديد'}</span>
                    <span className="text-muted-foreground text-xs">التصميم</span>
                  </div>
                  
                  <div className="pt-4 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl border border-white/10">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="text-white hover:bg-white/10"
                      >
                        -
                      </Button>
                      <span className="text-xl font-black text-white min-w-[40px] text-center">{quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setQuantity(q => q + 1)}
                        className="text-white hover:bg-white/10"
                      >
                        +
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs mb-1">إجمالي السعر التقديري</p>
                      <p className="text-4xl font-black text-primary">{(currentPrice * quantity).toLocaleString()} <span className="text-lg">ج.م</span></p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1 border-white/10 bg-white/5 font-black h-12 rounded-xl">السابق</Button>
                <Button 
                  onClick={handleAddToCart} 
                  disabled={isAdding}
                  className="flex-[2] bg-primary hover:bg-primary/90 text-black font-black h-12 rounded-xl shadow-xl shadow-primary/20"
                >
                  إضافة للعربة
                  <ShoppingCart className="mr-2 size-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
