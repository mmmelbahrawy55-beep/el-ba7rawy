import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[1000]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-20">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="size-20 text-primary animate-spin" />
        </div>
        <p className="text-slate-500 font-black tracking-widest uppercase text-xs animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  )
}
