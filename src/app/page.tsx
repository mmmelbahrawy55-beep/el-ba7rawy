'use client'

import SiteHeader from '../components/site-header'
import HeroSection from '../components/hero-section'
import ServicesSection from '../components/services-section'
import PortfolioGallery from '../components/portfolio-gallery'
import QuoteCalculator from '../components/quote-calculator'
import WhyChooseUs from '../components/why-choose-us'
import Testimonials from '../components/testimonials'
import PartnersSection from '../components/partners-section'
import ContactSection from '../components/contact-section'
import FAQSection from '../components/faq-section'
import FloatingActions from '../components/floating-actions'
import SiteFooter from '../components/site-footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <SiteHeader />
      <main>
        <HeroSection />
        <WhyChooseUs />
        <PartnersSection />
        <ServicesSection />
        <PortfolioGallery />
        <QuoteCalculator />
        <Testimonials />
        <FAQSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <FloatingActions />
    </div>
  )
}
