import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServer } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BookingCalendar } from '@/components/scheduling/booking-calendar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, DollarSign } from 'lucide-react'
import type { Database } from '@/types/supabase'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

// Default timezone for mentors without explicit timezone
const DEFAULT_MENTOR_TIMEZONE = 'America/New_York'

export default async function BookSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServer()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?returnTo=/mentors/${id}/book`)
  }

  // Fetch mentor data
  const { data: mentor, error } = await supabase
    .from('profiles')
    .select('id, name, email, photo_url, hourly_rate, is_verified, specialties')
    .eq('id', id)
    .eq('role', 'mentor')
    .eq('is_verified', true)
    .single()

  if (error || !mentor) {
    notFound()
  }

  // Prevent booking with yourself
  if (user.id === mentor.id) {
    redirect(`/mentors/${id}`)
  }

  return (
    <div data-testid="book_session_page" className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 py-8">
          <div className="container mx-auto px-4">
            <Link
              href={`/mentors/${id}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al perfil
            </Link>

            <h1
              data-testid="page_title"
              className="text-3xl md:text-4xl font-bold mb-2"
            >
              Reservar sesión con {mentor.name}
            </h1>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-1 text-primary" />
                <span data-testid="hourly_rate" className="text-lg font-semibold text-foreground">
                  ${mentor.hourly_rate}
                </span>
                <span className="ml-1">/hora</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Calendar */}
        <div className="container mx-auto px-4 py-8">
          <BookingCalendar
            mentorId={mentor.id}
            mentorName={mentor.name || 'Mentor'}
            mentorTimezone={DEFAULT_MENTOR_TIMEZONE}
            hourlyRate={mentor.hourly_rate || 0}
            mentorPhotoUrl={mentor.photo_url || undefined}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
