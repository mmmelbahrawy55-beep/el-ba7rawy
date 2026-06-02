import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowRight, Ghost } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="relative">
          <div className="text-[12rem] font-black text-slate-50 leading-none select-none">404</div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Ghost className="size-20 text-primary animate-bounce mb-4" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">الصفحة غير موجودة</h1>
          </div>
        </div>
        
        <p className="text-slate-500 font-medium text-lg leading-relaxed">
          عذراً، يبدو أنك سلكت طريقاً خاطئاً. الصفحة التي تبحث عنها قد تم نقلها أو حذفها.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black h-16 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all">
            <Link href="/">
              <Home className="ml-2 size-5" />
              العودة للرئيسية
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-slate-200 hover:bg-slate-50 font-black h-16 px-8 rounded-2xl transition-all">
            <Link href="/contact">
              تواصل معنا
              <ArrowRight className="mr-2 size-4 rotate-180" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
