'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  User, 
  Activity, 
  History,
  ShieldCheck,
  Search,
  Database,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Log {
  id: string
  action: string
  details: string | null
  userEmail: string | null
  ipAddress: string | null
  createdAt: string
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/activity')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLogs(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    (log.details?.toLowerCase().includes(search.toLowerCase())) ||
    (log.userEmail?.toLowerCase().includes(search.toLowerCase()))
  )

  const getActionColor = (action: string) => {
    const a = action.toLowerCase()
    if (a.includes('حذف') || a.includes('delete')) return 'text-red-500 bg-red-500/10 border-red-500/20'
    if (a.includes('تعديل') || a.includes('update')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    if (a.includes('إضافة') || a.includes('create')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-[2rem] bg-white/5 text-primary flex items-center justify-center border border-white/10">
            <History className="size-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">سجل النشاطات</h2>
            <p className="text-muted-foreground font-bold mt-1">مراقبة كافة العمليات والتغييرات التي تتم في النظام</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="ابحث في السجلات..."
            className="pr-12 bg-white/5 border-white/10 text-white rounded-2xl h-14 font-bold shadow-2xl focus:ring-primary/20 placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="text-right p-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">العملية</th>
                <th className="text-right p-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">المسؤول</th>
                <th className="text-right p-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">التفاصيل</th>
                <th className="text-right p-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">التوقيت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-all duration-300 group">
                  <td className="p-6">
                    <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getActionColor(log.action)}`}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                        <User className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white group-hover:text-primary transition-colors">{log.userEmail || 'System'}</p>
                        <p className="text-[10px] font-bold text-muted-foreground" dir="ltr">{log.ipAddress || 'Internal'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-muted-foreground max-w-md line-clamp-1">{log.details || '-'}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="size-4" />
                      <span className="text-xs font-bold">
                        {format(new Date(log.createdAt), 'dd MMMM yyyy - hh:mm a', { locale: ar })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-32 text-center">
                    <div className="bg-white/5 size-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
                      <History className="size-12 text-white/10" />
                    </div>
                    <p className="text-2xl font-black text-muted-foreground">لا توجد سجلات حالياً</p>
                    <p className="text-sm font-bold text-muted-foreground/60 mt-2">سيتم تسجيل النشاطات هنا فور حدوثها</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
