'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function PartnersSection() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/partners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPartners(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || partners.length === 0) return null

  return (
    <section className="py-24 bg-background overflow-hidden transition-colors duration-500">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-4">Trusted By</p>
          <h2 className="text-3xl font-black text-foreground">شركاء النجاح</h2>
        </div>

        <div className="relative">
          {/* Gradients for fading effect */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

          <div className="flex overflow-hidden group">
            <motion.div
              className="flex gap-12 py-4 animate-scroll whitespace-nowrap"
              animate={{ x: [0, -1000] }}
              transition={{ 
                duration: 30, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              {[...partners, ...partners].map((partner, i) => (
                <div 
                  key={i}
                  className="w-40 h-20 relative grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer"
                >
                  <Image
                    src={partner.imageUrl}
                    alt={partner.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
