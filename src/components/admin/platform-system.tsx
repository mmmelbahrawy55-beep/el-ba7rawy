'use client'

import { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    type: 'payment' as 'payment' | 'debt' | 'expense',
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
  const fetchClients = async () => {
    try {
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
    } catch (error) {
      toast.error('فشل تحميل بيانات النظام')
    } finally {
      setLoading(false)
    }
  }

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

  useEffect(() => {
    const init = async () => {
      await fetchClients()
      try {
        const res = await fetch('/api/health')
        const data = await res.json()
        setSystemHealth(data)
      } catch (err) {
        // silent
      }
    }
    init()
  }, [])

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
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
      <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">سيستم المنصة</h1>
          <p className="text-muted-foreground font-bold">إدارة البنية التحتية لـ {settings?.siteName || 'ELBA7RAWY'}</p>
        </div>
      </div>
        {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-blue-500/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Users className="size-6 text-blue-500" />
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold">إجمالي العملاء</Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-white">{stats.totalClients}</h3>
              <p className="text-xs text-muted-foreground font-bold mt-1">عميل مسجل في المنصة</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-emerald-500/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="size-6 text-emerald-500" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">إجمالي التحصيل</Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-white">{stats.totalRevenue.toLocaleString()} ج.م</h3>
              <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
                <ArrowUpRight className="size-3" />
                صافي الإيرادات
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-red-500/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="size-6 text-red-500" />
              </div>
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 font-bold">إجمالي المديونية</Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-white">{stats.totalDebt.toLocaleString()} ج.م</h3>
              <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                <ArrowDownRight className="size-3" />
                ديون معلقة
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-amber-500/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="size-6 text-amber-500" />
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold">إجمالي الطلبات</Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-white">{stats.activeOrders}</h3>
              <p className="text-xs text-muted-foreground font-bold mt-1">عملية مسجلة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-white/5 p-1 rounded-2xl h-14 w-full max-w-2xl border border-white/10 backdrop-blur-md">
            <TabsTrigger value="clients" className="rounded-xl font-black text-sm flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              إدارة العملاء
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="rounded-xl font-black text-sm flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase className="size-4 ml-2" />
              شركات التوريد
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-xl font-black text-sm flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="size-4 ml-2" />
              صيانة النظام
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="suppliers" className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="ابحث عن شركة أو مورد..." 
                className="pr-11 h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white placeholder:text-muted-foreground/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-bold shadow-lg shadow-primary/20 flex gap-2">
                  <Plus className="size-5" />
                  إضافة شركة توريد
                </Button>
              </DialogTrigger>
              <DialogContent className="font-arabic bg-[#0c0c0c] border-white/10 text-white" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right font-black">إضافة شركة توريد جديدة</DialogTitle>
                  <DialogDescription className="text-right">أدخل بيانات الشركة والمبالغ المستحقة.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-right font-bold">اسم الشركة / المورد</Label>
                    <Input 
                      placeholder="أدخل اسم الشركة" 
                      className="text-right font-bold bg-white/5 border-white/10"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-right font-bold">رقم الهاتف</Label>
                    <Input 
                      placeholder="01xxxxxxxxx" 
                      className="text-right font-bold bg-white/5 border-white/10"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-right font-bold">تصنيف البضاعة</Label>
                    <Input 
                      placeholder="مثال: خامات طباعة، إضاءة..." 
                      className="text-right font-bold bg-white/5 border-white/10"
                      value={newSupplier.category}
                      onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-right font-bold">دفعنا كام؟</Label>
                      <Input 
                        type="number"
                        placeholder="0.00" 
                        className="text-right font-bold bg-white/5 border-white/10"
                        value={newSupplier.paidAmount}
                        onChange={(e) => setNewSupplier({...newSupplier, paidAmount: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-right font-bold">باقي لهم كام؟</Label>
                      <Input 
                        type="number"
                        placeholder="0.00" 
                        className="text-right font-bold bg-white/5 border-white/10"
                        value={newSupplier.remainingAmount}
                        onChange={(e) => setNewSupplier({...newSupplier, remainingAmount: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddSupplier} className="w-full bg-primary font-bold">حفظ المورد</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm overflow-hidden bg-white/5 backdrop-blur-md border border-white/10">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10">
                    <TableHead className="text-right font-black text-muted-foreground">الشركة / المورد</TableHead>
                    <TableHead className="text-right font-black text-muted-foreground">رقم الهاتف</TableHead>
                    <TableHead className="text-right font-black text-muted-foreground">التصنيف</TableHead>
                    <TableHead className="text-right font-black text-muted-foreground">المدفوع</TableHead>
                    <TableHead className="text-right font-black text-muted-foreground">المتبقي</TableHead>
                    <TableHead className="text-left font-black text-muted-foreground">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow 
                      key={supplier.id}
                      className={`group hover:bg-white/5 border-white/5 transition-colors cursor-pointer ${selectedSupplier?.id === supplier.id ? 'bg-primary/10' : ''}`}
                      onClick={() => setSelectedSupplier(supplier)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs border border-blue-500/20">
                            {supplier.name[0]}
                          </div>
                          <p className="font-black text-white text-sm">{supplier.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-muted-foreground text-sm">{supplier.phone}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-slate-200 text-sm">{supplier.category}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-black text-emerald-500 text-sm">{supplier.totalPaid.toLocaleString()} ج.م</p>
                      </TableCell>
                      <TableCell>
                        <p className={`font-black text-sm ${supplier.totalDebt > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {supplier.totalDebt.toLocaleString()} ج.م
                        </p>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-white">
                          <ExternalLink className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                  </Table>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              {selectedSupplier ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <Card className="border-none shadow-sm bg-white/5 border border-white/10 overflow-hidden">
                    <CardHeader className="bg-white/5 pb-6 border-b border-white/10">
                      <CardTitle className="text-lg font-black text-white">{selectedSupplier.name}</CardTitle>
                      <CardDescription className="font-bold text-muted-foreground">إدارة حسابات المورد المالية</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/10">
                          <p className="text-[10px] font-black text-emerald-400 mb-1">إجمالي ما تم دفعه</p>
                          <p className="text-xl font-black text-emerald-500">{selectedSupplier.totalPaid.toLocaleString()} ج.م</p>
                        </div>
                        <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/10">
                          <p className="text-[10px] font-black text-red-400 mb-1">المتبقي لهم</p>
                          <p className="text-xl font-black text-red-500">{selectedSupplier.totalDebt.toLocaleString()} ج.م</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-white text-sm">آخر المعاملات</h4>
                          <Dialog open={isAddSupplierTransactionOpen} onOpenChange={setIsAddSupplierTransactionOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/5 font-bold h-8 px-2">
                                <Plus className="size-4 ml-1" />
                                إضافة عملية
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="font-arabic bg-[#0c0c0c] border-white/10 text-white" dir="rtl">
                              <DialogHeader>
                                <DialogTitle className="text-right font-black">إضافة عملية مالية للمورد</DialogTitle>
                                <DialogDescription className="text-right text-muted-foreground">سجل دفعة جديدة للمورد أو فاتورة مديونية من {selectedSupplier.name}</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label className="text-right font-bold">نوع العملية</Label>
                                  <Select 
                                    value={newTransaction.type} 
                                    onValueChange={(val: any) => setNewTransaction({...newTransaction, type: val})}
                                  >
                                    <SelectTrigger className="text-right font-bold bg-white/5 border-white/10">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="font-arabic bg-[#0c0c0c] border-white/10 text-white">
                                      <SelectItem value="payment">دفعة للمورد (خروج نقدية)</SelectItem>
                                      <SelectItem value="debt">فاتورة بضاعة (مديونية لنا)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2">
                                  <Label className="text-right font-bold">المبلغ</Label>
                                  <Input 
                                    type="number" 
                                    placeholder="0.00" 
                                    className="text-right font-bold bg-white/5 border-white/10"
                                    value={newTransaction.amount}
                                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label className="text-right font-bold">البيان / تفاصيل البضاعة</Label>
                                  <Input 
                                    placeholder="مثال: دفعة من حساب خامات شهر 5" 
                                    className="text-right font-bold bg-white/5 border-white/10"
                                    value={newTransaction.description}
                                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleAddSupplierTransaction} className="w-full bg-primary font-bold">تأكيد العملية</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {selectedSupplier.transactions?.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                              <div>
                                <p className="text-xs font-black text-white">{t.description}</p>
                                <p className="text-[10px] text-muted-foreground font-bold">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                              </div>
                              <p className={`text-sm font-black ${t.type === 'payment' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {t.type === 'payment' ? '-' : '+'}{t.amount.toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
                  <Briefcase className="size-12 text-white/10 mb-4" />
                  <p className="text-sm font-bold text-muted-foreground text-center">اختر شركة من القائمة لعرض تفاصيل الحساب المالي</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Health Card */}
            <Card className="border-none shadow-xl bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden group">
              <CardContent className="p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="size-16 rounded-[2rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                    <Activity className="size-8" />
                  </div>
                  <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none ${
                    systemHealth?.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {systemHealth?.status === 'healthy' ? 'نظام مستقر' : 'تنبيه بالنظام'}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">حالة الخادم</h3>
                  <p className="text-muted-foreground font-bold mt-2">مراقبة فورية لأداء السيرفر وقاعدة البيانات</p>
                </div>
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-muted-foreground">قاعدة البيانات</span>
                    <span className={`text-sm font-black ${systemHealth?.database === 'connected' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {systemHealth?.database === 'connected' ? 'متصلة' : 'منقطعة'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-muted-foreground">مدة التشغيل</span>
                    <span className="text-sm font-black text-white" dir="ltr">
                      {Math.floor(systemHealth?.stats?.uptime / 3600 || 0)}h {Math.floor((systemHealth?.stats?.uptime % 3600) / 60 || 0)}m
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backup Card */}
            <Card className="border-none shadow-xl bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden group">
              <CardContent className="p-10 space-y-6">
                <div className="size-16 rounded-[2rem] bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                  <Database className="size-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">نسخة احتياطية</h3>
                  <p className="text-muted-foreground font-bold mt-2">تأمين بيانات الموقع وتصديرها كملف خارجي</p>
                </div>
                <div className="pt-4">
                  <Button 
                    onClick={handleDownloadBackup}
                    disabled={isBackupLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl shadow-xl shadow-blue-600/20"
                  >
                    {isBackupLoading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <HardDrive className="ml-2 size-5" />
                        تصدير كافة البيانات
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="border-none shadow-xl bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden group">
              <CardContent className="p-10 space-y-6">
                <div className="size-16 rounded-[2rem] bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <ShieldAlert className="size-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">أمن المنصة</h3>
                  <p className="text-muted-foreground font-bold mt-2">جدار الحماية ومراقبة محاولات الاختراق</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-amber-500">حماية Rate Limiting نشطة</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="ابحث عن عميل بالاسم أو رقم الهاتف..." 
                className="pr-11 h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white placeholder:text-muted-foreground/30"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-12 font-bold shadow-lg shadow-primary/20 flex gap-2">
                  <Plus className="size-5" />
                  إضافة عميل جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] font-arabic bg-[#0c0c0c] border-white/10 text-white" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-white text-right">إضافة عميل جديد</DialogTitle>
                  <DialogDescription className="text-right text-muted-foreground">أدخل بيانات العميل والطلب الحالي لتسجيله في النظام.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-right font-bold">اسم العميل</Label>
                    <Input 
                      id="name" 
                      placeholder="أدخل اسم العميل" 
                      className="text-right font-bold bg-white/5 border-white/10"
                      value={newClient.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({...newClient, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-right font-bold">رقم الهاتف</Label>
                    <Input 
                      id="phone" 
                      placeholder="01xxxxxxxxx" 
                      className="text-right font-bold bg-white/5 border-white/10"
                      value={newClient.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({...newClient, phone: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="product" className="text-right font-bold">الطلب (المنتج/الخدمة)</Label>
                    <Input 
                      id="product" 
                      placeholder="ماذا طلب العميل؟" 
                      className="text-right font-bold bg-white/5 border-white/10"
                      value={newClient.productName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({...newClient, productName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="paid" className="text-right font-bold">دفع كام؟</Label>
                      <Input 
                        id="paid" 
                        type="number"
                        placeholder="0.00" 
                        className="text-right font-bold bg-white/5 border-white/10"
                        value={newClient.paidAmount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({...newClient, paidAmount: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="remaining" className="text-right font-bold">باقي كام؟</Label>
                      <Input 
                        id="remaining" 
                        type="number"
                        placeholder="0.00" 
                        className="text-right font-bold bg-white/5 border-white/10"
                        value={newClient.remainingAmount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({...newClient, remainingAmount: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddClientOpen(false)} className="font-bold border-white/10 bg-white/5 text-white hover:bg-white/10">إلغاء</Button>
                  <Button onClick={handleAddClient} className="bg-primary text-primary-foreground font-bold">حفظ العميل</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-none shadow-sm overflow-hidden bg-white/5 backdrop-blur-md border border-white/10">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10">
                    <TableHead className="text-right font-black text-muted-foreground uppercase tracking-widest text-[10px]">العميل</TableHead>
                    <TableHead className="text-right font-black text-muted-foreground uppercase tracking-widest text-[10px]">رقم الهاتف</TableHead>
                    <TableHead className="text-right font-black text-muted-foreground uppercase tracking-widest text-[10px]">آخر طلب</TableHead>
                    <TableHead className="text-right font-black text-muted-foreground uppercase tracking-widest text-[10px]">المدفوع</TableHead>
                    <TableHead className="text-right font-black text-muted-foreground uppercase tracking-widest text-[10px]">المتبقي</TableHead>
                    <TableHead className="text-left font-black text-muted-foreground uppercase tracking-widest text-[10px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredClients.map((client) => (
                      <motion.tr 
                        key={client.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`group hover:bg-white/5 border-white/5 transition-colors cursor-pointer ${selectedClient?.id === client.id ? 'bg-primary/10' : ''}`}
                        onClick={() => setSelectedClient(client)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs border border-primary/20">
                              {client.name[0]}
                            </div>
                            <p className="font-black text-white text-sm">{client.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-muted-foreground text-sm">{client.phone}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-slate-200 text-sm">
                            {client.orders && client.orders.length > 0 ? client.orders[0]?.productName : 'لا يوجد'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-black text-emerald-500 text-sm">{client.totalPaid.toLocaleString()} ج.م</p>
                        </TableCell>
                        <TableCell>
                          <p className={`font-black text-sm ${client.totalDebt > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {client.totalDebt.toLocaleString()} ج.م
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5">
                              <ExternalLink className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </Card>

        {/* Client Detail View */}
        <div className="space-y-6">
          {selectedClient ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="border-none shadow-sm bg-white/5 border border-white/10 overflow-hidden">
                <CardHeader className="bg-white/5 pb-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20">
                        {selectedClient.name[0]}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-black text-white">{selectedClient.name}</CardTitle>
                        <CardDescription className="font-bold flex items-center gap-1 text-muted-foreground">
                          <Clock className="size-3" />
                          آخر نشاط: {new Date(selectedClient.lastActivity).toLocaleDateString('ar-EG')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handlePrint}>
                        <Printer className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10">
                        <MoreVertical className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/10">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">مدفوع</p>
                      <p className="text-xl font-black text-emerald-500">{selectedClient.totalPaid.toLocaleString()} ج.م</p>
                    </div>
                    <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/10">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">مديونية</p>
                      <p className="text-xl font-black text-red-500">{selectedClient.totalDebt.toLocaleString()} ج.م</p>
                    </div>
                  </div>

                  {/* Visual Progress Bar for Debt/Paid */}
                  <div className="mb-8 space-y-4">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-emerald-500">تحصيل {Math.round((selectedClient.totalPaid / (selectedClient.totalPaid + selectedClient.totalDebt || 1)) * 100)}%</span>
                      <span className="text-red-500">ديون {Math.round((selectedClient.totalDebt / (selectedClient.totalPaid + selectedClient.totalDebt || 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-red-500/10 rounded-full overflow-hidden flex border border-white/5">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${(selectedClient.totalPaid / (selectedClient.totalPaid + selectedClient.totalDebt || 1)) * 100}%` }}
                      />
                    </div>

                    {/* Financial Activity Chart */}
                    <div className="h-40 w-full mt-6 bg-white/5 rounded-2xl p-2 border border-white/10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={selectedClient.transactions?.slice().reverse().map(t => ({
                            date: new Date(t.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
                            amount: t.type === 'payment' ? t.amount : -t.amount,
                            type: t.type
                          })) || []}
                        >
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#E31E24" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#E31E24" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                          <XAxis 
                            dataKey="date" 
                            hide 
                          />
                          <YAxis hide />
                          <RechartsTooltip 
                            contentStyle={{ 
                              borderRadius: '12px', 
                              backgroundColor: '#0c0c0c',
                              border: '1px solid rgba(255,255,255,0.1)', 
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                              fontSize: '10px',
                              direction: 'rtl',
                              color: '#fff'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#E31E24" 
                            fillOpacity={1} 
                            fill="url(#colorAmount)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <Tabs defaultValue="transactions" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl p-1 h-12 mb-6 border border-white/10">
                      <TabsTrigger value="transactions" className="rounded-lg font-black text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Wallet className="size-4 ml-2" />
                        السجل المالي
                      </TabsTrigger>
                      <TabsTrigger value="orders" className="rounded-lg font-black text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Briefcase className="size-4 ml-2" />
                        الطلبات والعمليات
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-white flex items-center gap-2">
                          <DollarSign className="size-4 text-primary" />
                          المعاملات المالية
                        </h4>
                        <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/5 font-bold h-8 px-2">
                              <Plus className="size-4 ml-1" />
                              إضافة عملية
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="font-arabic bg-[#0c0c0c] border-white/10 text-white" dir="rtl">
                            <DialogHeader>
                              <DialogTitle className="text-right font-black">إضافة عملية مالية</DialogTitle>
                              <DialogDescription className="text-right text-muted-foreground">سجل دفعة جديدة أو مديونية للعميل {selectedClient.name}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label className="text-right font-bold">نوع العملية</Label>
                                <Select 
                                  value={newTransaction.type} 
                                  onValueChange={(val: any) => setNewTransaction({...newTransaction, type: val})}
                                >
                                  <SelectTrigger className="text-right font-bold bg-white/5 border-white/10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="font-arabic bg-[#0c0c0c] border-white/10 text-white">
                                    <SelectItem value="payment">دفعة / تحصيل</SelectItem>
                                    <SelectItem value="debt">مديونية / باق حساب</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label className="text-right font-bold">المبلغ</Label>
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
                                  className="text-right font-bold bg-white/5 border-white/10"
                                  value={newTransaction.amount}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTransaction({...newTransaction, amount: e.target.value})}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label className="text-right font-bold">الوصف / التفاصيل</Label>
                                <Input 
                                  placeholder="مثال: دفعة تحت الحساب للوحة فليكس" 
                                  className="text-right font-bold bg-white/5 border-white/10"
                                  value={newTransaction.description}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTransaction({...newTransaction, description: e.target.value})}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleAddTransaction} className="w-full bg-primary font-bold">تأكيد العملية</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {selectedClient.transactions?.length > 0 ? (
                          selectedClient.transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`size-8 rounded-lg flex items-center justify-center ${
                                  t.type === 'payment' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  {t.type === 'payment' ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white">{t.description}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                                </div>
                              </div>
                              <p className={`text-sm font-black ${t.type === 'payment' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {t.type === 'payment' ? '+' : '-'}{t.amount.toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                            <Wallet className="size-8 text-white/10 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground font-bold">لا توجد عمليات مالية مسجلة</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-white flex items-center gap-2">
                          <Package className="size-4 text-primary" />
                          سجل العمليات والطلبات
                        </h4>
                        <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/5 font-bold h-8 px-2">
                              <Plus className="size-4 ml-1" />
                              إضافة طلب جديد
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="font-arabic bg-[#0c0c0c] border-white/10 text-white" dir="rtl">
                            <DialogHeader>
                              <DialogTitle className="text-right font-black">إضافة طلب للعميل</DialogTitle>
                              <DialogDescription className="text-right text-muted-foreground">سجل تفاصيل الطلب الجديد للعميل {selectedClient.name}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label className="text-right font-bold">اسم المنتج / الخدمة</Label>
                                <Input 
                                  placeholder="مثال: لوحة فليكس 3*2" 
                                  className="text-right font-bold bg-white/5 border-white/10"
                                  value={newOrder.productName}
                                  onChange={(e) => setNewOrder({...newOrder, productName: e.target.value})}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label className="text-right font-bold">الكمية</Label>
                                  <Input 
                                    placeholder="1" 
                                    className="text-right font-bold bg-white/5 border-white/10"
                                    value={newOrder.quantity}
                                    onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label className="text-right font-bold">المقاس</Label>
                                  <Input 
                                    placeholder="3*2 متر" 
                                    className="text-right font-bold bg-white/5 border-white/10"
                                    value={newOrder.size}
                                    onChange={(e) => setNewOrder({...newOrder, size: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label className="text-right font-bold">السعر المقدر</Label>
                                <Input 
                                  type="number"
                                  placeholder="0.00" 
                                  className="text-right font-bold bg-white/5 border-white/10"
                                  value={newOrder.estimatedPrice}
                                  onChange={(e) => setNewOrder({...newOrder, estimatedPrice: e.target.value})}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label className="text-right font-bold">تفاصيل إضافية</Label>
                                <Textarea 
                                  placeholder="أي تفاصيل تخص التنفيذ..." 
                                  className="text-right font-bold bg-white/5 border-white/10"
                                  value={newOrder.details}
                                  onChange={(e) => setNewOrder({...newOrder, details: e.target.value})}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleAddOrder} className="w-full bg-primary font-bold">تأكيد الطلب</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {selectedClient.orders?.length > 0 ? (
                          selectedClient.orders.map((o) => (
                            <div key={o.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                    <Briefcase className="size-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-white">{o.productName}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold">{o.categoryName}</p>
                                  </div>
                                </div>
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-bold">{o.status}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                <div>
                                  <p className="text-[10px] text-muted-foreground font-bold">الكمية/المقاس</p>
                                  <p className="text-xs font-black text-slate-200">{o.quantity || o.size || 'N/A'}</p>
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] text-muted-foreground font-bold">القيمة التقديرية</p>
                                  <p className="text-xs font-black text-primary">{o.estimatedPrice?.toLocaleString()} ج.م</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                            <Briefcase className="size-8 text-white/10 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground font-bold">لا توجد طلبات مسجلة لهذا العميل</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button 
                    onClick={handlePrint}
                    className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12 flex gap-2 shadow-xl shadow-primary/20"
                  >
                    <Download className="size-4" />
                    تحميل كشف حساب (PDF)
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10 text-center backdrop-blur-md">
              <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Users className="size-10 text-white/10" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">اختر عميلاً للمتابعة</h3>
              <p className="text-sm text-muted-foreground font-bold max-w-[200px]">قم باختيار عميل من القائمة لعرض تفاصيله المالية وإدارة معاملاته</p>
            </div>
          )}
        </div>
      </TabsContent>
      </Tabs>
    </div>
  )
}
