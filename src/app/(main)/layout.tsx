/**
 * Main Layout - Route Group (main)
 *
 * This layout applies to all pages that should have the standard Navbar and Footer.
 * Pages in this group: Landing, Dashboard, Mentors, Admin, Profile, etc.
 *
 * Features glassmorphism background with illuminated orbs.
 */

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { GlassBackground } from '@/components/layout/glass-background'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <GlassBackground />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
