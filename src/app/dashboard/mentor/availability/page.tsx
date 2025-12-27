import { redirect } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AvailabilityCalendar } from '@/components/scheduling/availability-calendar'
import { getMentorAvailability } from '@/lib/actions/availability'

/**
 * MYM-19: Mentor Availability Configuration Page
 *
 * Allows mentors to set their weekly recurring availability.
 * Protected route - only accessible by authenticated mentors.
 */
export default async function MentorAvailabilityPage() {
  const supabase = await createServer()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is a mentor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'mentor') {
    // Redirect non-mentors to regular dashboard
    redirect('/dashboard')
  }

  // Fetch existing availability
  const { slots, error } = await getMentorAvailability(user.id)

  if (error) {
    console.error('Error fetching availability:', error)
  }

  return (
    <div data-testid="mentor_availability_page" className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Disponibilidad</h1>
            <p className="text-muted-foreground mt-1">
              Configura los horarios en los que estás disponible para sesiones de mentoría
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <AvailabilityCalendar
            mentorId={user.id}
            initialSlots={slots}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
