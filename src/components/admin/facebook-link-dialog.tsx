'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { AlertCircle, Facebook, CheckCircle2, ShieldCheck, RefreshCw, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface FacebookLinkDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function FacebookLinkDialog({ isOpen, onClose, onSuccess }: FacebookLinkDialogProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'linking' | 'verifying' | 'error' | 'success'>('idle')
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [missingScopes, setMissingScopes] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      checkStatus()
    }
  }, [isOpen])

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/auth/facebook/status')
      const data = await res.json()
      if (data.linked) {
        setAccountInfo(data.account)
        if (data.account.missingScopes) {
          setMissingScopes(data.account.missingScopes.split(',').filter(Boolean))
        }
        setStatus('success')
      }
    } catch (err) {
      console.error('Status Check Error:', err)
    }
  }

  const handleLink = async () => {
    setLoading(true)
    setStatus('linking')
    try {
      const res = await fetch('/api/auth/facebook/url')
      const data = await res.json()
      if (data.url) {
        // Redirect to Facebook OAuth
        window.location.href = data.url
      } else {
        throw new Error('Could not get auth URL')
      }
    } catch (err) {
      toast.error('فشل بدء عملية الربط')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const requiredPermissions = [
    { key: 'pages_show_list', label: 'عرض قائمة الصفحات', desc: 'مطلوب لاختيار صفحة الوكالة' },
    { key: 'pages_manage_posts', label: 'إدارة المنشورات', desc: 'مطلوب للنشر التلقائي من الـ AI' },
    { key: 'pages_read_engagement', label: 'تحليل التفاعل', desc: 'مطلوب لقراءة التعليقات والرد عليها' },
    { key: 'instagram_basic', label: 'بيانات إنستجرام', desc: 'مطلوب للربط مع حساب الأعمال' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-[#0c0c0c] border-white/10 rounded-[2.5rem] font-arabic" dir="rtl">
        <div className="relative">
          {/* Header Gradient */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
          
          <div className="p-8 relative z-10">
            <DialogHeader className="text-right">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-16 rounded-[1.25rem] bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/40">
                  <Facebook className="size-8 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black text-white">ربط حساب فيسبوك</DialogTitle>
                  <DialogDescription className="text-slate-400 font-bold mt-1">إدارة منصاتك الاجتماعية بذكاء واحترافية</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 py-4"
                >
                  <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                    <h4 className="text-blue-400 font-black mb-2 flex items-center gap-2">
                      <ShieldCheck className="size-5" />
                      لماذا يجب عليك الربط؟
                    </h4>
                    <ul className="space-y-3">
                      {[
                        'تمكين المساعد الذكي من النشر التلقائي للمنشورات.',
                        'الرد الفوري على تعليقات العملاء عبر الـ AI.',
                        'مزامنة إحصائيات التفاعل والوصول مباشرة.',
                        'إدارة حملاتك الإعلانية من لوحة تحكم واحدة.'
                      ].map((item, i) => (
                        <li key={i} className="text-sm text-slate-300 font-bold flex items-start gap-3">
                          <CheckCircle2 className="size-4 text-emerald-500 mt-1 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">الصلاحيات المطلوبة</label>
                    <div className="grid grid-cols-1 gap-2">
                      {requiredPermissions.map((perm) => (
                        <div key={perm.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                          <div>
                            <p className="text-sm font-black text-white">{perm.label}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{perm.desc}</p>
                          </div>
                          <Badge variant="outline" className="text-[8px] border-white/10 text-slate-500 uppercase">Required</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {status === 'success' && accountInfo && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center space-y-6"
                >
                  <div className="relative mx-auto size-24">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                    <img 
                      src={accountInfo.profilePicture} 
                      className="size-24 rounded-full border-4 border-emerald-500 relative z-10"
                      alt={accountInfo.accountName}
                    />
                    <div className="absolute -bottom-1 -right-1 size-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[#0c0c0c] z-20">
                      <CheckCircle2 className="size-4 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-white">{accountInfo.accountName}</h3>
                    <p className="text-emerald-500 font-black text-sm mt-1">الحساب متصل بنجاح</p>
                  </div>

                  {missingScopes.length > 0 && (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-right">
                      <p className="text-orange-400 font-black text-xs flex items-center gap-2 mb-2">
                        <AlertCircle className="size-4" />
                        صلاحيات مفقودة
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {missingScopes.map(s => (
                          <Badge key={s} variant="secondary" className="bg-orange-500/20 text-orange-400 border-none text-[9px]">{s}</Badge>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-2">بعض الميزات قد لا تعمل بشكل صحيح. يرجى إعادة الربط ومنح كامل الصلاحيات.</p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-bold">
                    آخر تحقق: {new Date(accountInfo.lastVerified).toLocaleString('ar-EG')}
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center space-y-4"
                >
                  <XCircle className="size-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-black text-white">فشل الاتصال</h3>
                  <p className="text-slate-400 font-bold">حدث خطأ أثناء محاولة الربط. قد يكون بسبب مشكلة في الاتصال أو رفض الصلاحيات.</p>
                  <Button variant="outline" onClick={() => setStatus('idle')} className="rounded-xl border-white/10 hover:bg-white/5 font-black">إعادة المحاولة</Button>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter className="mt-8 sm:justify-start gap-4">
              {status === 'idle' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={onClose} 
                    className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-white font-black hover:bg-white/10"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleLink}
                    disabled={loading}
                    className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-600/20 gap-3"
                  >
                    {loading ? <Loader2 className="size-5 animate-spin" /> : <Facebook className="size-5" />}
                    متابعة الربط مع فيسبوك
                  </Button>
                </>
              )}
              {status === 'success' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleLink}
                    className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-white font-black hover:bg-white/10 gap-2"
                  >
                    <RefreshCw className="size-4" />
                    تحديث الربط
                  </Button>
                  <Button 
                    onClick={onClose}
                    className="flex-1 h-14 rounded-2xl bg-white/10 text-white font-black hover:bg-white/20"
                  >
                    إغلاق
                  </Button>
                </>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
