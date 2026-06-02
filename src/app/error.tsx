'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="size-24 rounded-[2rem] bg-red-50 flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="size-12 text-red-500" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900">عذراً، حدث خطأ ما!</h1>
          <p className="text-slate-500 font-medium">نواجه مشكلة تقنية في تحميل هذه الصفحة حالياً. يرجى المحاولة مرة أخرى.</p>
        </div>
        <Button 
          onClick={() => reset()}
          className="bg-primary hover:bg-primary/90 text-white font-black px-10 h-16 rounded-2xl shadow-xl shadow-primary/20 transition-all"
        >
          <RotateCcw className="ml-2 size-5" />
          إعادة المحاولة
        </Button>
      </div>
    </div>
  )
}
