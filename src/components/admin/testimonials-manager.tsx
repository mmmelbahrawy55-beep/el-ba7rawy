'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials')
      if (res.ok) setTestimonials(await res.json())
    } catch {
      toast.error('فشل تحميل آراء العملاء')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setTestimonials([...testimonials, { name: '', role: '', content: '', avatar: '', isActive: true }])
  }

  const handleSave = async (index: number) => {
    setSaving(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonials[index])
      })
      if (res.ok) {
        toast.success('تم الحفظ بنجاح')
        fetchTestimonials()
      }
    } catch {
      toast.error('فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم الحذف')
        fetchTestimonials()
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
          <h2 className="text-3xl font-black text-white">إدارة آراء العملاء</h2>
          <p className="text-slate-500 font-bold">إدارة الشهادات والآراء التي تظهر في الموقع</p>
        </div>
        <Button onClick={handleAdd} className="h-14 rounded-2xl font-black px-8">
          <Plus className="ml-2 size-5" />
          رأي جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {testimonials.map((t, index) => (
          <Card key={index} className="rounded-[2.5rem] border-white/5 bg-white/5 overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-500 uppercase mr-2">اسم العميل</Label>
                  <Input 
                    value={t.name} 
                    onChange={(e) => {
                      const newT = [...testimonials]
                      newT[index].name = e.target.value
                      setTestimonials(newT)
                    }}
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-500 uppercase mr-2">الوظيفة / الشركة</Label>
                  <Input 
                    value={t.role} 
                    onChange={(e) => {
                      const newT = [...testimonials]
                      newT[index].role = e.target.value
                      setTestimonials(newT)
                    }}
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-500 uppercase mr-2">الرأي</Label>
                <textarea 
                  value={t.content} 
                  onChange={(e) => {
                    const newT = [...testimonials]
                    newT[index].content = e.target.value
                    setTestimonials(newT)
                  }}
                  className="w-full min-h-[80px] p-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex justify-end gap-4">
                {t.id && (
                  <Button variant="destructive" onClick={() => handleDelete(t.id)} className="rounded-xl h-12 px-6">
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
