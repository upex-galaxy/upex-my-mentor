import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createServer } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Admin Panel - MyMentor",
  description: "Administration panel for MyMentor platform",
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminRouteLayout({ children }: AdminLayoutProps) {
  const supabase = await createServer()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?redirectTo=/admin')
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    // Non-admin users are redirected to dashboard
    redirect('/dashboard')
  }

  return <>{children}</>
}
