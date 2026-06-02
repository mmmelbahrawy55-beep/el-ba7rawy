'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Partners() {
  const [partners, setPartners] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/partners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPartners(data)
      })
      .catch(() => {})
  }, [])

  if (partners.length === 0) return null

  return (
    <section className="py-20 bg-slate-950 border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 z-10 pointer-events-none" />
      
      <div className="container px-4 mx-auto relative z-20">
        <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-16">
          شركاء النجاح وثقة العلامات التجارية
        </p>
        
        <div className="flex overflow-hidden group">
          <motion.div 
            className="flex gap-16 md:gap-24 items-center whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="h-10 md:h-14 opacity-20 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0 cursor-pointer"
              >
                <img 
                  src={partner.imageUrl} 
                  alt={partner.name} 
                  className="h-full w-auto object-contain brightness-0 invert"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
