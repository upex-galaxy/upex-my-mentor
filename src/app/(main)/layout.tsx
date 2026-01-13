/**
 * Main Layout - Route Group (main)
 *
 * This layout applies to all pages that should have the standard Navbar and Footer.
 * Pages in this group: Landing, Dashboard, Mentors, Admin, Profile, etc.
 */

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
