'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, HelpCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { toast } from 'sonner'

export default function FAQsManager() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/faqs')
      if (res.ok) setFaqs(await res.json())
    } catch {
      toast.error('فشل تحميل الأسئلة')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await fetchFaqs()
    }
    init()
  }, [])

  const handleAdd = () => {
    setFaqs([...faqs, { question: '', answer: '', isActive: true, sortOrder: faqs.length }])
  }

  const handleSave = async (index: number) => {
    setSaving(true)
    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqs[index])
      })
      if (res.ok) {
        toast.success('تم الحفظ بنجاح')
        fetchFaqs()
      } else {
        const data = await res.json()
        toast.error(data.error || 'فشل الحفظ')
      }
    } catch (err) {
      console.error('Save error:', err)
      toast.error('خطأ في الاتصال')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return
    try {
      const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم الحذف')
        fetchFaqs()
      }
    } catch {
      toast.error('فشل الحذف')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
        <div>
          <h2 className="text-3xl font-black text-white">إدارة الأسئلة الشائعة</h2>
          <p className="text-slate-500 font-bold">أضف أو عدل الأسئلة التي تظهر في الصفحة الرئيسية</p>
        </div>
        <Button onClick={handleAdd} className="h-14 rounded-2xl font-black px-8">
          <Plus className="ml-2 size-5" />
          سؤال جديد
        </Button>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <Card key={index} className="rounded-[2.5rem] border-white/5 bg-white/5 overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-500 uppercase mr-2">السؤال</Label>
                <Input 
                  value={faq.question} 
                  onChange={(e) => {
                    const newFaqs = [...faqs]
                    newFaqs[index].question = e.target.value
                    setFaqs(newFaqs)
                  }}
                  className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-500 uppercase mr-2">الإجابة</Label>
                <textarea 
                  value={faq.answer} 
                  onChange={(e) => {
                    const newFaqs = [...faqs]
                    newFaqs[index].answer = e.target.value
                    setFaqs(newFaqs)
                  }}
                  className="w-full min-h-[100px] p-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex justify-end gap-4">
                {faq.id && (
                  <Button variant="destructive" onClick={() => handleDelete(faq.id)} className="rounded-xl h-12 px-6">
                    <Trash2 className="size-5" />
                  </Button>
                )}
                <Button onClick={() => handleSave(index)} disabled={saving} className="rounded-xl h-12 px-8 font-black">
                  {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="ml-2 size-5" />}
                  حفظ
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
