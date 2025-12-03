import { Navbar } from "@/components/layout/navbar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Panel - Upex My Mentor",
  description: "Administration panel for Upex My Mentor platform",
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminRouteLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
