'use client'

import { useState, useEffect } from 'react'
import { 
  Trash2, 
  Search, 
  Inbox
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
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
      }
    } catch (error) {
      toast.error('خطأ في التحديث')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('حذف الرسالة؟')) return
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id))
        if (selectedMessage?.id === id) setSelectedMessage(null)
        toast.success('تم الحذف')
      }
    } catch (error) {
      toast.error('خطأ في الحذف')
    }
  }

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.message.toLowerCase().includes(search.toLowerCase()) ||
                          m.phone.includes(search)
    const matchesFilter = filter === 'all' || m.status === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-6 animate-spin border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="h-[600px] flex gap-4 max-w-6xl mx-auto px-2" dir="rtl">
      
      {/* Sidebar: Message List */}
      <div className="w-80 flex flex-col bg-white/5 rounded-xl border border-white/5 overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">الرسائل</h2>
            <Badge className="bg-primary/20 text-primary border-none rounded-md px-2 py-0.5 font-black text-[8px]">
              {messages.filter(m => m.status === 'unread').length} جديدة
            </Badge>
          </div>
          
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="pr-9 bg-black/40 border-white/10 h-8 text-[10px] font-bold rounded-lg"
            />
          </div>

          <div className="flex gap-1">
            {['all', 'unread'].map((f) => (
              <Button
                key={f}
                variant="ghost"
                size="sm"
                onClick={() => setFilter(f as any)}
                className={`flex-1 rounded-md h-7 text-[8px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {f === 'all' ? 'الكل' : 'جديد'}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg)
                  if (msg.status === 'unread') handleUpdateStatus(msg.id, 'read')
                }}
                className={`w-full p-3 rounded-lg transition-all text-right relative border ${
                  selectedMessage?.id === msg.id 
                    ? 'bg-primary border-primary' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-black text-xs ${selectedMessage?.id === msg.id ? 'text-white' : 'text-slate-200'}`}>{msg.name}</h4>
                  <span className={`text-[7px] font-bold ${selectedMessage?.id === msg.id ? 'text-primary-foreground/60' : 'text-slate-500'}`}>
                    {format(new Date(msg.createdAt), 'hh:mm a', { locale: ar })}
                  </span>
                </div>
                <p className={`text-[9px] font-bold line-clamp-1 ${selectedMessage?.id === msg.id ? 'text-primary-foreground/80' : 'text-slate-500'}`}>
                  {msg.subject || msg.message}
                </p>
                {msg.status === 'unread' && (
                  <div className="absolute top-2 left-2 size-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content: Message Detail */}
      <div className="flex-1 flex flex-col bg-white/5 rounded-xl border border-white/5 overflow-hidden backdrop-blur-md">
        {selectedMessage ? (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                  {selectedMessage.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{selectedMessage.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500" dir="ltr">{selectedMessage.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleDelete(selectedMessage.id)} className="size-8 p-0 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <h4 className="text-primary font-black text-[10px] uppercase tracking-widest mb-3">محتوى الرسالة</h4>
                <p className="text-white text-sm font-bold leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-4 text-[10px] font-black text-slate-500">
                <span>تاريخ الاستلام: {format(new Date(selectedMessage.createdAt), 'PPPP', { locale: ar })}</span>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Inbox className="size-10 opacity-20" />
            <p className="text-xs font-black">اختر رسالة لعرض تفاصيلها</p>
          </div>
        )}
      </div>
    </div>
  )
}
