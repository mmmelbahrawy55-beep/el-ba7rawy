'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingCart,
  MessageCircle,
  Phone,
  User,
  Package,
  FileText,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import Image from 'next/image'

interface Client {
  id: string
  name: string
  phone: string
}

interface Order {
  id: string
  clientId: string | null
  customerName: string
  phone: string
  productName: string
  categoryName: string
  quantity: string | null
  size: string | null
  details: string | null
  estimatedPrice: number | null
  deliveryDays: number
  status: string
  createdAt: string
  product: {
    id: string
    name: string
    imageUrl: string
    category: {
      id: string
      name: string
    }
  } | null
}

const statusConfig: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  pending: { label: 'معلق', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', Icon: Clock },
  'in-progress': { label: 'قيد التنفيذ', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', Icon: Eye },
  completed: { label: 'مكتمل', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', Icon: CheckCircle2 },
  cancelled: { label: 'ملغي', color: 'bg-red-500/10 text-red-500 border-red-500/20', Icon: XCircle },
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) setOrders(await res.json())
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/platform/clients')
      if (res.ok) setClients(await res.json())
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchOrders(), fetchClients()])
    }
    init()
  }, [fetchOrders, fetchClients])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
        toast.success('تم تحديث حالة الطلب')
      }
    } catch {
      toast.error('فشل تحديث الحالة')
    }
  }

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !search ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search)
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/5 shadow-lg">
        <div className="flex flex-1 gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="bg-black/40 border-white/10 pr-9 h-9 text-xs font-bold rounded-lg"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 h-9 bg-black/40 border-white/10 text-xs font-bold rounded-lg">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic">
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
          <ShoppingCart className="size-3 text-primary" />
          <span className="text-[10px] font-black text-white">{orders.length} طلب</span>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const config = statusConfig[order.status] || statusConfig.pending
          return (
            <Card key={order.id} className="bg-white/5 border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-all flex flex-col">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${config.color} border text-[8px] font-black rounded-md px-2 py-0.5`}>
                    {config.label}
                  </Badge>
                  <span className="text-[8px] font-bold text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="size-3 text-primary" />
                    <h4 className="text-sm font-black text-white truncate">{order.customerName}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Package className="size-3 text-muted-foreground" />
                    <span>{order.productName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400" dir="ltr">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{order.phone}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">المبلغ المتوقع</span>
                    <span className="text-sm font-black text-emerald-500">{order.estimatedPrice?.toLocaleString() || 0} ج.م</span>
                  </div>
                  <div className="flex gap-2">
                    <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                      <SelectTrigger className="w-24 h-8 bg-white/5 border-white/10 text-[9px] font-black rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic">
                        <SelectItem value="pending">معلق</SelectItem>
                        <SelectItem value="in-progress">جاري</SelectItem>
                        <SelectItem value="completed">تم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
          <span className="text-primary font-black text-lg">{filteredOrders.length}</span>
          <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">طلبات</span>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="bg-[#0c0c0c]/50 backdrop-blur-md border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-right p-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">العميل</th>
                  <th className="text-right p-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">تفاصيل المنتج</th>
                  <th className="text-right p-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">السعر التقديري</th>
                  <th className="text-right p-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">الحالة</th>
                  <th className="text-right p-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">تاريخ الطلب</th>
                  <th className="text-center p-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-24 text-center">
                      <div className="bg-white/5 size-20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <ShoppingCart className="size-10 text-white/10" />
                      </div>
                      <p className="text-muted-foreground font-bold">لا توجد طلبات مطابقة للبحث</p>
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
                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-black text-base group-hover:text-primary transition-colors">{order.customerName}</p>
                              {order.clientId && (
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-black h-4 px-1">عميل مسجل</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[11px]" dir="ltr">
                              <span>{order.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col">
                            <p className="text-white font-black text-sm">{order.productName}</p>
                            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">{order.categoryName}</p>
                            {(order.quantity || order.size) && (
                              <div className="flex gap-2 mt-1">
                                {order.quantity && <Badge variant="outline" className="text-[9px] border-white/10 text-muted-foreground">كمية: {order.quantity}</Badge>}
                                {order.size && <Badge variant="outline" className="text-[9px] border-white/10 text-muted-foreground">مقاس: {order.size}</Badge>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          {order.estimatedPrice ? (
                            <p className="text-primary font-black text-base">{order.estimatedPrice.toLocaleString('ar-EG')} ج.م</p>
                          ) : (
                            <span className="text-muted-foreground/40 font-bold text-xs italic">سيتم التحديد</span>
                          )}
                        </td>
                        <td className="p-6">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border w-fit ${status.color}`}>
                            <status.Icon className="size-3.5" />
                            <span className="font-black text-[10px] uppercase tracking-widest">{status.label}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col">
                            <p className="text-slate-200 font-bold text-xs">{new Date(order.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</p>
                            <p className="text-muted-foreground font-bold text-[10px] mt-0.5">{new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedOrder(order)}
                              className="size-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            >
                              <Eye className="size-4.5" />
                            </Button>
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center size-9 rounded-xl text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                            >
                              <MessageCircle className="size-4.5" />
                            </a>
                            <Select
                              value={order.status}
                              onValueChange={(val: string) => handleStatusChange(order.id, val)}
                            >
                              <SelectTrigger className="w-9 h-9 p-0 border-none bg-transparent hover:bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white transition-all">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-white/10 bg-[#0c0c0c] text-white">
                                <SelectItem value="pending">معلق</SelectItem>
                                <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                                <SelectItem value="completed">مكتمل</SelectItem>
                                <SelectItem value="cancelled">ملغي</SelectItem>
                              </SelectContent>
                            </Select>
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

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open: boolean) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl bg-[#0c0c0c] border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden shadow-2xl font-arabic">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <DialogHeader className="p-8 pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-black tracking-tight">تفاصيل الطلب</DialogTitle>
              {selectedOrder && (
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${statusConfig[selectedOrder.status].color}`}>
                  <span className="font-black text-xs uppercase tracking-widest">{statusConfig[selectedOrder.status].label}</span>
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="p-8 pt-0 space-y-8 relative z-10">
              {/* Customer Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <User className="size-5" />
                    <h4 className="font-black text-sm uppercase tracking-widest">بيانات العميل</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-xs">الاسم بالكامل</span>
                      <span className="text-white font-black">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-xs">رقم الهاتف</span>
                      <span className="text-white font-black" dir="ltr">{selectedOrder.phone}</span>
                    </div>
                    {selectedOrder.clientId ? (
                      <div className="pt-2">
                        <Badge className="w-full justify-center py-2 bg-blue-500/10 text-blue-400 border-blue-500/20 font-black">عميل مسجل في النظام</Badge>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <Select onValueChange={(val: string) => handleAssignToClient(selectedOrder.id, val)}>
                          <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl h-10 font-bold text-xs">
                            <SelectValue placeholder="ربط بعميل مسجل..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0c0c0c] border-white/10 rounded-xl">
                            {clients.map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-xs font-bold text-white">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Package className="size-5" />
                    <h4 className="font-black text-sm uppercase tracking-widest">بيانات المنتج</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-xs">اسم المنتج</span>
                      <span className="text-white font-black">{selectedOrder.productName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-xs">التصنيف</span>
                      <Badge variant="outline" className="border-white/10 text-slate-400 font-black text-[10px]">{selectedOrder.categoryName}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-xs">السعر التقديري</span>
                      <span className="text-primary font-black">{selectedOrder.estimatedPrice?.toLocaleString('ar-EG') || '---'} ج.م</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <FileText className="size-5" />
                  <h4 className="font-black text-sm uppercase tracking-widest">المواصفات والتفاصيل</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#050505] p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">الكمية</p>
                    <p className="text-white font-black">{selectedOrder.quantity || '---'}</p>
                  </div>
                  <div className="bg-[#050505] p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">المقاس</p>
                    <p className="text-white font-black">{selectedOrder.size || '---'}</p>
                  </div>
                  <div className="bg-[#050505] p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">مدة التسليم</p>
                    <p className="text-white font-black">{selectedOrder.deliveryDays} أيام</p>
                  </div>
                  <div className="bg-[#050505] p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">التاريخ</p>
                    <p className="text-white font-black text-[11px]">{new Date(selectedOrder.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
                {selectedOrder.details && (
                  <div className="bg-[#050505] p-6 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">ملاحظات إضافية</p>
                    <p className="text-slate-300 font-bold leading-relaxed">{selectedOrder.details}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pb-8">
                <Button 
                  className="flex-1 h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  onClick={() => {
                    const whatsappLink = `https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `مرحباً ${selectedOrder.customerName}، بخصوص طلبك (${selectedOrder.productName}) من ELBA7RAWY...`
                    )}`
                    window.open(whatsappLink, '_blank')
                  }}
                >
                  <MessageCircle className="ml-2 size-5" />
                  مراسلة العميل
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 border-white/10 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all"
                  onClick={() => setSelectedOrder(null)}
                >
                  إغلاق النافذة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
