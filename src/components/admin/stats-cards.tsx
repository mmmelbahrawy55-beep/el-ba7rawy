'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingCart, DollarSign, BarChart3, TrendingUp, CheckCircle2, PieChart as PieChartIcon, Lightbulb, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from 'recharts'

const COLORS = ['#E31E24', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

interface StatsData {
  totalProducts: number
  totalCategories: number
  totalOrders: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
  revenue: number
  totalDebts: number
  categoryStats: Array<{
    categoryName: string
    count: number
    revenue: number
  }>
  chartData?: Array<{
    date: string
    amount: number
  }>
  recentOrders?: Array<{
      id: string
      customerName: string
      status: string
      createdAt: string
    }>
    marketingStats?: {
      publishedPosts: number
      aiEnabled: boolean
      lastRun?: string
    }
  }

export default function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) setStats(await res.json())
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Skeleton className="md:col-span-2 md:row-span-2 h-[450px] rounded-[2.5rem] bg-white/5 border border-white/10" />
        <Skeleton className="md:col-span-2 h-[210px] rounded-[2.5rem] bg-white/5 border border-white/10" />
        <Skeleton className="md:col-span-2 h-[210px] rounded-[2.5rem] bg-white/5 border border-white/10" />
        <Skeleton className="md:col-span-1 h-[200px] rounded-[2.5rem] bg-white/5 border border-white/10" />
        <Skeleton className="md:col-span-1 h-[200px] rounded-[2.5rem] bg-white/5 border border-white/10" />
        <Skeleton className="md:col-span-1 h-[200px] rounded-[2.5rem] bg-white/5 border border-white/10" />
        <Skeleton className="md:col-span-1 h-[200px] rounded-[2.5rem] bg-white/5 border border-white/10" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Revenue Card - Large */}
        <Card className="md:col-span-2 md:row-span-2 border border-white/5 bg-card text-foreground shadow-2xl rounded-[2.5rem] overflow-hidden group relative flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
          <CardContent className="p-10 flex flex-col justify-between flex-1 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="p-5 rounded-3xl bg-white/5 text-primary group-hover:scale-110 transition-transform duration-500 shadow-lg border border-white/5">
                <DollarSign className="size-10" />
              </div>
              <Badge className="bg-primary/20 text-primary border-none font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">إجمالي الإيرادات</Badge>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-5xl sm:text-7xl font-black mb-2 tracking-tighter text-white drop-shadow-2xl">
                {(stats.revenue || 0).toLocaleString('ar-EG')}
              </h3>
              <p className="text-primary font-bold text-xl uppercase tracking-[0.2em]">جنيه مصري</p>
              <div className="flex items-center gap-2 mt-8 text-muted-foreground text-sm font-bold bg-white/5 w-fit px-5 py-2.5 rounded-2xl border border-white/5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                تم تحصيلها من {stats.completedOrders || 0} طلب مكتمل
              </div>
            </div>
            <div className="mt-10 h-32 w-full opacity-30 group-hover:opacity-60 transition-opacity">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData && stats.chartData.length > 0 ? stats.chartData : stats.categoryStats || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey={stats.chartData && stats.chartData.length > 0 ? "amount" : "revenue"} stroke="#fbbf24" fill="url(#colorRevenue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Stats Card */}
        <Card className="md:col-span-2 border border-white/5 bg-card text-foreground shadow-2xl rounded-[2.5rem] overflow-hidden group min-h-[220px]">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 rounded-2xl bg-white/5 text-primary shadow-lg border border-white/5">
                <BarChart3 className="size-8" />
              </div>
              <Badge className={`border-none font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider ${stats.marketingStats?.aiEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground"}`}>
                {stats.marketingStats?.aiEnabled ? "فريق AI نشط" : "فريق AI متوقف"}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.2em] mb-1">المنشورات التسويقية</p>
              <div className="flex items-baseline gap-3">
                <h4 className="text-5xl font-black text-white">{stats.marketingStats?.publishedPosts || 0}</h4>
                <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">منشور ذكي</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debt Card - Medium */}
        <Card className="md:col-span-2 border border-white/5 bg-card shadow-2xl rounded-[2.5rem] overflow-hidden group min-h-[220px]">
          <CardContent className="p-8 flex items-center gap-8 h-full">
            <div className="p-6 rounded-[2rem] bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform duration-500 shadow-lg border border-red-500/10">
              <TrendingUp className="size-10" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">إجمالي المديونيات</p>
              <h3 className="text-4xl font-black text-white tracking-tight">{(stats.totalDebts || 0).toLocaleString('ar-EG')} ج.م</h3>
              <div className="w-full bg-white/5 h-2.5 rounded-full mt-6 overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.totalDebts / (stats.revenue + stats.totalDebts || 1)) * 100)}%` }}
                  className="bg-red-500 h-full rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card - Small */}
        <Card className="md:col-span-1 border border-white/5 bg-card shadow-2xl rounded-[2.5rem] overflow-hidden group hover:bg-primary transition-all duration-500">
          <CardContent className="p-8 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="p-4 rounded-2xl bg-white/5 text-purple-400 w-fit group-hover:bg-black/20 group-hover:text-white transition-colors border border-white/5">
              <ShoppingCart className="size-8" />
            </div>
            <div className="mt-8 relative z-10">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-black/60 transition-colors">إجمالي الطلبات</p>
              <h3 className="text-4xl font-black text-white group-hover:text-black transition-colors">{stats.totalOrders}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Products Card - Small */}
        <Card className="md:col-span-1 border border-white/5 bg-card shadow-2xl rounded-[2.5rem] overflow-hidden group hover:bg-blue-600 transition-all duration-500">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="p-4 rounded-2xl bg-white/5 text-blue-400 w-fit group-hover:bg-black/20 group-hover:text-white transition-colors border border-white/5">
              <Package className="size-8" />
            </div>
            <div className="mt-8">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-black/60 transition-colors">المنتجات</p>
              <h3 className="text-4xl font-black text-white group-hover:text-black transition-colors">{stats.totalProducts}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Categories Card - Small */}
        <Card className="md:col-span-1 border border-white/5 bg-card shadow-2xl rounded-[2.5rem] overflow-hidden group hover:bg-emerald-600 transition-all duration-500">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="p-4 rounded-2xl bg-white/5 text-emerald-400 w-fit group-hover:bg-black/20 group-hover:text-white transition-colors border border-white/5">
              <BarChart3 className="size-8" />
            </div>
            <div className="mt-8">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-black/60 transition-colors">التصنيفات</p>
              <h3 className="text-4xl font-black text-white group-hover:text-black transition-colors">{stats.totalCategories}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Activity Card - Small */}
        <Card className="md:col-span-1 border border-white/5 bg-card shadow-2xl rounded-[2.5rem] overflow-hidden group hover:bg-amber-500 transition-all duration-500">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <div className="p-4 rounded-2xl bg-white/5 text-amber-500 w-fit group-hover:bg-black/20 group-hover:text-white transition-colors border border-white/5">
              <Clock className="size-8" />
            </div>
            <div className="mt-8">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-black/60 transition-colors">الطلبات المعلقة</p>
              <h3 className="text-4xl font-black text-white group-hover:text-black transition-colors">{stats.pendingOrders}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart - Large */}
        <Card className="lg:col-span-2 border border-white/5 bg-card shadow-2xl rounded-[3rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          <CardContent className="p-10 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <h4 className="text-2xl font-black text-white tracking-tight">تحليل المبيعات الذكي</h4>
                <p className="text-sm font-bold text-muted-foreground mt-1">توزيع الإيرادات حسب فئة المنتج والخدمة</p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/5">
                <Button variant="ghost" size="sm" className="rounded-xl font-black text-xs bg-primary text-primary-foreground shadow-lg">إيرادات</Button>
                <Button variant="ghost" size="sm" className="rounded-xl font-black text-xs text-muted-foreground hover:text-white">طلبات</Button>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryStats || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="categoryName" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05', radius: 10 }}
                    contentStyle={{ 
                      borderRadius: '24px', 
                      backgroundColor: '#121212',
                      border: '1px solid rgba(255,255,255,0.05)',
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                      color: '#fff',
                      fontFamily: 'inherit',
                      fontWeight: 800
                    }}
                  />
                  <Bar dataKey="revenue" fill="#fbbf24" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Client Stats - Medium */}
        <Card className="lg:col-span-1 border border-white/5 bg-white/5 backdrop-blur-md text-white shadow-2xl rounded-[3rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <CardContent className="p-10 relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <h4 className="text-2xl font-black tracking-tight">توزيع العملاء</h4>
              <div className="p-4 rounded-2xl bg-white/5 text-primary border border-white/5">
                <PieChartIcon className="size-6" />
              </div>
            </div>

            <div className="h-[280px] w-full mb-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryStats || []}
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={10}
                    dataKey="count"
                    nameKey="categoryName"
                    stroke="none"
                  >
                    {(stats.categoryStats || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '20px', 
                      background: '#121212', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      color: '#fff',
                      padding: '15px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text for Donut */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-8">
                 <p className="text-3xl font-black text-white">{stats.totalOrders || 0}</p>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">إجمالي الطلبات</p>
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              {(stats.categoryStats || []).slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{item.categoryName}</span>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-none font-black">{item.count} طلب</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Section: Recent Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <Card className="border border-white/10 bg-[#0c0c0c]/50 backdrop-blur-md shadow-2xl rounded-[3rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <CardContent className="p-10 relative z-10">
             <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                 <div className="p-4 rounded-[1.5rem] bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 shadow-inner">
                   <CheckCircle2 className="size-7" />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-white tracking-tight">آخر الطلبات</h4>
                    <p className="text-sm font-bold text-muted-foreground mt-1">متابعة حالة العمليات الجارية</p>
                 </div>
               </div>
               <Button variant="outline" className="rounded-xl font-black text-xs border-white/10 bg-white/5 text-muted-foreground hover:text-white">عرض الكل</Button>
             </div>
             <div className="space-y-4">
                {stats.recentOrders && stats.recentOrders.length > 0 ? stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-5 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group">
                    <div className="flex items-center gap-5">
                      <div className={`size-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${
                        order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                        order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        <ShoppingCart className="size-7" />
                      </div>
                      <div>
                        <p className="font-black text-white text-lg group-hover:text-primary transition-colors">{order.customerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <Clock className="size-3 text-muted-foreground" />
                           <p className="text-xs font-bold text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className={`border-none px-6 py-2 rounded-xl text-xs font-black shadow-lg ${
                      order.status === 'completed' ? 'bg-emerald-500 text-white shadow-emerald-500/10' : 
                      order.status === 'pending' ? 'bg-amber-500 text-white shadow-amber-500/10' : 'bg-blue-500 text-white shadow-blue-500/10'
                    }`}>
                      {order.status === 'completed' ? 'مكتمل' : order.status === 'pending' ? 'معلق' : 'قيد التنفيذ'}
                    </Badge>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-white/[0.02] rounded-[2rem] border-2 border-dashed border-white/5">
                    <Clock className="size-16 mx-auto mb-4 text-white/10" />
                    <p className="font-black text-muted-foreground text-xl">لا توجد طلبات حديثة</p>
                  </div>
                )}
             </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-primary text-primary-foreground shadow-2xl rounded-[3rem] overflow-hidden relative group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -bottom-20 -left-20 size-80 bg-black/10 rounded-full blur-3xl group-hover:bg-black/20 transition-all duration-700" />
          
          <CardContent className="p-12 relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-5 mb-10">
               <div className="p-5 rounded-[2rem] bg-primary-foreground text-primary shadow-2xl group-hover:scale-110 transition-transform duration-500">
                 <Lightbulb className="size-8" />
               </div>
               <div>
                  <h4 className="text-3xl font-black tracking-tight">نصيحة النظام الذكي</h4>
                  <Badge className="bg-primary-foreground/10 text-primary-foreground border-none font-black px-3 py-1 rounded-full text-[10px] mt-2 uppercase tracking-widest">AI Insights</Badge>
               </div>
            </div>
            
            <p className="text-xl font-bold leading-relaxed mb-8 flex-1">
              "بناءً على تحليلات الشهر الماضي، نلاحظ زيادة في الطلب على <span className="underline decoration-wavy decoration-primary-foreground/30">طباعة اليونيفورم</span> بنسبة ٢٥٪. ننصح ببدء حملة إعلانية مخصصة لهذا القسم لزيادة المبيعات."
            </p>

            <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-black h-14 rounded-2xl shadow-2xl transition-all group/btn">
              تطبيق التوصية الآن
              <ShoppingCart className="mr-2 size-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
