'use client'

import { useCartStore } from '@/lib/cart-store'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import FloatingActions from '@/components/floating-actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  Package, 
  Ruler, 
  Layers, 
  FileText,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  const whatsappNumber = "201120053007"
  
  const generateOrderMessage = () => {
    let message = `مرحباً محمد البحراوي، أريد تأكيد الطلب التالي من الموقع:\n\n`
    items.forEach((item, index) => {
      message += `*المنتج ${index + 1}: ${item.productName}*\n`
      message += `- الخامة: ${item.material}\n`
      message += `- المقاس: ${item.size.width} × ${item.size.height} متر\n`
      message += `- التصميم: ${item.designOption === 'upload' ? 'مرفق ملف/رابط' : 'طلب تصميم جديد'}\n`
      if (item.designData) message += `- بيانات التصميم: ${item.designData}\n`
      message += `- الكمية: ${item.quantity}\n`
      message += `- السعر: ${(item.price * item.quantity).toLocaleString()} ج.م\n\n`
    })
    message += `*الإجمالي: ${getTotal().toLocaleString()} ج.م*`
    return encodeURIComponent(message)
  }

  const handleCheckout = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${generateOrderMessage()}`
    window.open(url, '_blank')
    toast.success('جاري تحويلك للواتساب لإتمام الطلب...')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050505]">
        <SiteHeader />
        <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-24 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            <ShoppingCart className="size-20 text-slate-700 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-white mb-4 tracking-tighter">عربة التسوق فارغة</h1>
            <p className="text-slate-400 mb-8 max-w-sm font-bold">لم تقم بإضافة أي منتجات حتى الآن. استكشف خدماتنا وابدأ رحلة تميزك.</p>
            <Button asChild className="bg-primary text-black font-black h-14 px-10 rounded-2xl">
              <Link href="/services">تسوق الآن</Link>
            </Button>
          </motion.div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <SiteHeader />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">عربة التسوق</h1>
              <p className="text-muted-foreground font-bold mt-2">لديك {items.length} منتجات في العربة</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={clearCart}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-black gap-2"
            >
              <Trash2 className="size-4" />
              تفريغ العربة
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <Card className="p-4 sm:p-6 bg-white/5 border-white/10 backdrop-blur-xl rounded-[2rem] hover:border-primary/20 transition-all group overflow-hidden relative">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="relative size-24 sm:size-32 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 space-y-4 text-right">
                          <div className="flex justify-between items-start">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeItem(item.id)}
                              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="size-5" />
                            </Button>
                            <h3 className="text-xl sm:text-2xl font-black text-white">{item.productName}</h3>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold justify-end">
                              <span>{item.material}</span>
                              <Layers className="size-3 text-primary" />
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold justify-end">
                              <span>{item.size.width} × {item.size.height} م</span>
                              <Ruler className="size-3 text-primary" />
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold justify-end">
                              <span>{item.designOption === 'upload' ? 'تصميم مرفق' : 'طلب تصميم'}</span>
                              <FileText className="size-3 text-primary" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-4 bg-black/40 p-1.5 rounded-xl border border-white/10">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="size-8 text-white hover:bg-white/10"
                              >
                                -
                              </Button>
                              <span className="text-lg font-black text-white min-w-[30px] text-center">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="size-8 text-white hover:bg-white/10"
                              >
                                +
                              </Button>
                            </div>
                            <p className="text-2xl font-black text-primary">{(item.price * item.quantity).toLocaleString()} <span className="text-sm">ج.م</span></p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] sticky top-32">
                <h3 className="text-2xl font-black text-white mb-6 text-right">ملخص الطلب</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-slate-400 font-bold">
                    <span className="text-white">{getTotal().toLocaleString()} ج.م</span>
                    <span>إجمالي المنتجات</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 font-bold">
                    <span className="text-emerald-400">مجاني</span>
                    <span>التوصيل (تقديري)</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-3xl font-black text-primary">{getTotal().toLocaleString()} ج.م</span>
                    <span className="text-white font-black text-lg">الإجمالي</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-black h-16 rounded-2xl text-xl shadow-xl shadow-primary/20 gap-3"
                >
                  إرسال الطلب عبر واتساب
                  <MessageCircle className="size-6" />
                </Button>
                
                <p className="text-center text-[10px] text-slate-500 font-bold mt-6 leading-relaxed">
                  بمجرد الضغط على إرسال الطلب، سيتم تحويلك لمحادثة واتساب لمراجعة التصميم وتأكيد موعد التسليم مع الفريق الفني.
                </p>
              </Card>
              
              <Button asChild variant="ghost" className="w-full mt-6 text-slate-400 hover:text-white font-bold gap-2">
                <Link href="/services">
                  <ArrowRight className="size-4 rotate-180" />
                  متابعة التسوق
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <FloatingActions />
    </div>
  )
}
