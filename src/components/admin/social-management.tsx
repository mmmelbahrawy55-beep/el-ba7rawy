'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { 
  Facebook, 
  History, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Filter,
  BarChart,
  Calendar,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'

export default function SocialManagement() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ success: 0, failed: 0, total: 0 })

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/social/logs')
      const data = await res.json()
      setLogs(data.logs || [])
      setSummary(data.summary || { success: 0, failed: 0, total: 0 })
    } catch (err) {
      console.error('Fetch Logs Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'link_success': return <CheckCircle className="size-4 text-emerald-500" />
      case 'link_failed': return <XCircle className="size-4 text-red-500" />
      case 'token_refresh': return <History className="size-4 text-blue-500" />
      default: return <Activity className="size-4 text-slate-500" />
    }
  }

  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Activity className="size-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي المحاولات</p>
              <h3 className="text-3xl font-black text-white">{summary.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle className="size-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">عمليات ناجحة</p>
              <h3 className="text-3xl font-black text-emerald-500">{summary.success}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="size-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <XCircle className="size-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">عمليات فاشلة</p>
              <h3 className="text-3xl font-black text-red-500">{summary.failed}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[3rem] border-white/10 shadow-2xl bg-white/5 backdrop-blur-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 px-10 py-8">
          <div>
            <CardTitle className="text-2xl font-black text-white">سجل أحداث الارتباط</CardTitle>
            <CardDescription className="font-bold text-slate-400 mt-1">مراقبة دقيقة لجميع محاولات ربط الحسابات وتحديث الصلاحيات</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-slate-400 font-black h-12 px-6 hover:text-white">
              <Filter className="size-4 ml-2" />
              تصفية
            </Button>
            <Button variant="outline" onClick={fetchLogs} className="rounded-2xl border-white/10 bg-white/5 text-slate-400 font-black h-12 px-6 hover:text-white">
              <History className="size-4 ml-2" />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y divide-white/5">
              {logs.map((log) => (
                <div key={log.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {getActionIcon(log.action)}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-lg flex items-center gap-3">
                        {log.platform === 'facebook' && <Facebook className="size-4 text-blue-600" />}
                        {log.action === 'link_success' ? 'تم الربط بنجاح' : log.action === 'link_failed' ? 'فشل عملية الربط' : log.action}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(log.createdAt).toLocaleString('ar-EG')}
                        </span>
                        <div className="size-1 bg-white/10 rounded-full" />
                        <span className="text-[10px] font-black text-primary">IP: {log.ipAddress || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {log.errorMessage && (
                      <Badge variant="outline" className="rounded-lg border-red-500/20 text-red-500 bg-red-500/5 font-bold text-[10px] max-w-[200px] truncate">
                        Error: {log.errorMessage}
                      </Badge>
                    )}
                    <Badge className={`rounded-xl px-4 py-1 font-black border-none text-[10px] uppercase tracking-widest ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {log.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="py-20 text-center text-slate-500 font-bold">لا توجد سجلات متاحة حالياً.</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
