'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Bell,
  Search,
  Image as ImageIcon,
  Clock,
  Users,
  Mail,
  Megaphone,
  BrainCircuit,
  ChevronDown,
  Sparkles,
  HelpCircle,
  MessageSquare
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import StatsCards from './stats-cards'
import ProductsManager from './products-manager'
import CategoriesManager from './categories-manager'
import OrdersManager from './orders-manager'
import SettingsManager from './settings-manager'
import ProjectsManager from './projects-manager'
import MessagesManager from './messages-manager'
import PlatformSystem from './platform-system'
import PartnersManager from './partners-manager'
import ActivityLog from './activity-log'
import MarketingManager from './marketing-manager'
import ImageOptimizer from './image-optimizer'
import FAQsManager from './faqs-manager'
import TestimonialsManager from './testimonials-manager'

interface AdminDashboardProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  onLogout: () => void
}

type Section = 'dashboard' | 'products' | 'categories' | 'orders' | 'settings' | 'projects' | 'platform' | 'messages' | 'partners' | 'activity' | 'marketing' | 'image-optimizer' | 'faqs' | 'testimonials'

interface NavItem {
  id: Section | 'logout'
  label: string
  icon: any
  category?: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, category: 'عام' },
  { id: 'platform', label: 'سيستم المنصة', icon: ShieldCheck, category: 'النظام' },
  { id: 'activity', label: 'سجل النشاطات', icon: Clock, category: 'النظام' },
  { id: 'products', label: 'المنتجات والأسعار', icon: Package, category: 'الإدارة' },
  { id: 'image-optimizer', label: 'تحسين صور المنتجات', icon: Sparkles, category: 'الإدارة' },
  { id: 'categories', label: 'التصنيفات', icon: FolderTree, category: 'الإدارة' },
  { id: 'projects', label: 'معرض الأعمال', icon: ImageIcon, category: 'الإدارة' },
  { id: 'partners', label: 'شركاء النجاح', icon: Users, category: 'الإدارة' },
  { id: 'marketing', label: 'التسويق الذكي', icon: Megaphone, category: 'التسويق' },
  { id: 'orders', label: 'الطلبات', icon: ShoppingCart, category: 'المبيعات' },
  { id: 'messages', label: 'الرسائل', icon: Bell, category: 'المبيعات' },
  { id: 'settings', label: 'إعدادات المنصة', icon: Settings, category: 'النظام' },
  { id: 'faqs', label: 'الأسئلة الشائعة', icon: HelpCircle, category: 'الإدارة' },
  { id: 'testimonials', label: 'آراء العملاء', icon: MessageSquare, category: 'المبيعات' },
  { id: 'logout', label: 'تسجيل خروج', icon: LogOut, category: 'أخرى' },
]

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <StatsCards />
      case 'products':
        return <ProductsManager />
      case 'image-optimizer':
        return <ImageOptimizer />
      case 'categories':
        return <CategoriesManager />
      case 'orders':
        return <OrdersManager />
      case 'projects':
        return <ProjectsManager />
      case 'platform':
        return <PlatformSystem />
      case 'messages':
        return <MessagesManager />
      case 'partners':
        return <PartnersManager />
      case 'activity':
        return <ActivityLog />
      case 'marketing':
        return <MarketingManager />
      case 'settings':
        return <SettingsManager />
      case 'faqs':
        return <FAQsManager />
      case 'testimonials':
        return <TestimonialsManager />
      default:
        return <StatsCards />
    }
  }

  return (
    <div className="flex min-h-screen bg-[#020202] font-arabic text-foreground selection:bg-primary/30" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#080808] border-l border-white/5 transition-transform duration-500 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-[10px_0_50px_rgba(0,0,0,0.5)]`}>
        <div className="flex flex-col h-full">
          <div className="p-10">
            <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-black rotate-12 shadow-[0_0_20px_rgba(251,191,36,0.5)]">E</div>
              <span dir="ltr">ELBA<span className="text-primary">7RAWY</span></span>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Admin Panel</p>
            </div>
          </div>

          <nav className="flex-1 px-6 space-y-10 overflow-y-auto pb-10 custom-scrollbar">
            {['عام', 'النظام', 'الإدارة', 'التسويق', 'المبيعات', 'أخرى'].map((cat) => (
              <div key={cat} className="space-y-4">
                <h3 className="px-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">{cat}</h3>
                <div className="space-y-1.5">
                  {navItems.filter(item => item.category === cat).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => item.id === 'logout' ? onLogout() : setActiveSection(item.id as Section)}
                      className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group relative overflow-hidden ${
                        activeSection === item.id 
                          ? 'text-white' 
                          : 'text-muted-foreground/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {activeSection === item.id && (
                        <motion.div 
                          layoutId="active-bg"
                          className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent border-r-4 border-primary"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <item.icon className={`size-5 relative z-10 transition-transform duration-300 group-hover:scale-110 ${activeSection === item.id ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-primary'}`} />
                      <span className="font-bold text-sm relative z-10 tracking-tight">{item.label}</span>
                      {activeSection === item.id && (
                        <div className="absolute left-4 size-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-6 border-t border-white/5">
             <div className="bg-white/5 rounded-3xl p-5 flex items-center gap-4 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                <Avatar className="size-11 border-2 border-primary/20 group-hover:border-primary transition-colors">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-black text-white truncate">{user?.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground truncate opacity-60">{user?.email}</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:mr-72 min-h-screen flex flex-col relative">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[150px] rounded-full animate-pulse" />
        </div>
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-white/5">
          <div className="flex items-center justify-between h-24 px-10">
            <div className="flex items-center gap-6">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-3 text-muted-foreground hover:bg-white/5 rounded-2xl transition-all">
                <Menu className="size-6" />
              </button>
              <div className="hidden md:flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-muted-foreground focus-within:border-primary/30 transition-all group">
                <Search className="size-4 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="بحث سريع في النظام..." 
                  className="bg-transparent border-none outline-none text-xs font-bold w-64 placeholder:text-muted-foreground/30 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button className="p-3 text-muted-foreground hover:bg-white/5 rounded-2xl transition-all relative group border border-white/5">
                  <Bell className="size-5 group-hover:scale-110 group-hover:text-primary transition-all" />
                  <span className="absolute top-3 left-3 size-2.5 bg-primary rounded-full border-4 border-[#020202]" />
                </button>
                <button className="p-3 text-muted-foreground hover:bg-white/5 rounded-2xl transition-all border border-white/5 group">
                  <Settings className="size-5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
              
              <div className="h-10 w-px bg-white/10" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-14 flex items-center gap-4 pl-3 pr-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.25rem] transition-all group shadow-xl">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-black text-white">{user?.name || 'المدير'}</p>
                      <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">Administrator</p>
                    </div>
                    <Avatar className="size-10 border-2 border-primary/20 group-hover:border-primary transition-all duration-300">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-4 rounded-3xl p-3 bg-[#0c0c0c] border border-white/10 text-foreground font-arabic shadow-2xl" align="end">
                  <DropdownMenuLabel className="font-black px-4 py-4 text-white text-lg">إعدادات الحساب</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="rounded-2xl px-4 py-4 font-bold cursor-pointer hover:bg-white/5 focus:bg-white/5 transition-all mb-1">
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-4 py-4 font-bold cursor-pointer hover:bg-white/5 focus:bg-white/5 transition-all">
                    الإعدادات المتقدمة
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={onLogout} className="rounded-2xl px-4 py-4 font-black text-red-500 cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 transition-all mt-1">
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-10 flex-1 relative z-10 overflow-y-auto custom-scrollbar">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
