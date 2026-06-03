'use client'

import { useState } from 'react'
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
  Megaphone,
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
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
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
  const [logoSource, setLogoSource] = useState('/images/logo.png')

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.logoUrl) setLogoSource(data.logoUrl)
    }).catch(() => {})
  }, [])

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
      <aside className={`fixed inset-y-0 right-0 z-50 w-56 bg-[#080808] border-l border-white/5 transition-transform duration-500 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h2 className="text-lg font-black tracking-tighter text-white flex items-center gap-3">
              <div className="relative size-8 flex items-center justify-center">
                <img
                  src={logoSource}
                  alt="ELBA7RAWY Logo"
                  onError={() => setLogoSource('/images/logo.png')}
                  className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(251,191,36,0.2)]"
                />
              </div>
              <span dir="ltr">ELBA<span className="text-primary">7RAWY</span></span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="size-1 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Admin Control</p>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-4 overflow-y-auto pb-4 custom-scrollbar">
            {['عام', 'النظام', 'الإدارة', 'التسويق', 'المبيعات', 'أخرى'].map((cat) => (
              <div key={cat} className="space-y-1.5">
                <h3 className="px-3 text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">{cat}</h3>
                <div className="space-y-0.5">
                  {navItems.filter(item => item.category === cat).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => item.id === 'logout' ? onLogout() : setActiveSection(item.id as Section)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                        activeSection === item.id 
                          ? 'text-white' 
                          : 'text-muted-foreground/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {activeSection === item.id && (
                        <motion.div 
                          layoutId="active-bg"
                          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent border-r-2 border-primary"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <item.icon className={`size-3.5 relative z-10 transition-transform duration-300 group-hover:scale-110 ${activeSection === item.id ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-primary'}`} />
                      <span className="font-bold text-[11px] relative z-10 tracking-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-3 border-t border-white/5">
             <div className="bg-white/5 rounded-xl p-2 flex items-center gap-2 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                <Avatar className="size-7 border border-primary/20 group-hover:border-primary transition-colors">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-black text-[9px]">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[9px] font-black text-white truncate">{user?.name}</p>
                  <p className="text-[7px] font-bold text-muted-foreground truncate opacity-60">{user?.email}</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:mr-56 min-h-screen flex flex-col relative">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full" />
        </div>

        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#020202]/80 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="size-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="lg:hidden size-6 flex items-center justify-center">
                <img 
                  src={logoSource} 
                  alt="Logo" 
                  onError={() => setLogoSource('/images/logo.png')}
                  className="w-full h-full object-contain" 
                />
              </div>
              <h1 className="text-base font-black text-white tracking-tighter">
                {navItems.find(i => i.id === activeSection)?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <Search className="size-3 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="بحث سريع..." 
                className="bg-transparent border-none outline-none text-[9px] font-bold text-white placeholder:text-muted-foreground/40 w-28"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white transition-colors h-8 w-8">
              <Bell className="size-3.5" />
              <span className="absolute top-2 right-2 size-1 bg-primary rounded-full" />
            </Button>
            <div className="h-5 w-px bg-white/5 mx-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="text-red-500 hover:text-red-400 hover:bg-red-500/5 font-black text-[9px] gap-1.5 h-8 px-2"
            >
              <LogOut className="size-3" />
              خروج
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 relative z-10 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
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
