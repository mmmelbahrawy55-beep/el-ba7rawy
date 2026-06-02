'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  User, 
  Phone, 
  MessageSquare,
  Archive,
  Inbox
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Message {
  id: string
  name: string
  phone: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'archived'
  createdAt: string
}

export default function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages')
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      toast.error('فشل في تحميل الرسائل')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, status: status as any } : m))
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status: status as any })
        }
        toast.success('تم تحديث حالة الرسالة')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id))
        if (selectedMessage?.id === id) setSelectedMessage(null)
        toast.success('تم حذف الرسالة بنجاح')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.message.toLowerCase().includes(search.toLowerCase()) ||
                          m.phone.includes(search)
    const matchesFilter = filter === 'all' || m.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="h-[800px] flex gap-8 bg-[#020202] rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl font-arabic p-4" dir="rtl">
      
      {/* Sidebar: Message List */}
      <div className="w-1/3 flex flex-col bg-white/[0.02] rounded-[3rem] border border-white/5 overflow-hidden backdrop-blur-3xl">
        <div className="p-8 border-b border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tighter">صندوق الوارد</h2>
            <Badge className="bg-primary/20 text-primary border-primary/30 rounded-lg px-3 py-1 font-black text-[10px]">
              {messages.filter(m => m.status === 'unread').length} جديدة
            </Badge>
          </div>
          
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الرسائل..."
              className="pr-12 bg-black/40 border-white/5 rounded-2xl h-12 text-sm font-bold focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'unread', 'archived'].map((f) => (
              <Button
                key={f}
                variant="ghost"
                onClick={() => setFilter(f as any)}
                className={`flex-1 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {f === 'all' ? 'الكل' : f === 'unread' ? 'غير مقروء' : 'الأرشيف'}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredMessages.map((msg) => (
                <motion.button
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    setSelectedMessage(msg)
                    if (msg.status === 'unread') handleUpdateStatus(msg.id, 'read')
                  }}
                  className={`w-full p-6 rounded-[2rem] transition-all duration-500 text-right group relative overflow-hidden border ${
                    selectedMessage?.id === msg.id 
                      ? 'bg-primary border-primary shadow-2xl shadow-primary/20' 
                      : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-xl flex items-center justify-center font-black text-sm shadow-2xl ${
                        selectedMessage?.id === msg.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        {msg.name.charAt(0)}
                      </div>
                      <h4 className={`font-black text-sm ${selectedMessage?.id === msg.id ? 'text-white' : 'text-slate-200'}`}>{msg.name}</h4>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${selectedMessage?.id === msg.id ? 'text-primary-foreground/60' : 'text-slate-500'}`}>
                      {format(new Date(msg.createdAt), 'hh:mm a', { locale: ar })}
                    </span>
                  </div>
                  <p className={`text-xs font-bold line-clamp-1 transition-colors ${selectedMessage?.id === msg.id ? 'text-primary-foreground/80' : 'text-slate-500'}`}>
                    {msg.subject || msg.message}
                  </p>
                  {msg.status === 'unread' && (
                    <div className="absolute top-4 left-4 size-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content: Message Detail */}
      <div className="flex-1 flex flex-col bg-white/[0.01] rounded-[3rem] border border-white/5 relative overflow-hidden">
        {selectedMessage ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Detail Header */}
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-2xl">
              <div className="flex items-center gap-6">
                <div className="size-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
                  <User className="size-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter">{selectedMessage.name}</h3>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-sm font-black text-slate-500" dir="ltr">{selectedMessage.phone}</span>
                    <div className="size-1 bg-white/10 rounded-full" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Customer ID: #{selectedMessage.id.slice(-4)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="size-12 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5"
                   onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                 >
                   <Archive className="size-6" />
                 </Button>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="size-12 rounded-2xl text-red-500 hover:bg-red-500/10"
                   onClick={() => handleDelete(selectedMessage.id)}
                 >
                   <Trash2 className="size-6" />
                 </Button>
              </div>
            </div>

            {/* Detail Content */}
            <ScrollArea className="flex-1">
              <div className="p-12 space-y-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">الموضوع</p>
                  <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
                    {selectedMessage.subject || 'رسالة تواصل عامة من العميل'}
                  </h1>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-inner">
                  <p className="text-xl font-bold text-slate-300 leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="flex items-center gap-10 py-6 border-y border-white/5">
                   <div className="flex items-center gap-4">
                      <Clock className="size-5 text-primary" />
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">تاريخ الاستلام</p>
                        <p className="text-sm font-black text-white">{format(new Date(selectedMessage.createdAt), 'dd MMMM yyyy - hh:mm a', { locale: ar })}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <Phone className="size-5 text-primary" />
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">رقم التواصل</p>
                        <p className="text-sm font-black text-white" dir="ltr">{selectedMessage.phone}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-6 pt-6">
                   <h4 className="text-lg font-black text-white">إجراءات سريعة</h4>
                   <div className="grid grid-cols-2 gap-6">
                      <Button className="h-16 rounded-2xl font-black text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20" asChild>
                         <a href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                           <MessageCircle className="ml-3 size-5" />
                           الرد عبر واتساب
                         </a>
                      </Button>
                      <Button variant="outline" className="h-16 rounded-2xl font-black text-base border-white/10 text-white hover:bg-white/5" asChild>
                         <a href={`tel:${selectedMessage.phone}`}>
                           <Phone className="ml-3 size-5" />
                           اتصال هاتفي
                         </a>
                      </Button>
                   </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 space-y-8">
             <div className="size-32 rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center">
                <Mail className="size-16 text-primary" />
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tighter">اختر رسالة لعرضها</h3>
                <p className="text-sm font-bold text-slate-500">يمكنك إدارة جميع تواصلات العملاء من هذا القسم</p>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
