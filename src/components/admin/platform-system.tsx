'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Trash2,
  ExternalLink,
  Phone,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Briefcase,
  Printer,
  Package,
} from 'lucide-react'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { HardDrive, Activity, ShieldAlert, Database } from 'lucide-react'

interface Transaction {
  id: string
  type: 'payment' | 'debt' | 'expense'
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending'
}

interface Order {
  id: string
  productName: string
  categoryName: string
  quantity: string
  size: string
  details: string
  estimatedPrice: number
  status: string
  createdAt: string
}

interface Client {
  id: string
  name: string
  phone: string
  email?: string
  totalOrders: number
  totalPaid: number
  totalDebt: number
  lastActivity: string
  status: 'active' | 'inactive'
  transactions: Transaction[]
  orders: Order[]
}

interface Supplier {
  id: string
  name: string
  phone: string
  category: string
  totalPaid: number
  totalDebt: number
  lastActivity: string
  transactions: Transaction[]
}

export default function PlatformSystem() {
  const [clients, setClients] = useState<Client[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [isBackupLoading, setIsBackupLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [isAddSupplierTransactionOpen, setIsAddSupplierTransactionOpen] = useState(false)
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // New Client Form State
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    productName: '',
    paidAmount: '',
    remainingAmount: '',
  })

  // New Supplier Form State
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    category: '',
    paidAmount: '',
    remainingAmount: '',
  })

  // New Transaction Form State
  const [newTransaction, setNewTransaction] = useState({
    type: 'payment' as 'payment' | 'debt',
    amount: '',
    description: '',
    status: 'completed' as 'completed' | 'pending',
  })

  // New Order Form State
  const [newOrder, setNewOrder] = useState({
    productName: '',
    categoryName: '',
    quantity: '',
    size: '',
    details: '',
    estimatedPrice: '',
  })

  // Load data from API
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      const [clientsRes, suppliersRes, settingsRes] = await Promise.all([
        fetch('/api/platform/clients'),
        fetch('/api/platform/suppliers'),
        fetch('/api/settings')
      ])
      
      if (clientsRes.ok) {
        const data = await clientsRes.json()
        setClients(data)
        if (selectedClient) {
          const updatedSelected = data.find((c: Client) => c.id === (selectedClient as Client).id)
          if (updatedSelected) setSelectedClient(updatedSelected)
        }
      }

      if (suppliersRes.ok) {
        const data = await suppliersRes.json()
        setSuppliers(data)
        if (selectedSupplier) {
          const updatedSelected = data.find((s: Supplier) => s.id === (selectedSupplier as Supplier).id)
          if (updatedSelected) setSelectedSupplier(updatedSelected)
        }
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings(data)
      }

      // Fetch system health separately
      const healthRes = await fetch('/api/health')
      if (healthRes.ok) {
        const healthData = await healthRes.json()
        setSystemHealth(healthData)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedClient, selectedSupplier])

  useEffect(() => {
    const init = async () => {
      await fetchClients()
    }
    init()
  }, [fetchClients])

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.phone) {
      toast.error('يرجى ملء البيانات الأساسية للمورد')
      return
    }

    try {
      const res = await fetch('/api/platform/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier),
      })

      if (res.ok) {
        toast.success('تم إضافة الشركة/المورد بنجاح')
        setIsAddSupplierOpen(false)
        setNewSupplier({ name: '', phone: '', category: '', paidAmount: '', remainingAmount: '' })
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || 'فشل إضافة المورد')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الإضافة')
    }
  }

  const handleAddSupplierTransaction = async () => {
    if (!selectedSupplier || !newTransaction.amount || !newTransaction.description) {
      toast.error('يرجى ملء بيانات العملية')
      return
    }

    try {
      const res = await fetch('/api/platform/supplier-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplier.id,
          ...newTransaction,
        }),
      })

      if (res.ok) {
        toast.success('تم إضافة العملية بنجاح')
        setIsAddSupplierTransactionOpen(false)
        setNewTransaction({ type: 'payment', amount: '', description: '', status: 'completed' })
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || 'فشل إضافة العملية')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الإضافة')
    }
  }

  const handleAddOrder = async () => {
    if (!selectedClient || !newOrder.productName) {
      toast.error('يرجى تحديد المنتج المطلوب')
      return
    }

    try {
      const res = await fetch(`/api/platform/clients/${selectedClient.id}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      })

      if (res.ok) {
        toast.success('تم إضافة الطلب بنجاح')
        setIsAddOrderOpen(false)
        setNewOrder({ productName: '', categoryName: '', quantity: '', size: '', details: '', estimatedPrice: '' })
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || 'فشل إضافة الطلب')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الإضافة')
    }
  }

  const handleDownloadBackup = async () => {
    setIsBackupLoading(true)
    try {
      const res = await fetch('/api/admin/backup')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('تم تحميل نسخة احتياطية بنجاح')
    } catch (error) {
      toast.error('فشل تحميل النسخة الاحتياطية')
    } finally {
      setIsBackupLoading(false)
    }
  }

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.phone) {
      toast.error('يرجى ملء البيانات الأساسية')
      return
    }

    try {
      const res = await fetch('/api/platform/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })

      if (res.ok) {
        toast.success('تم إضافة العميل بنجاح')
        setIsAddClientOpen(false)
        setNewClient({ name: '', phone: '', productName: '', paidAmount: '', remainingAmount: '' })
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || 'فشل إضافة العميل')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الإضافة')
    }
  }

  const handleAddTransaction = async () => {
    if (!selectedClient || !newTransaction.amount || !newTransaction.description) {
      toast.error('يرجى ملء بيانات العملية')
      return
    }

    try {
      const res = await fetch('/api/platform/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          ...newTransaction,
        }),
      })

      if (res.ok) {
        toast.success('تم إضافة العملية بنجاح')
        setIsAddTransactionOpen(false)
        setNewTransaction({ type: 'payment', amount: '', description: '', status: 'completed' })
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || 'فشل إضافة العملية')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الإضافة')
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل وجميع معاملاته؟')) return

    try {
      const res = await fetch(`/api/platform/clients/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('تم حذف العميل بنجاح')
        if (selectedClient?.id === id) setSelectedClient(null)
        fetchClients()
      } else {
        toast.error('فشل حذف العميل')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      const res = await fetch(`/api/platform/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        toast.success('تم تحديث حالة العميل')
        fetchClients()
      } else {
        toast.error('فشل تحديث الحالة')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث')
    }
  }

  const handlePrint = () => {
    if (!selectedClient) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const totalTransactions = selectedClient.transactions?.length || 0
    const html = `
      <html dir="rtl">
        <head>
          <title>كشف حساب - ${selectedClient.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
            body { font-family: 'Cairo', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; background: #fff; }
            .container { max-width: 900px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 20px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #f1f5f9; padding-bottom: 20px; }
            .logo-section h1 { margin: 0; color: #0f172a; font-size: 32px; font-weight: 900; }
            .logo-section p { margin: 5px 0 0; color: #64748b; font-weight: 700; font-size: 14px; letter-spacing: 2px; }
            .client-card { background: #f8fafc; padding: 30px; border-radius: 20px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; border: 1px solid #f1f5f9; }
            .info-box label { display: block; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
            .info-box span { font-weight: 800; font-size: 16px; color: #0f172a; display: block; }
            .notes-box { grid-column: span 2; border-top: 1px solid #e2e8f0; pt: 20px; margin-top: 10px; }
            .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-box { padding: 25px; border-radius: 20px; text-align: center; border: 2px solid #f1f5f9; }
            .stat-box.success { background: #f0fdf4; border-color: #dcfce7; }
            .stat-box.danger { background: #fef2f2; border-color: #fee2e2; }
            .stat-box label { display: block; font-size: 12px; font-weight: 800; color: #64748b; margin-bottom: 10px; }
            .stat-box value { display: block; font-size: 24px; font-weight: 900; }
            .stat-box.success value { color: #166534; }
            .stat-box.danger value { color: #991b1b; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; border-radius: 15px; overflow: hidden; border: 1px solid #e2e8f0; }
            th { background: #f8fafc; padding: 18px; text-align: right; font-size: 12px; font-weight: 900; color: #475569; border-bottom: 1px solid #e2e8f0; }
            td { padding: 18px; text-align: right; font-size: 14px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #334155; }
            tr:last-child td { border-bottom: none; }
            .badge { padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 900; display: inline-block; }
            .badge-payment { background: #dcfce7; color: #15803d; }
            .badge-debt { background: #fee2e2; color: #b91c1c; }
            .footer { margin-top: 50px; text-align: center; border-top: 2px solid #f1f5f9; padding-top: 30px; }
            .footer p { margin: 5px 0; font-size: 13px; color: #64748b; font-weight: 700; }
            .stamp { width: 150px; height: 150px; border: 4px double #1e40af; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e40af; font-weight: 900; transform: rotate(-15deg); margin: 30px auto; opacity: 0.1; position: absolute; bottom: 100px; left: 100px; }
            @media print {
              body { padding: 0; background: none; }
              .container { border: none; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-section">
                ${settings?.logoUrl ? `<img src="${settings.logoUrl}" style="height: 50px; width: auto; object-fit: contain; margin-bottom: 10px;" />` : ''}
                <h1>${settings?.siteName || 'ELBA7RAWY'}</h1>
                <p>${settings?.siteNameEn || 'ADVERTISING SOLUTIONS'}</p>
              </div>
              <div style="text-align: left">
                <h2 style="margin: 0; color: #1e40af; font-weight: 900; font-size: 24px;">كشف حساب عميل</h2>
                <p style="margin: 5px 0 0; color: #94a3b8; font-size: 12px; font-weight: 800;">تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')}</p>
              </div>
            </div>

            <div class="client-card">
              <div class="info-box">
                <label>اسم العميل</label>
                <span>${selectedClient.name}</span>
              </div>
              <div class="info-box">
                <label>رقم الهاتف</label>
                <span>${selectedClient.phone}</span>
              </div>
              <div class="info-box">
                <label>البريد الإلكتروني</label>
                <span>${selectedClient.email || '—'}</span>
              </div>
              <div class="info-box">
                <label>العنوان</label>
                <span>${(selectedClient as any).address || '—'}</span>
              </div>
              ${(selectedClient as any).notes ? `
                <div class="info-box notes-box">
                  <label>ملاحظات إضافية</label>
                  <span>${(selectedClient as any).notes}</span>
                </div>
              ` : ''}
            </div>

            <div class="stats-row">
              <div class="stat-box success">
                <label>إجمالي المدفوعات</label>
                <value>${selectedClient.totalPaid.toLocaleString()} ج.م</value>
              </div>
              <div class="stat-box danger">
                <label>إجمالي المديونية</label>
                <value>${selectedClient.totalDebt.toLocaleString()} ج.م</value>
              </div>
              <div class="stat-box">
                <label>عدد المعاملات</label>
                <value>${totalTransactions}</value>
              </div>
            </div>

            <h3 style="font-size: 18px; font-weight: 900; margin-bottom: 20px; color: #0f172a; border-right: 4px solid #1e40af; padding-right: 15px;">سجل المعاملات التفصيلي</h3>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>البيان</th>
                  <th>نوع العملية</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                ${selectedClient.transactions?.length > 0 ? selectedClient.transactions.map(t => `
                  <tr>
                    <td dir="ltr">${new Date(t.date).toLocaleDateString('ar-EG')}</td>
                    <td>${t.description}</td>
                    <td>
                      <span class="badge ${t.type === 'payment' ? 'badge-payment' : 'badge-debt'}">
                        ${t.type === 'payment' ? 'تحصيل نقدي' : 'مديونية عمل'}
                      </span>
                    </td>
                    <td style="font-weight: 900; color: ${t.type === 'payment' ? '#15803d' : '#b91c1c'}">
                      ${t.type === 'payment' ? '+' : '-'}${t.amount.toLocaleString()} ج.م
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 40px;">لا توجد معاملات مسجلة لهذا العميل حتى الآن</td></tr>'}
              </tbody>
            </table>

            <div class="stamp">${settings?.siteName || 'ELBA7RAWY'}</div>

            <div class="footer">
              <p>شكراً لثقتكم في ${settings?.siteName || 'ELBA7RAWY'} للدعاية والإعلان</p>
              <p>فرع العاشر من رمضان | فرع الزقازيق - الشرقية</p>
              <p style="font-size: 11px; margin-top: 15px; opacity: 0.6;">تم استخراج هذا الكشف آلياً بواسطة نظام المنصة الذكي</p>
            </div>
          </div>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone?.includes(searchQuery)
  )

  const filteredSuppliers = suppliers.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.phone?.includes(searchQuery)
  )

  const stats = {
    totalClients: clients.length,
    totalRevenue: clients.reduce((acc, c) => acc + c.totalPaid, 0),
    totalDebt: clients.reduce((acc, c) => acc + c.totalDebt, 0),
    activeOrders: clients.reduce((acc, c) => acc + (c.orders?.length || 0), 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-2">
      <Tabs defaultValue="clients" className="w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 p-3 rounded-xl border border-white/5 mb-4 backdrop-blur-md">
          <TabsList className="bg-black/40 border border-white/10 p-1 h-10 rounded-lg">
            <TabsTrigger value="clients" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5 text-xs font-black transition-all">العملاء</TabsTrigger>
            <TabsTrigger value="suppliers" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5 text-xs font-black transition-all">الموردين</TabsTrigger>
            <TabsTrigger value="system" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5 text-xs font-black transition-all">النظام</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border-white/10 pr-9 h-9 text-xs font-bold rounded-lg focus:ring-primary/20"
              />
            </div>
            <Button size="sm" onClick={() => setIsAddClientOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 rounded-lg font-black text-xs px-4">
              <Plus className="size-3 ml-1.5" /> عميل جديد
            </Button>
          </div>
        </div>

        <TabsContent value="clients" className="mt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Quick Stats */}
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Users className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">إجمالي العملاء</span>
              </div>
              <p className="text-xl font-black text-white">{stats.totalClients}</p>
            </Card>
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <DollarSign className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">المحصل</span>
              </div>
              <p className="text-xl font-black text-white">{stats.totalRevenue.toLocaleString()} ج.م</p>
            </Card>
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <TrendingUp className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">المديونيات</span>
              </div>
              <p className="text-xl font-black text-white">{stats.totalDebt.toLocaleString()} ج.م</p>
            </Card>
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <Package className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">إجمالي الطلبات</span>
              </div>
              <p className="text-xl font-black text-white">{stats.activeOrders}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-white/5 border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-right text-[10px] font-black text-muted-foreground uppercase py-3">العميل</TableHead>
                    <TableHead className="text-right text-[10px] font-black text-muted-foreground uppercase py-3">التواصل</TableHead>
                    <TableHead className="text-right text-[10px] font-black text-muted-foreground uppercase py-3">الطلبات</TableHead>
                    <TableHead className="text-right text-[10px] font-black text-muted-foreground uppercase py-3">الحالة المالية</TableHead>
                    <TableHead className="text-left text-[10px] font-black text-muted-foreground uppercase py-3">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className={`border-white/5 hover:bg-white/5 transition-colors group cursor-pointer ${selectedClient?.id === client.id ? 'bg-primary/10' : ''}`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">{client.name[0]}</div>
                          <span className="font-bold text-xs text-white">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-white flex items-center gap-1.5"><Phone className="size-2.5 text-muted-foreground" /> {client.phone}</span>
                          <span className="text-[8px] text-muted-foreground">{client.email || 'لا يوجد بريد'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] font-black rounded-md px-2 py-0.5">{client.totalOrders} طلب</Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="text-emerald-500">{client.totalPaid.toLocaleString()}</span>
                            <span className="text-red-500">{client.totalDebt.toLocaleString()}</span>
                          </div>
                          <div className="w-24 bg-black/40 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full" 
                              style={{ width: `${(client.totalPaid / (client.totalPaid + client.totalDebt || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-left">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedClient(client); }} className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                          <ExternalLink className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <div className="space-y-4">
              {selectedClient ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="bg-white/5 border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
                    <CardHeader className="p-4 border-b border-white/5 bg-black/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">{selectedClient.name[0]}</div>
                          <div>
                            <h3 className="text-sm font-black text-white">{selectedClient.name}</h3>
                            <p className="text-[10px] text-muted-foreground font-bold">آخر نشاط: {new Date(selectedClient.lastActivity).toLocaleDateString('ar-EG')}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon" className="size-8 rounded-lg border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handlePrint}>
                            <Printer className="size-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="size-8 rounded-lg border-white/10 bg-white/5 text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteClient(selectedClient.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10 text-center">
                          <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">تم تحصيله</p>
                          <p className="text-sm font-black text-emerald-500">{selectedClient.totalPaid.toLocaleString()} ج.م</p>
                        </div>
                        <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/10 text-center">
                          <p className="text-[8px] font-black text-red-400 uppercase mb-1">متبقي مديونية</p>
                          <p className="text-sm font-black text-red-500">{selectedClient.totalDebt.toLocaleString()} ج.م</p>
                        </div>
                      </div>

                      <Tabs defaultValue="transactions" className="w-full">
                        <TabsList className="grid grid-cols-2 bg-black/40 p-1 h-9 rounded-lg border border-white/5">
                          <TabsTrigger value="transactions" className="text-[10px] font-black rounded-md">المعاملات</TabsTrigger>
                          <TabsTrigger value="orders" className="text-[10px] font-black rounded-md">الطلبات</TabsTrigger>
                        </TabsList>
                        <TabsContent value="transactions" className="mt-3 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-white">السجل المالي</span>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] font-black text-primary p-0" onClick={() => setIsAddTransactionOpen(true)}>
                              <Plus className="size-3 ml-1" /> إضافة
                            </Button>
                          </div>
                          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            {selectedClient.transactions?.map(t => (
                              <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-2">
                                  <div className={`size-6 rounded-md flex items-center justify-center ${t.type === 'payment' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {t.type === 'payment' ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black text-white leading-tight">{t.description}</p>
                                    <p className="text-[7px] text-muted-foreground font-bold">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-black ${t.type === 'payment' ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {t.type === 'payment' ? '+' : '-'}{t.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="orders" className="mt-3 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-white">الطلبات الحالية</span>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] font-black text-primary p-0" onClick={() => setIsAddOrderOpen(true)}>
                              <Plus className="size-3 ml-1" /> طلب
                            </Button>
                          </div>
                          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            {selectedClient.orders?.map(o => (
                              <div key={o.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black text-white">{o.productName}</span>
                                  <Badge className="text-[7px] h-4 px-1 bg-amber-500/10 text-amber-500 border-amber-500/20">{o.status}</Badge>
                                </div>
                                <div className="flex justify-between text-[8px] text-muted-foreground font-bold">
                                  <span>{o.quantity} | {o.size}</span>
                                  <span className="text-primary">{o.estimatedPrice?.toLocaleString()} ج.م</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-6 bg-white/5 rounded-xl border-2 border-dashed border-white/10 text-center backdrop-blur-md">
                  <Users className="size-10 text-white/10 mb-3" />
                  <h3 className="text-xs font-black text-white mb-1">اختر عميلاً للمتابعة</h3>
                  <p className="text-[10px] text-muted-foreground font-bold max-w-[150px]">قم باختيار عميل من القائمة لعرض تفاصيله</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <Briefcase className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">إجمالي الموردين</span>
              </div>
              <p className="text-xl font-black text-white">{suppliers.length}</p>
            </Card>
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <DollarSign className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">إجمالي ما دفعناه</span>
              </div>
              <p className="text-xl font-black text-white">{suppliers.reduce((acc, s) => acc + s.totalPaid, 0).toLocaleString()} ج.م</p>
            </Card>
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <AlertCircle className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">إجمالي المديونية</span>
              </div>
              <p className="text-xl font-black text-white">{suppliers.reduce((acc, s) => acc + s.totalDebt, 0).toLocaleString()} ج.م</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-white/5 border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-right text-[10px] font-black text-muted-foreground uppercase py-3">الشركة / المورد</TableHead>
                    <TableHead className="text-right text-[10px] font-black text-muted-foreground uppercase py-3">التصنيف</TableHead>
                    <TableHead className="text-right text-[10px] font-black text-muted-foreground uppercase py-3">المدفوع</TableHead>
                    <TableHead className="text-right text-[10px] font-black text-muted-foreground uppercase py-3">المتبقي</TableHead>
                    <TableHead className="text-left text-[10px] font-black text-muted-foreground uppercase py-3">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow 
                      key={supplier.id} 
                      className={`border-white/5 hover:bg-white/5 transition-colors group cursor-pointer ${selectedSupplier?.id === supplier.id ? 'bg-primary/10' : ''}`}
                      onClick={() => setSelectedSupplier(supplier)}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-xs">{supplier.name[0]}</div>
                          <span className="font-bold text-xs text-white">{supplier.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-[10px] font-bold text-white">{supplier.category}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-[10px] font-black text-emerald-500">{supplier.totalPaid.toLocaleString()} ج.م</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className={`text-[10px] font-black ${supplier.totalDebt > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>{supplier.totalDebt.toLocaleString()} ج.م</span>
                      </TableCell>
                      <TableCell className="py-3 text-left">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSupplier(supplier); }} className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                          <ExternalLink className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <div className="space-y-4">
              {selectedSupplier ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="bg-white/5 border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
                    <CardHeader className="p-4 border-b border-white/5 bg-black/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-lg">{selectedSupplier.name[0]}</div>
                          <div>
                            <h3 className="text-sm font-black text-white">{selectedSupplier.name}</h3>
                            <p className="text-[10px] text-muted-foreground font-bold">{selectedSupplier.phone}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black text-primary" onClick={() => setIsAddSupplierTransactionOpen(true)}>
                          <Plus className="size-3 ml-1" /> إضافة عملية
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10 text-center">
                          <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">دفعنا لهم</p>
                          <p className="text-sm font-black text-emerald-500">{selectedSupplier.totalPaid.toLocaleString()} ج.م</p>
                        </div>
                        <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/10 text-center">
                          <p className="text-[8px] font-black text-red-400 uppercase mb-1">باقي لهم</p>
                          <p className="text-sm font-black text-red-500">{selectedSupplier.totalDebt.toLocaleString()} ج.م</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-white">آخر المعاملات</span>
                        <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                          {selectedSupplier.transactions?.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                              <div>
                                <p className="text-[9px] font-black text-white leading-tight">{t.description}</p>
                                <p className="text-[7px] text-muted-foreground font-bold">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                              </div>
                              <span className={`text-[10px] font-black ${t.type === 'payment' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {t.type === 'payment' ? '-' : '+'}{t.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-white/5 rounded-xl border-2 border-dashed border-white/10 text-center backdrop-blur-md">
                  <Briefcase className="size-10 text-white/10 mb-3" />
                  <h3 className="text-xs font-black text-white mb-1">اختر موردًا للمتابعة</h3>
                  <p className="text-[10px] text-muted-foreground font-bold max-w-[150px]">قم باختيار مورد من القائمة لعرض تفاصيل حسابه</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-white/5 border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <Activity className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase">حالة النظام</p>
                <p className="text-sm font-black text-white">{systemHealth?.status === 'healthy' ? 'مستقر وآمن' : 'يحتاج فحص'}</p>
              </div>
            </Card>
            <Card className="bg-white/5 border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                <Database className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase">قاعدة البيانات</p>
                <p className="text-sm font-black text-white">{systemHealth?.database === 'connected' ? 'متصلة' : 'منقطعة'}</p>
              </div>
            </Card>
            <Card className="bg-white/5 border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase">الأمان</p>
                <p className="text-sm font-black text-white">Rate Limit: نشط</p>
              </div>
            </Card>
          </div>

          <Card className="bg-white/5 border-white/5 rounded-xl p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-black text-white mb-1">النسخ الاحتياطي والصيانة</h3>
                <p className="text-xs text-muted-foreground font-bold">تصدير كافة البيانات المسجلة على المنصة في ملف JSON خارجي للتأمين.</p>
              </div>
              <Button 
                onClick={handleDownloadBackup}
                disabled={isBackupLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 rounded-xl px-8 shadow-lg shadow-blue-600/20"
              >
                {isBackupLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Download className="ml-2 size-4" />
                    تصدير نسخة احتياطية
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[400px] font-arabic bg-[#0c0c0c] border-white/10 text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white text-right">إضافة عميل جديد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">اسم العميل</Label>
              <Input placeholder="أدخل اسم العميل" className="h-9 text-xs bg-white/5 border-white/10" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">رقم الهاتف</Label>
              <Input placeholder="01xxxxxxxxx" className="h-9 text-xs bg-white/5 border-white/10" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">المنتج / الخدمة</Label>
              <Input placeholder="ماذا طلب العميل؟" className="h-9 text-xs bg-white/5 border-white/10" value={newClient.productName} onChange={(e) => setNewClient({...newClient, productName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-right text-xs font-bold">المقدم (ج.م)</Label>
                <Input type="number" placeholder="0.00" className="h-9 text-xs bg-white/5 border-white/10" value={newClient.paidAmount} onChange={(e) => setNewClient({...newClient, paidAmount: e.target.value})} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-right text-xs font-bold">المتبقي (ج.م)</Label>
                <Input type="number" placeholder="0.00" className="h-9 text-xs bg-white/5 border-white/10" value={newClient.remainingAmount} onChange={(e) => setNewClient({...newClient, remainingAmount: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddClient} className="w-full bg-primary font-black text-xs h-10">حفظ العميل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="sm:max-w-[400px] font-arabic bg-[#0c0c0c] border-white/10 text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white text-right">إضافة شركة توريد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">اسم الشركة</Label>
              <Input placeholder="أدخل اسم الشركة" className="h-9 text-xs bg-white/5 border-white/10" value={newSupplier.name} onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">رقم الهاتف</Label>
              <Input placeholder="01xxxxxxxxx" className="h-9 text-xs bg-white/5 border-white/10" value={newSupplier.phone} onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">تصنيف البضاعة</Label>
              <Input placeholder="مثال: خامات طباعة" className="h-9 text-xs bg-white/5 border-white/10" value={newSupplier.category} onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-right text-xs font-bold">مدفوع لهم</Label>
                <Input type="number" placeholder="0.00" className="h-9 text-xs bg-white/5 border-white/10" value={newSupplier.paidAmount} onChange={(e) => setNewSupplier({...newSupplier, paidAmount: e.target.value})} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-right text-xs font-bold">متبقي لهم</Label>
                <Input type="number" placeholder="0.00" className="h-9 text-xs bg-white/5 border-white/10" value={newSupplier.remainingAmount} onChange={(e) => setNewSupplier({...newSupplier, remainingAmount: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddSupplier} className="w-full bg-primary font-black text-xs h-10">حفظ المورد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-[400px] font-arabic bg-[#0c0c0c] border-white/10 text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white text-right">إضافة عملية مالية</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">نوع العملية</Label>
              <Select value={newTransaction.type} onValueChange={(val: any) => setNewTransaction({...newTransaction, type: val})}>
                <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="font-arabic bg-[#0c0c0c] border-white/10 text-white">
                  <SelectItem value="payment">دفعة / تحصيل</SelectItem>
                  <SelectItem value="debt">مديونية / باق حساب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">المبلغ</Label>
              <Input type="number" placeholder="0.00" className="h-9 text-xs bg-white/5 border-white/10" value={newTransaction.amount} onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">الوصف</Label>
              <Input placeholder="مثال: دفعة تحت الحساب" className="h-9 text-xs bg-white/5 border-white/10" value={newTransaction.description} onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddTransaction} className="w-full bg-primary font-black text-xs h-10">تأكيد العملية</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSupplierTransactionOpen} onOpenChange={setIsAddSupplierTransactionOpen}>
        <DialogContent className="sm:max-w-[400px] font-arabic bg-[#0c0c0c] border-white/10 text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white text-right">إضافة عملية للمورد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">نوع العملية</Label>
              <Select value={newTransaction.type} onValueChange={(val: any) => setNewTransaction({...newTransaction, type: val})}>
                <SelectTrigger className="h-9 text-xs bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="font-arabic bg-[#0c0c0c] border-white/10 text-white">
                  <SelectItem value="payment">دفعة للمورد (خروج نقدية)</SelectItem>
                  <SelectItem value="debt">فاتورة بضاعة (مديونية علينا)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">المبلغ</Label>
              <Input type="number" placeholder="0.00" className="h-9 text-xs bg-white/5 border-white/10" value={newTransaction.amount} onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">البيان</Label>
              <Input placeholder="مثال: دفعة خامات شهر 5" className="h-9 text-xs bg-white/5 border-white/10" value={newTransaction.description} onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddSupplierTransaction} className="w-full bg-primary font-black text-xs h-10">تأكيد العملية</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
        <DialogContent className="sm:max-w-[400px] font-arabic bg-[#0c0c0c] border-white/10 text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white text-right">إضافة طلب جديد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">اسم المنتج</Label>
              <Input placeholder="مثال: لوحة فليكس" className="h-9 text-xs bg-white/5 border-white/10" value={newOrder.productName} onChange={(e) => setNewOrder({...newOrder, productName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-right text-xs font-bold">الكمية</Label>
                <Input placeholder="1" className="h-9 text-xs bg-white/5 border-white/10" value={newOrder.quantity} onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-right text-xs font-bold">المقاس</Label>
                <Input placeholder="3*2 متر" className="h-9 text-xs bg-white/5 border-white/10" value={newOrder.size} onChange={(e) => setNewOrder({...newOrder, size: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">السعر المقدر</Label>
              <Input type="number" placeholder="0.00" className="h-9 text-xs bg-white/5 border-white/10" value={newOrder.estimatedPrice} onChange={(e) => setNewOrder({...newOrder, estimatedPrice: e.target.value})} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-right text-xs font-bold">تفاصيل</Label>
              <Textarea placeholder="أي ملاحظات..." className="text-xs bg-white/5 border-white/10 min-h-[60px]" value={newOrder.details} onChange={(e) => setNewOrder({...newOrder, details: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddOrder} className="w-full bg-primary font-black text-xs h-10">تأكيد الطلب</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
