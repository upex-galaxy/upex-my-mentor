/**
 * MYM-29: Session Dashboard Page
 *
 * Server component that displays user's upcoming and past mentoring sessions.
 * Fetches all bookings where the user is either mentor or student.
 */

import { redirect } from "next/navigation"
import { createServer } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SessionsTabs } from "./_components/sessions-tabs"
import { getReviewStatusForBookings } from "@/lib/actions/reviews"
import type { BookingWithParticipants } from "@/types/sessions"

export default async function SessionDashboardPage() {
  const supabase = await createServer()

  // Get authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    redirect("/login")
  }

  // Fetch user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", authUser.id)
    .single()

  if (!profile) {
    redirect("/login")
  }

  // Fetch all bookings where user is mentor or student
  // Include pending_payment to show bookings awaiting payment
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      *,
      mentor:profiles!bookings_mentor_id_fkey(id, name, email, photo_url),
      student:profiles!bookings_student_id_fkey(id, name, email, photo_url)
    `)
    .or(`mentor_id.eq.${authUser.id},student_id.eq.${authUser.id}`)
    .in("status", ["pending_payment", "confirmed", "completed", "cancelled"])
    .order("session_date", { ascending: false })

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError)
  }

  // Partition sessions into upcoming and past
  const now = new Date()
  const allSessions = (bookings || []) as BookingWithParticipants[]

  const upcomingSessions = allSessions
    .filter((booking) => {
      const sessionDate = new Date(booking.session_date)
      // Include pending_payment and confirmed sessions that are in the future
      return sessionDate > now && (booking.status === "confirmed" || booking.status === "pending_payment")
    })
    .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())

  const pastSessions = allSessions
    .filter((booking) => {
      const sessionDate = new Date(booking.session_date)
      // Exclude pending_payment sessions in the future (they go to upcoming)
      if (booking.status === "pending_payment" && sessionDate > now) {
        return false
      }
      return (
        sessionDate <= now ||
        booking.status === "completed" ||
        booking.status === "cancelled"
      )
    })
    .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())

  // MYM-33: Get review status for completed past sessions
  const completedSessionIds = pastSessions
    .filter((s) => s.status === "completed")
    .map((s) => s.id)

  const reviewStatusMap = await getReviewStatusForBookings(completedSessionIds)
  // Convert Map to plain object for serialization
  const reviewStatus: Record<string, boolean> = {}
  reviewStatusMap.forEach((value, key) => {
    reviewStatus[key] = value
  })

  const userRole = profile.role as 'student' | 'mentor'

  return (
    <div data-testid="sessionDashboardPage" className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-900/40 dark:via-fuchsia-900/20 dark:to-violet-900/40 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Mis Sesiones</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gestiona tus sesiones de mentoría
            </p>
          </div>
        </div>

        {/* Sessions Content */}
        <div className="container mx-auto px-4 py-8">
          <SessionsTabs
            upcomingSessions={upcomingSessions}
            pastSessions={pastSessions}
            currentUserId={authUser.id}
            currentUserRole={userRole}
            reviewStatus={reviewStatus}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
