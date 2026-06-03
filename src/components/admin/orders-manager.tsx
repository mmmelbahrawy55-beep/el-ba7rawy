'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  MessageSquare,
  Package,
  Loader2,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Card, CardContent } from '../ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { toast } from 'sonner'

interface Order {
  id: string
  customerName: string
  phone: string
  productName: string
  categoryName: string
  quantity: string | null
  size: string | null
  details: string | null
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  estimatedPrice: number | null
  clientId: string | null
}

const statusConfig = {
  pending: { label: 'معلق', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
  'in-progress': { label: 'قيد التنفيذ', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: AlertCircle },
  completed: { label: 'مكتمل', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [clients, setClients] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [ordersRes, clientsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/platform/clients'),
      ])
      
      if (ordersRes.ok) setOrders(await ordersRes.json())
      if (clientsRes.ok) setClients(await clientsRes.json())
    } catch (error) {
      toast.error('فشل تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await fetchData()
    }
    init()
  }, [fetchData])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o))
        toast.success('تم تحديث حالة الطلب')
      }
    } catch {
      toast.error('فشل تحديث الحالة')
    }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id))
        toast.success('تم حذف الطلب')
      }
    } catch {
      toast.error('فشل الحذف')
    }
  }

  const handleAssignToClient = async (order: Order, clientId: string) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })

      if (res.ok) {
        toast.success('تم ربط الطلب بالعميل')
        fetchData()
      }
    } catch {
      toast.error('فشل ربط العميل')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.includes(search) || 
                         order.productName.includes(search) || 
                         order.phone.includes(search)
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="بحث باسم العميل، المنتج أو رقم الهاتف..."
              className="pr-10 bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 rounded-xl h-10 font-bold text-[11px] text-white"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10 rounded-xl h-10 font-bold text-[11px] text-white">
              <SelectValue placeholder="كل الحالات" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/10 bg-[#0c0c0c] text-white font-arabic">
              <SelectItem value="all">كل الطلبات</SelectItem>
              <SelectItem value="pending">معلقة</SelectItem>
              <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتملة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
          <span className="text-primary font-black text-base">{filteredOrders.length}</span>
          <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest">طلبات</span>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="bg-[#0c0c0c]/50 backdrop-blur-md border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-right p-4 text-muted-foreground font-black uppercase tracking-[0.1em] text-[9px]">العميل</th>
                  <th className="text-right p-4 text-muted-foreground font-black uppercase tracking-[0.1em] text-[9px]">تفاصيل المنتج</th>
                  <th className="text-right p-4 text-muted-foreground font-black uppercase tracking-[0.1em] text-[9px]">السعر</th>
                  <th className="text-right p-4 text-muted-foreground font-black uppercase tracking-[0.1em] text-[9px]">الحالة</th>
                  <th className="text-right p-4 text-muted-foreground font-black uppercase tracking-[0.1em] text-[9px]">التاريخ</th>
                  <th className="text-center p-4 text-muted-foreground font-black uppercase tracking-[0.1em] text-[9px]">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center">
                      <div className="bg-white/5 size-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/10">
                        <ShoppingCart className="size-8 text-white/10" />
                      </div>
                      <p className="text-muted-foreground font-bold text-xs">لا توجد طلبات مطابقة للبحث</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending
                    const whatsappLink = `https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `مرحباً ${order.customerName}، بخصوص طلبك (${order.productName}) من ELBA7RAWY...`
                    )}`

                    return (
                      <tr
                        key={order.id}
                        className="group hover:bg-white/5 transition-all duration-300"
                      >
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <p className="text-white font-black text-sm group-hover:text-primary transition-colors">{order.customerName}</p>
                              {order.clientId && (
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[7px] font-black h-3.5 px-1">مسجل</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[10px]" dir="ltr">
                              <span>{order.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <p className="text-white font-black text-xs">{order.productName}</p>
                            <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">{order.categoryName}</p>
                            {(order.quantity || order.size) && (
                              <div className="flex gap-1.5 mt-0.5">
                                {order.quantity && <Badge variant="outline" className="text-[8px] border-white/10 text-muted-foreground px-1 py-0 h-3.5">كمية: {order.quantity}</Badge>}
                                {order.size && <Badge variant="outline" className="text-[8px] border-white/10 text-muted-foreground px-1 py-0 h-3.5">مقاس: {order.size}</Badge>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-emerald-500 font-black text-base">
                            {order.estimatedPrice?.toLocaleString('ar-EG') || '---'} 
                            <span className="text-[9px] mr-0.5">ج.م</span>
                          </p>
                        </td>
                        <td className="p-4">
                          <Select value={order.status} onValueChange={(val: any) => handleStatusChange(order.id, val)}>
                            <SelectTrigger className={`w-28 h-8 rounded-lg font-black text-[9px] border-none ${status.color}`}>
                              <status.icon className="size-3 ml-1.5" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic">
                              <SelectItem value="pending" className="text-amber-500 font-bold">معلق</SelectItem>
                              <SelectItem value="in-progress" className="text-blue-500 font-bold">قيد التنفيذ</SelectItem>
                              <SelectItem value="completed" className="text-emerald-500 font-bold">مكتمل</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col text-muted-foreground font-bold text-[10px]">
                            <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-lg bg-white/5 border-white/10 text-white hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <MoreVertical className="size-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              asChild
                              className="size-8 rounded-lg bg-white/5 border-white/10 text-white hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                            >
                              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="size-3.5" />
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-lg bg-white/5 border-white/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                              onClick={() => deleteOrder(order.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open: boolean) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-xl bg-[#0c0c0c] border-white/10 text-white rounded-3xl p-0 overflow-hidden shadow-2xl font-arabic" dir="rtl">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <DialogHeader className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-1.5">
              <Badge className={selectedOrder ? `text-[8px] h-4 ${statusConfig[selectedOrder.status].color}` : ''}>
                {selectedOrder ? statusConfig[selectedOrder.status].label : ''}
              </Badge>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">طلب #{selectedOrder?.id.slice(-5)}</span>
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">{selectedOrder?.customerName}</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold text-sm">{selectedOrder?.phone}</DialogDescription>
          </DialogHeader>

          <div className="p-6 pt-0 space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">المنتج المطلوب</p>
                <p className="text-base font-black text-white">{selectedOrder?.productName}</p>
                <p className="text-[10px] font-bold text-primary">{selectedOrder?.categoryName}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">السعر المتوقع</p>
                <p className="text-xl font-black text-emerald-500">{selectedOrder?.estimatedPrice?.toLocaleString()} <span className="text-[10px]">ج.م</span></p>
              </div>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Package className="size-3.5" />
                <h4 className="font-black text-[10px] uppercase tracking-widest">مواصفات التنفيذ</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">الكمية</p>
                  <p className="text-xs font-bold text-white">{selectedOrder?.quantity || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">المقاسات</p>
                  <p className="text-xs font-bold text-white">{selectedOrder?.size || 'غير محدد'}</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">تفاصيل إضافية</p>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">{selectedOrder?.details || 'لا توجد تفاصيل إضافية مسجلة'}</p>
              </div>
            </div>

            {!selectedOrder?.clientId && (
              <div className="bg-primary/5 p-5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <UserPlus className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">ربط الطلب بعميل</p>
                      <p className="text-[9px] font-bold text-slate-400">لتحويل الطلب إلى فاتورة رسمية</p>
                    </div>
                  </div>
                  <Select onValueChange={(id: string) => handleAssignToClient(selectedOrder!, id)}>
                    <SelectTrigger className="w-40 bg-[#050505] border-white/10 rounded-lg font-bold h-9 text-[10px]">
                      <SelectValue placeholder="اختر عميل..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic">
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id} className="text-[11px]">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-white/5 border-t border-white/10 flex gap-2">
            <Button
              className="flex-1 bg-primary text-primary-foreground font-black rounded-xl h-10 text-xs"
              onClick={() => setSelectedOrder(null)}
            >
              إغلاق التفاصيل
            </Button>
            <Button
              variant="outline"
              className="px-4 border-white/10 bg-white/5 text-white font-black rounded-xl h-10 hover:bg-white/10 text-xs"
              onClick={() => window.open(`https://wa.me/${selectedOrder?.phone.replace(/[^0-9]/g, '')}`, '_blank')}
            >
              <MessageSquare className="size-3.5 ml-1.5" />
              تواصل واتساب
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
