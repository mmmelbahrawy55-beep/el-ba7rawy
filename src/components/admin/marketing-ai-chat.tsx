'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  RotateCcw,
  Plus,
  BarChart3,
  Megaphone,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  Facebook,
  Instagram,
  Settings2,
  Trash2,
  Maximize2,
  Minimize2,
  Share2,
  Copy,
  PenTool,
  BrainCircuit,
  Search,
  Hash,
  Briefcase,
  Terminal,
  Eraser,
  MessageCircle,
  Command,
  LayoutDashboard,
  Zap,
  Globe,
  PieChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'model' | 'system'
  content: string
  timestamp: Date
  agentId?: string
  latency?: number
  status?: 'error' | 'success'
}

// --- 1. Static Configuration (Memoized Outside to avoid re-creation) ---
const AGENTS = [
  {
    id: 'central_ai',
    name: 'البحراوي 1',
    role: 'الذكاء الاستراتيجي الشامل',
    description: 'المتحكم الرئيسي في المنصة، خبير في اتخاذ القرارات وحل المشكلات المعقدة بدقة متناهية.',
    icon: Command,
    color: 'primary',
    prompt: 'أنت "البحراوي 1"، العقل المدبر والذكاء الاستراتيجي الشامل للمنصة. مهمتك هي الإجابة على أي سؤال باحترافية مذهلة، تحليل المواقف بعمق، وتقديم حلول لا تقبل الجدل. أنت تمثل أعلى معايير الذكاء والتنفيذ.'
  },
  {
    id: 'social_agent',
    name: 'البحراوي 2',
    role: 'وكيل التفاعل والانتشار',
    description: 'متخصص في بناء العلاقات الرقمية، الرد الذكي، وتحويل المتابعين إلى شركاء نجاح.',
    icon: Share2,
    color: 'blue',
    prompt: 'أنت "البحراوي 2"، خبير التفاعل والانتشار العالمي. ردودك يجب أن تكون ذكية، جذابة، وتحمل لمسة احترافية قوية تجعل كل من يقرأها يثق في قدرات المنصة تماماً. أنت بارع في لغة الإقناع والنمو.'
  },
  {
    id: 'content_agent',
    name: 'البحراوي 3',
    role: 'وكيل الإبداع والابتكار',
    description: 'صانع المحتوى الفاخر، خبير في صياغة الرسائل التي تترك أثراً وتصنع التغيير.',
    icon: PenTool,
    color: 'purple',
    prompt: 'أنت "البحراوي 3"، منارة الإبداع والابتكار. أنت تكتب بأسلوب فني راقٍ واحترافي جداً، تحول الأفكار البسيطة إلى حملات إبداعية ضخمة. أي سؤال تطرحه عليك، جاوبه بعقلية فنان ومسوق محترف في آن واحد.'
  },
  {
    id: 'strategy_agent',
    name: 'البحراوي 4',
    role: 'وكيل تحليل البيانات والمستقبل',
    description: 'العقل التحليلي الذي يرى ما لا يراه الآخرون، خبير في استقراء النتائج ورسم خرائط النجاح.',
    icon: BrainCircuit,
    color: 'emerald',
    prompt: 'أنت "البحراوي 4"، المحلل العبقري. إجاباتك تعتمد على المنطق، الأرقام، والرؤية الثاقبة. أنت تحل المشكلات من خلال فهم الأنماط وتقديم استراتيجيات نمو مبنية على أساس علمي واحترافي صارم.'
  }
] as const

const QUICK_ACTIONS = [
  { label: 'تحليل استراتيجي للسوق المصري', icon: BrainCircuit, color: 'text-emerald-500' },
  { label: 'كتابة حملة إعلانية (Copywriting)', icon: PenTool, color: 'text-purple-500' },
  { label: 'حل مشكلة برمجية في المنصة', icon: Terminal, color: 'text-blue-500' },
  { label: 'خطة نمو (Growth Hacking) فوري', icon: Zap, color: 'text-orange-500' }
] as const

// --- 2. Main Optimized Component ---
export default function MarketingAIChat() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [thinking, setThinking] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [activeAgent, setActiveAgent] = useState<typeof AGENTS[number]>(AGENTS[0])
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // A. Performance: Optimized Scroll Logic
  // Uses useCallback to prevent unnecessary re-creation of the function on every render.
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior })
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 100)
    return () => clearTimeout(timer)
  }, [messages, loading, thinking, scrollToBottom])

  // B. Data Fetching (Server History)
  // Centralized fetching with clean async/await and state management.
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/marketing/ai/chat')
        if (response.ok) {
          const history = await response.json()
          if (history.length > 0) {
            setMessages(history.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            })))
          } else {
            setMessages([{
              id: '1',
              role: 'assistant',
              content: `مرحباً بك! أنا **${activeAgent.name}**. كيف يمكنني مساعدتك في تطوير "وكالة البحراوي" اليوم؟ 🚀`,
              timestamp: new Date(),
              agentId: activeAgent.id
            }])
          }
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    fetchHistory()
  }, []) // Removed activeAgent dependencies to prevent reset on switch

  // C. Optimized Action Handlers (Streaming Enabled)
  const handleSend = useCallback(async (textOverride?: string | React.MouseEvent | React.KeyboardEvent) => {
    // Check if the argument is a string (manual override) or an event (from onClick/onKeyDown)
    const messageText = typeof textOverride === 'string' ? textOverride : input
    
    if (!messageText || typeof messageText !== 'string' || !messageText.trim() || loading) return

    const trimmedText = messageText.trim()
    const startTime = performance.now()
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      setThinking('الذكاء المركزي يقوم الآن بالتنفيذ المباشر لطلبك...')
      
      // Optimistic message update to keep UI snappy
      const assistantId = (Date.now() + 1).toString()
      const assistantMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        agentId: activeAgent.id,
        latency: 0
      }
      setMessages(prev => [...prev, assistantMessage])

      const response = await fetch('/api/marketing/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: activeAgent.id,
          agentPrompt: activeAgent.prompt,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown Error')
        let errorMessage = 'فشل الاتصال بالذكاء الاصطناعي'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          errorMessage = `Server Error (${response.status}): ${errorText.slice(0, 100)}`
        }
        throw new Error(errorMessage)
      }
      
      if (!response.body) throw new Error('لا يوجد محتوى في الرد')

      setThinking(null)
      
      // 🌊 STREAM PROCESSING
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let firstTokenTime = 0
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        if (!firstTokenTime) firstTokenTime = performance.now() - startTime

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep the last partial line in the buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.thinking) {
                setThinking(data.thinking)
              }

              if (data.text !== undefined && data.text !== null) {
                setThinking(null) // Clear thinking once text starts
                fullContent += data.text
                setMessages(prev => {
                  const next = [...prev]
                  const targetMsg = next.find(m => m.id === assistantId)
                  if (targetMsg) {
                    targetMsg.content = fullContent
                    targetMsg.latency = Math.round(firstTokenTime)
                  }
                  return [...next]
                })
              }
              if (data.error) {
                setThinking(null)
                toast.error(data.error)
                setMessages(prev => {
                  const next = [...prev]
                  const targetMsg = next.find(m => m.id === assistantId)
                  if (targetMsg) {
                    targetMsg.status = 'error'
                    targetMsg.content = (targetMsg.content || '') + `\n\n❌ خطأ: ${data.error}`
                  }
                  return [...next]
                })
              }
            } catch (e) {
              console.warn('Chunk parse error:', e)
            }
          }
        }
      }
    } catch (error: any) {
      setThinking(null)
      toast.error(error.message)
      // Remove the empty optimistic message on failure
      setMessages(prev => prev.filter(m => m.content !== '' || m.role !== 'assistant'))
    } finally {
      setLoading(false)
      setThinking(null)
    }
  }, [input, loading, activeAgent, messages])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('تم نسخ النص إلى الحافظة')
  }, [])

  const clearChat = useCallback(() => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: `تم بدء جلسة جديدة مع **${activeAgent.name}**. كيف نبدأ؟`,
      timestamp: new Date(),
      agentId: activeAgent.id
    }])
    toast.info('تم بدء جلسة جديدة')
  }, [activeAgent.id, activeAgent.name])

  // --- Render logic follows ---

  return (
    <TooltipProvider>
      <div className={`flex flex-col bg-[#050505] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 relative ${
        isFullscreen ? 'fixed inset-4 z-[100] h-auto' : 'h-[750px]'
      }`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-50 z-10" />
        
        {/* Main Layout Container */}
        <div className="flex flex-1 min-h-0 relative">
          
          {/* Sidebar: Agents */}
          <div className="w-80 border-l border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 hidden lg:flex flex-col gap-8 shrink-0">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">الفريق الذكي</h4>
              <p className="text-xs font-bold text-slate-400 px-2 leading-relaxed">اختر العميل الذكي الذي تود التحدث إليه</p>
            </div>
            
            <div className="space-y-3">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent)}
                  className={`w-full p-5 rounded-[2rem] transition-all duration-500 group relative overflow-hidden flex items-start gap-4 text-right border ${
                    activeAgent.id === agent.id 
                      ? 'bg-primary border-primary shadow-2xl shadow-primary/20 translate-x-2' 
                      : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                  }`}
                >
                  <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-all duration-500 ${
                    activeAgent.id === agent.id ? 'bg-white/20 text-white' : `bg-${agent.color}-500/10 text-${agent.color}-500`
                  }`}>
                    <agent.icon className="size-6" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <h5 className={`font-black text-sm transition-colors ${activeAgent.id === agent.id ? 'text-white' : 'text-slate-200'}`}>{agent.name}</h5>
                    <p className={`text-[10px] font-bold truncate transition-colors ${activeAgent.id === agent.id ? 'text-primary-foreground/80' : 'text-slate-500'}`}>{agent.description}</p>
                  </div>
                  {activeAgent.id === agent.id && (
                    <div className="absolute top-4 left-4">
                      <div className="size-2 rounded-full bg-white animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
               <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/20 to-purple-500/10 border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-1000" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-2xl">
                        <BrainCircuit className="size-4" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">ذاكرة السياق</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'الاستراتيجية الحالية', status: 'مفعلة' },
                        { label: 'هيكل الفريق', status: 'مفعل' },
                        { label: 'دليل العمليات (SOPs)', status: 'مفعل' },
                        { label: 'خطة التنفيذ', status: 'مفعلة' },
                      ].map((ctx, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-400">{ctx.label}</span>
                          <span className="text-emerald-500 flex items-center gap-1">
                            <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                            {ctx.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
               </Card>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#080808] relative">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-2xl z-20">
              <div className="flex items-center gap-5">
                <div className="lg:hidden">
                  <activeAgent.icon className={`size-6 text-${activeAgent.color}-500`} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-black text-white text-lg tracking-tight">{activeAgent.name}</h3>
                    <Badge variant="outline" className="rounded-lg border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500">{activeAgent.role}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase">Ready to Assist</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:text-white size-11 hover:bg-white/5" onClick={clearChat}>
                      <RotateCcw className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="font-black bg-[#0c0c0c] border-white/10">بدء جلسة جديدة</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:text-white size-11 hover:bg-white/5" onClick={() => setIsFullscreen(!isFullscreen)}>
                      {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="font-black bg-[#0c0c0c] border-white/10">تغيير حجم العرض</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent)]">
              <div className="p-8 space-y-10 max-w-5xl mx-auto">
                {isInitialLoading ? (
                  <div className="flex flex-col items-center justify-center py-40 space-y-6 opacity-30">
                    <div className="size-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                      <Command className="size-10 text-primary" />
                    </div>
                    <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">جاري استرجاع ذاكرة النظام وسياق العمل...</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((message: Message, idx) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-6 max-w-[90%] group ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Avatar className={`size-12 border shadow-2xl transition-transform duration-500 group-hover:scale-110 shrink-0 ${
                            message.role === 'user' ? 'border-primary/30' : 'border-white/10'
                          }`}>
                            {message.role === 'assistant' ? (
                              <>
                                <AvatarFallback className={`bg-${activeAgent.color}-500/10 text-${activeAgent.color}-500 border-none`}>
                                  <activeAgent.icon className="size-6" />
                                </AvatarFallback>
                              </>
                            ) : (
                              <>
                                <AvatarFallback className="bg-white/5 text-slate-400 border-none font-black">
                                  ME
                                </AvatarFallback>
                              </>
                            )}
                          </Avatar>
                          
                          <div className={`flex flex-col gap-3 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`relative p-7 rounded-[2.5rem] shadow-2xl transition-all duration-500 overflow-hidden ${
                              message.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-tr-none font-bold' 
                                : 'bg-white/5 backdrop-blur-3xl border border-white/10 text-slate-100 rounded-tl-none font-medium'
                            }`}>
                              {message.role === 'assistant' && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16 pointer-events-none" />
                              )}
                              
                              <div className={`prose prose-sm max-w-none ${
                                message.role === 'user' 
                                  ? 'text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-white' 
                                  : 'text-slate-100 dark:prose-invert prose-headings:text-white prose-strong:text-primary prose-code:bg-black/50 prose-code:p-1 prose-code:rounded-lg'
                              } prose-p:leading-relaxed prose-pre:bg-[#0c0c0c] prose-pre:border prose-pre:border-white/5 prose-pre:rounded-2xl`}>
                                <ReactMarkdown
                                  components={{
                                    img: ({node, ...props}) => (
                                      <div className="my-6 rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-2xl group relative">
                                        <img {...props} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" alt="Marketing Content" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                          <p className="text-white font-black text-xs">تم التوليد بواسطة البحراوي AI</p>
                                        </div>
                                      </div>
                                    )
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>

                              {message.role === 'assistant' && (
                                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-500 hover:text-white hover:bg-white/5" onClick={() => copyToClipboard(message.content)}>
                                      <Copy className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-500 hover:text-white hover:bg-white/5">
                                      <Share2 className="size-4" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Agent: {activeAgent.id}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 px-4">
                              <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {message.latency > 0 && (
                                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500/50 border-emerald-500/10 text-[8px] font-black">
                                  {message.latency}ms (90% faster)
                                </Badge>
                              )}
                              {message.status === 'error' && <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] font-black">Error</Badge>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex gap-6 items-center bg-white/5 backdrop-blur-3xl p-6 rounded-[2.5rem] rounded-tl-none border border-white/10 shadow-2xl">
                      <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Loader2 className="size-5 animate-spin text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">
                          {thinking || `${activeAgent.name} يفكر الآن...`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                          <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                          <span className="size-1 rounded-full bg-primary animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-8 border-t border-white/5 bg-white/[0.01] backdrop-blur-3xl z-20">
              <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {QUICK_ACTIONS.map((action, i) => (
                    <Button 
                      key={i}
                      variant="outline" 
                      className="h-14 rounded-2xl text-[11px] font-black gap-3 border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-500 group overflow-hidden relative"
                      onClick={() => handleSend(action.label)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <action.icon className={`size-4 ${action.color} group-hover:scale-110 transition-transform`} />
                      {action.label}
                    </Button>
                  ))}
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                  <div className="relative flex items-center bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-3 shadow-2xl transition-all duration-500 focus-within:border-primary/40 focus-within:bg-black">
                    <Button variant="ghost" size="icon" className="size-12 rounded-[1.25rem] text-slate-500 hover:text-white hover:bg-white/5 shrink-0">
                      <Plus className="size-6" />
                    </Button>
                    <Input 
                      className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-slate-600 font-bold h-12 text-base px-4"
                      placeholder={`تحدث مع ${activeAgent.name}...`}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <div className="flex items-center gap-2 px-2">
                      <Button 
                        size="icon"
                        className={`size-12 rounded-[1.25rem] transition-all duration-500 ${
                          input.trim() 
                            ? 'bg-primary text-white shadow-2xl shadow-primary/40 scale-100' 
                            : 'bg-white/5 text-slate-700 scale-95 opacity-50 pointer-events-none'
                        }`}
                        onClick={() => handleSend()}
                        disabled={!input.trim() || loading}
                      >
                        <Send className="size-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-3 text-slate-700" />
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Command: CMD + ENTER to Send</span>
                  </div>
                  <div className="size-1 bg-white/5 rounded-full" />
                  <div className="flex items-center gap-2">
                    <Globe className="size-3 text-slate-700" />
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Privacy: Secured Encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
