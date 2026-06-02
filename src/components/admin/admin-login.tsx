'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'

interface AdminLoginProps {
  onLogin: (user: { id: string; email: string; name: string; avatar?: string }) => void
  onBack: () => void
}

export default function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginType, setLoginType] = useState<'admin' | 'client'>('admin')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('يرجى ملء جميع الحقول')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'فشل تسجيل الدخول')
        return
      }

      toast.success(`مرحباً ${data.name}!`)
      onLogin({
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
      })
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' }),
      })

      const data = await res.json()
      if (res.ok) {
        onLogin({
          id: data.id,
          email: data.email,
          name: data.name,
          avatar: data.avatar,
        })
      } else {
        toast.error(data.error || 'غير متاح حالياً')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all mb-12 mr-auto font-black group"
        >
          <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          <span className="text-sm uppercase tracking-widest">العودة للموقع</span>
        </motion.button>

        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-12"
        >
          <div className="bg-transparent size-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-border group hover:border-primary/50 transition-all duration-500">
            <img
              src="/images/logo.png"
              alt="البحراوي"
              className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.1)] group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <h1 className="text-4xl font-black text-foreground mb-3 tracking-tighter">بوابة الوصول</h1>
          <p className="text-primary font-black text-[11px] uppercase tracking-[0.4em] opacity-80">Access Gateway</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-card border border-border shadow-2xl rounded-[3.5rem] overflow-hidden">
            <CardHeader className="pb-6 pt-10 px-10 text-center">
              <h2 className="text-2xl font-black text-foreground">
                تسجيل الدخول
              </h2>
              <p className="text-muted-foreground text-sm font-bold mt-2 tracking-tight">
                أدخل بيانات حسابك للمتابعة
              </p>
            </CardHeader>
            <CardContent className="px-12 pb-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mr-2">
                    البريد الإلكتروني أو الهاتف
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="admin@elbahrawy.com أو 01xxxxxxxxx"
                      className="pr-14 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/10 rounded-2xl h-16 font-black text-lg"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mr-2">
                    كلمة المرور
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-14 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/10 rounded-2xl h-16 font-black text-lg"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-8 text-xl rounded-[2rem] shadow-xl shadow-primary/20 transition-all active:scale-95 group"
                >
                  {isLoading ? (
                    <Loader2 className="size-8 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      دخول للنظام
                      <ArrowRight className="size-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>

                {/* Register Link */}
                <div className="text-center mt-6">
                  <p className="text-muted-foreground text-sm font-bold">
                    ليس لديك حساب؟{' '}
                    <button 
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => toast.info('يرجى التواصل مع الإدارة لإنشاء حساب جديد')}
                    >
                      أنشئ حساباً الآن
                    </button>
                  </p>
                </div>
              </form>

              {/* Divider */}
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-6 bg-card text-muted-foreground font-black uppercase tracking-[0.3em]">SECURE AUTH</span>
                </div>
              </div>

              {/* Google Login */}
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground py-8 rounded-[2rem] font-black transition-all flex gap-4"
              >
                <svg className="size-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                الدخول عبر Google
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4 mt-12"
          >
            <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.4em]">
              © {new Date().getFullYear()} El Bahrawy Advertising • All Rights Reserved
            </p>
            <div className="flex gap-2 items-center text-[9px] font-black text-primary/40 uppercase tracking-widest">
              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              End-to-End Encryption Enabled
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
