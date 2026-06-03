'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Zap, 
  Share2, 
  Target,
  Loader2
} from 'lucide-react'
import { Card } from '../ui/card'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import MarketingAIChat from './marketing-ai-chat'
import { toast } from 'sonner'

export default function MarketingManager() {
  const [loading, setLoading] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, configRes] = await Promise.all([
          fetch('/api/marketing/stats'),
          fetch('/api/marketing/config')
        ])
        
        if (statsRes.ok) setStats(await statsRes.json())
        if (configRes.ok) {
          const conf = await configRes.json()
          setAiEnabled(conf.isEnabled)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleToggleAi = async (checked: boolean) => {
    setAiEnabled(checked)
    try {
      await fetch('/api/marketing/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: checked })
      })
      toast.success(checked ? 'تم تفعيل الذكاء الاصطناعي' : 'تم إيقاف الأتمتة')
    } catch (error) {
      toast.error('فشل تحديث الإعدادات')
    }
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
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 p-3 rounded-xl border border-white/5 mb-4 backdrop-blur-md">
          <TabsList className="bg-black/40 border border-white/10 p-1 h-10 rounded-lg">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5 text-xs font-black transition-all">نظرة عامة</TabsTrigger>
            <TabsTrigger value="ai" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5 text-xs font-black transition-all">فريق AI</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={aiEnabled} onCheckedChange={handleToggleAi} className="data-[state=checked]:bg-primary" />
              <Label className="text-[10px] font-black text-white uppercase tracking-widest">أتمتة ذكية</Label>
            </div>
          </div>
        </div>

        <TabsContent value="overview" className="mt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Users className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">المتابعون</span>
              </div>
              <p className="text-xl font-black text-white">{stats?.totalFollowers || 0}</p>
            </Card>
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-pink-500 mb-1">
                <Zap className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">التفاعل</span>
              </div>
              <p className="text-xl font-black text-white">{stats?.totalEngagement || 0}</p>
            </Card>
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <Target className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">التحويل</span>
              </div>
              <p className="text-xl font-black text-white">{stats?.conversionRate || 0}%</p>
            </Card>
            <Card className="bg-white/5 border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <Share2 className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">المنشورات</span>
              </div>
              <p className="text-xl font-black text-white">{stats?.totalPosts || 0}</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-0">
          <MarketingAIChat />
        </TabsContent>
      </Tabs>
    </div>
  )
}
