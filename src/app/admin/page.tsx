'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { AdminDashboard } from '../../components/admin/admin-dashboard'
import AdminLogin from '../../components/admin/admin-login'
import { Loader2 } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name: string
  avatar?: string
}

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('admin_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        }
      } catch (e) {
        console.error("Failed to parse admin user", e)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleLogin = (userData: AdminUser) => {
    setUser(userData)
    localStorage.setItem('admin_user', JSON.stringify(userData))
    // Also set a cookie for middleware if needed
    document.cookie = `admin_token=true; path=/; max-age=${60 * 60 * 24}` 
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('admin_user')
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-arabic">
      <AnimatePresence mode="wait">
        {!user ? (
          <AdminLogin 
            key="login"
            onLogin={handleLogin} 
            onBack={() => router.push('/')} 
          />
        ) : (
          <AdminDashboard 
            key="dashboard"
            user={user} 
            onLogout={handleLogout} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
