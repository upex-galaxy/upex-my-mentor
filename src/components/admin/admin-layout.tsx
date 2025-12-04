"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  badge?: string | number
}

const navItems = [
  {
    href: "/admin/applications",
    label: "Applications",
    icon: FileText,
  },
]

export function AdminLayout({ children, title, badge }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-muted/30">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Admin Panel</span>
          </Link>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {title}
            {badge !== undefined && (
              <span
                data-testid="applications-count"
                className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary text-primary-foreground"
              >
                {badge}
              </span>
            )}
          </h1>
        </div>
        {children}
      </main>
    </div>
  )
}
