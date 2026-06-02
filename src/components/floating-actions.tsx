'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Phone, ArrowUp } from 'lucide-react'
import { useState, useEffect } from 'react'

const WHATSAPP_URL = "https://wa.me/201234567890" // Replace with actual number
const PHONE_NUMBER = "tel:+201234567890"

export default function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {})

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const whatsappUrl = settings?.whatsapp 
    ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`
    : "https://wa.me/201120053007";
    
  const phoneUrl = settings?.phone 
    ? `tel:${settings.phone}`
    : "tel:+201120053007";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="fixed bottom-8 left-8 z-[100] flex flex-col gap-4">
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border text-foreground shadow-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <ArrowUp className="size-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.a
        href={phoneUrl}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border text-foreground shadow-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
      >
        <Phone className="size-6 group-hover:rotate-12 transition-transform" />
      </motion.a>

      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl bg-[#25D366]/10 backdrop-blur-xl border border-[#25D366]/20 text-[#25D366] shadow-2xl hover:bg-[#25D366] hover:text-white transition-all duration-300 group"
      >
        <MessageCircle className="size-6 group-hover:scale-110 transition-transform" />
      </motion.a>
    </div>
  )
}
