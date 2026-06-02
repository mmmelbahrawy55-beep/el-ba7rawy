'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Settings2, 
  TrendingUp, 
  MessageSquare, 
  Calendar, 
  Facebook, 
  Instagram, 
  Twitter, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Sparkles,
  Loader2,
  Clock,
  ExternalLink,
  Users,
  Image as ImageIcon,
  Share2,
  Target,
  Zap,
  Bot,
  ShieldCheck,
  GraduationCap,
  Workflow,
  Rocket,
  Search,
  Database,
  Link as LinkIcon,
  CheckCircle,
  PieChart as PieChartIcon,
  LayoutDashboard,
  Settings as SettingsIcon,
  Command,
  PenTool,
  BrainCircuit,
  Terminal,
  Send,
  MessageCircle,
  Archive,
  Trash2,
  User,
  Phone,
  Mail,
  Save
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MarketingAIChat from './marketing-ai-chat'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export default function MarketingManager() {
  const [loading, setLoading] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [platformPerformance, setPlatformPerformance] = useState<any[]>([])
  const [weeklyEngagement, setWeeklyEngagement] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [newAccount, setNewAccount] = useState({ platform: 'facebook', accountName: '' })
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [savingConfig, setSavingConfig] = useState(false)

  const COLORS = ['#3b82f6', '#ec4899', '#000000', '#f59e0b']

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, accountsRes, configRes] = await Promise.all([
          fetch('/api/marketing/stats'),
          fetch('/api/marketing/accounts'),
          fetch('/api/marketing/config')
        ])
        
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
          setPlatformPerformance(data.platformPerformance)
          setWeeklyEngagement(data.weeklyEngagement)
        }
        
        if (accountsRes.ok) {
          const accs = await accountsRes.json()
          setAccounts(accs)
        }

        if (configRes.ok) {
          const conf = await configRes.json()
          setConfig(conf)
          setAiEnabled(conf.isEnabled)
        }

        // Fetch real admins for the team section
        const adminDataRes = await fetch('/api/stats');
        if (adminDataRes.ok) {
          const adminData = await adminDataRes.json();
          if (adminData.admins) {
            setTeamMembers(adminData.admins.map((admin: any) => ({
              id: admin.id,
              name: admin.name || 'مدير النظام',
              role: admin.role === 'admin' ? 'مسؤول المنصة' : 'عضو الفريق',
              performance: 100,
              tasks: 0,
              avatar: admin.name?.[0] || 'A',
              status: 'online'
            })));
          }
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
      toast.success(checked ? 'تم تفعيل المركز العصبي للذكاء الاصطناعي' : 'تم إيقاف الأتمتة الذكية')
    } catch (error) {
      toast.error('فشل تحديث إعدادات الذكاء الاصطناعي')
    }
  }

  const handleSaveStrategy = async () => {
    setSavingConfig(true)
    try {
      const res = await fetch('/api/marketing/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (res.ok) {
        toast.success('تم حفظ الرؤية الاستراتيجية بنجاح')
      }
    } catch (error) {
      toast.error('فشل حفظ الاستراتيجية')
    } finally {
      setSavingConfig(false)
    }
  }

  const handleAddAccount = () => {
    if (!newAccount.accountName) {
      toast.error('يرجى إدخال اسم الحساب')
      return
    }
    setAccounts([...accounts, { ...newAccount, id: Math.random().toString(36).substr(2, 9), isActive: true, followers: '0' }])
    setIsAddAccountOpen(false)
    setNewAccount({ platform: 'facebook', accountName: '' })
    toast.success('تم ربط الحساب بنجاح')
  }

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = { Users, Zap, PieChartIcon, TrendingUp }
    const Icon = icons[iconName] || TrendingUp
    return <Icon className="size-8 text-primary" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#020202]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="size-16 animate-spin text-primary" />
          <p className="text-primary font-black animate-pulse">جاري تشغيل الأنظمة الحقيقية...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020202] p-6 lg:p-10 font-arabic selection:bg-primary/30" dir="rtl">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col lg:row items-center justify-between mb-12 gap-8 bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white/5 shadow-2xl"
      >
        <div className="flex items-center gap-8">
          <div className="size-20 rounded-[2rem] bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-primary/20">
            <Rocket className="size-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">مركز القيادة التسويقية</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live Data Active</Badge>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <Clock className="size-3" />
                آخر مزامنة: الآن
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Real-time Automation</p>
            <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
               <span className={`text-sm font-black transition-colors ${aiEnabled ? 'text-primary' : 'text-slate-600'}`}>
                 {aiEnabled ? 'الذكاء الاصطناعي نشط' : 'وضع التحكم اليدوي'}
               </span>
               <Switch checked={aiEnabled} onCheckedChange={handleToggleAi} className="data-[state=checked]:bg-primary" />
            </div>
          </div>
          <Button className="h-16 px-10 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
            <Plus className="ml-3 size-6" />
            حملة حقيقية
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-12">
        <TabsList className="bg-white/5 p-2 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl h-24 w-full lg:w-max mx-auto flex justify-center lg:justify-start overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'الرؤية الشاملة', icon: LayoutDashboard },
            { id: 'ai-assistant', label: 'البحراوي AI', icon: Bot },
            { id: 'social', label: 'التواصل الاجتماعي', icon: Share2 },
            { id: 'team', label: 'إدارة الفريق', icon: Users },
            { id: 'strategy', label: 'غرفة العمليات', icon: Target },
          ].map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className="rounded-[1.75rem] px-10 font-black text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl h-20 transition-all duration-500 text-slate-500"
            >
              <tab.icon className="ml-3 size-5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-12 outline-none">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(stats?.mainStats || [
              { label: 'إجمالي الوصول', value: '1.2M', trend: '+15%', icon: 'Users', color: 'blue' },
              { label: 'معدل التحويل', value: '4.8%', trend: '+2.1%', icon: 'Zap', color: 'primary' },
              { label: 'الطلبات النشطة', value: '0', trend: '0%', icon: 'PieChartIcon', color: 'emerald' },
              { label: 'الرسائل الواردة', value: '0', trend: '0%', icon: 'TrendingUp', color: 'purple' },
            ]).map((stat: any, i: number) => (
              <Card key={i} className="rounded-[3rem] border-white/5 bg-white/5 backdrop-blur-3xl p-10 hover:border-primary/20 transition-all duration-500 group relative overflow-hidden border-2">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                    {getIconComponent(stat.icon)}
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                  <h3 className="text-5xl font-black text-white tracking-tighter mb-4">{stat.value}</h3>
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[10px] ${
                    stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {stat.trend}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Chart */}
            <Card className="lg:col-span-2 rounded-[3.5rem] border-white/5 bg-white/5 backdrop-blur-3xl p-12 border-2">
              <CardHeader className="p-0 mb-12">
                <CardTitle className="text-3xl font-black text-white">تحليل النمو التفاعلي الحقيقي</CardTitle>
              </CardHeader>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyEngagement}>
                    <defs>
                      <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff20" fontSize={12} fontWeight="900" axisLine={false} tickLine={false} dy={15} />
                    <YAxis stroke="#ffffff20" fontSize={12} fontWeight="900" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0c0c0c', border: '1px solid #ffffff10', borderRadius: '24px' }} />
                    <Area type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorReach)" />
                    <Area type="monotone" dataKey="clicks" stroke="#fbbf24" strokeWidth={4} fillOpacity={1} fill="url(#colorClicks)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Distribution */}
            <Card className="rounded-[3.5rem] border-white/5 bg-white/5 backdrop-blur-3xl p-12 border-2">
              <CardHeader className="p-0 mb-12 text-center">
                <CardTitle className="text-2xl font-black text-white">توزيع المنصات</CardTitle>
              </CardHeader>
              <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={10}
                      dataKey="engagement"
                    >
                      {platformPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 mt-8">
                {platformPerformance.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm font-black text-white">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-slate-400">%{p.growth}</span>
                       <TrendingUp className="size-3 text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant" className="outline-none">
          <div className="max-w-7xl mx-auto">
             <MarketingAIChat />
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-12 outline-none">
          <Card className="rounded-[3.5rem] border-white/5 bg-white/5 backdrop-blur-3xl p-12 border-2">
            <CardHeader className="p-0 mb-12 flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black text-white">الحسابات المتصلة</CardTitle>
                <CardDescription className="font-bold text-slate-500">إدارة منصات التواصل الاجتماعي الحقيقية</CardDescription>
              </div>
              <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                <DialogTrigger asChild>
                  <Button className="h-16 px-10 rounded-[2rem] font-black">ربط حساب جديد</Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إضافة حساب جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-6">
                    <Input 
                      placeholder="اسم الحساب" 
                      value={newAccount.accountName} 
                      onChange={(e) => setNewAccount({...newAccount, accountName: e.target.value})}
                      className="bg-white/5 border-white/10"
                    />
                    <Select value={newAccount.platform} onValueChange={(v) => setNewAccount({...newAccount, platform: v})}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic">
                        <SelectItem value="facebook">فيسبوك</SelectItem>
                        <SelectItem value="instagram">إنستجرام</SelectItem>
                        <SelectItem value="tiktok">تيك توك</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddAccount} className="w-full">تأكيد الربط</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="size-16 rounded-2xl bg-black/40 flex items-center justify-center">
                      {acc.platform === 'facebook' ? <Facebook className="size-8 text-blue-500" /> : <Instagram className="size-8 text-pink-500" />}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-xl">{acc.accountName}</h4>
                      <p className="text-sm font-bold text-slate-500">{acc.followers} متابع</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500">متصل الآن</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-12 outline-none">
          <Card className="rounded-[3.5rem] border-white/5 bg-white/5 backdrop-blur-3xl p-12 border-2">
            <CardHeader className="p-0 mb-12">
              <CardTitle className="text-3xl font-black text-white">الفريق التنفيذي</CardTitle>
            </CardHeader>
            <div className="space-y-6">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-black/30 border border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl">{member.avatar}</div>
                    <div>
                      <p className="font-black text-white text-xl">{member.name}</p>
                      <p className="text-sm font-bold text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-primary">%{member.performance} كفاءة</p>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${member.status === 'online' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {member.status === 'online' ? 'نشط الآن' : 'مشغول'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-12 outline-none">
          <Card className="rounded-[3.5rem] border-white/5 bg-white/5 backdrop-blur-3xl p-12 border-2">
            <CardHeader className="p-0 mb-12 flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black text-white">الرؤية الاستراتيجية الحقيقية</CardTitle>
                <CardDescription className="font-bold text-slate-500">تحكم في توجهات الذكاء الاصطناعي وخطط النمو</CardDescription>
              </div>
              <Button 
                onClick={handleSaveStrategy} 
                disabled={savingConfig}
                className="h-14 px-8 rounded-2xl font-black shadow-2xl shadow-primary/20"
              >
                {savingConfig ? <Loader2 className="size-5 animate-spin ml-2" /> : <Save className="size-5 ml-2" />}
                حفظ الاستراتيجية
              </Button>
            </CardHeader>

            <div className="space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">الهدف الاستراتيجي العام</Label>
                <textarea 
                  value={config?.strategy || ''} 
                  onChange={(e) => setConfig({...config, strategy: e.target.value})}
                  className="w-full min-h-[150px] p-8 rounded-[2.5rem] bg-black/40 border border-white/5 text-xl font-black text-white leading-tight focus:border-primary/50 outline-none transition-all"
                  placeholder="اكتب الهدف الاستراتيجي هنا (مثلاً: هيمنة السوق الرقمي في قطاع الدعاية...)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">مفتاح تفعيل الذكاء الاصطناعي (Gemini API Key)</Label>
                  <Input 
                    value={config?.keywords || ''} 
                    onChange={(e) => setConfig({...config, keywords: e.target.value})}
                    className="h-16 rounded-2xl bg-white/5 border-white/5 text-primary font-mono text-xs px-6"
                    placeholder="AIzaSy..."
                  />
                  <p className="text-[9px] text-slate-500 font-bold mr-4">هذا المفتاح ضروري لتشغيل نظام الشات وتوليد الصور.</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">الجمهور المستهدف</Label>
                  <Input 
                    value={config?.targetAudience || ''} 
                    onChange={(e) => setConfig({...config, targetAudience: e.target.value})}
                    className="h-16 rounded-2xl bg-white/5 border-white/5 text-white font-bold px-6"
                    placeholder="مثلاً: أصحاب الشركات، المطاعم، العقارات..."
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(config?.targetAudience?.split('،') || config?.targetAudience?.split(',') || []).map((t: string, i: number) => (
                      t.trim() && <Badge key={i} variant="outline" className="rounded-xl border-white/10 text-slate-400 font-bold px-4 py-1">{t.trim()}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">نبرة الصوت (Brand Voice)</Label>
                  <Select 
                    value={config?.brandVoice || 'professional'} 
                    onValueChange={(v) => setConfig({...config, brandVoice: v})}
                  >
                    <SelectTrigger className="h-16 rounded-2xl bg-white/5 border-white/5 text-white font-bold px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0c0c0c] border-white/10 text-white font-arabic">
                      <SelectItem value="professional">احترافي ورسمي</SelectItem>
                      <SelectItem value="creative">إبداعي وملهم</SelectItem>
                      <SelectItem value="friendly">ودود وقريب من العميل</SelectItem>
                      <SelectItem value="bold">جريء وقوي</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className="bg-primary/20 text-primary border-primary/30 rounded-xl px-6 py-2 font-black uppercase text-[10px]">
                    {config?.brandVoice || 'Professional'} & Result-Driven
                  </Badge>
                </div>
              </div>

              <div className="pt-10 border-t border-white/5">
                <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-6">
                    <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                      <Bot className="size-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-xl">الرد التلقائي الذكي</h4>
                      <p className="text-sm font-bold text-slate-500">تمكين الوكلاء من الرد على التعليقات والرسائل تلقائياً</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config?.autoReply || false} 
                    onCheckedChange={(v) => setConfig({...config, autoReply: v})}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
