import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050505] z-[1000]">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse scale-150" />
          <div className="relative z-10 size-40 flex items-center justify-center">
            <img 
              src="/uploads/branding/1780350697096-766422623.jpeg" 
              alt="Logo" 
              className="size-32 object-contain animate-pulse rounded-lg"
            />
            <div className="absolute -inset-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-white font-black text-2xl tracking-tighter">
            ELBA<span className="text-primary">7RAWY</span>
          </h3>
          <p className="text-primary/60 font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">جاري التحميل...</p>
        </div>
      </div>
    </div>
  )
}
