import { NextResponse } from 'next/server'
import { createServerFromRequest } from '@/lib/supabase/server'
import { addDays } from 'date-fns'

/**
 * GET /api/mentors/[id]/availability
 *
 * Fetches mentor's weekly availability and existing bookings
 * for the next 30 days.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: mentorId } = await params
  const supabase = await createServerFromRequest(request)

  // Fetch mentor availability
  const { data: availability, error: availError } = await supabase
    .from('mentor_availability')
    .select('*')
    .eq('mentor_id', mentorId)
    .eq('is_active', true)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (availError) {
    console.error('Error fetching availability:', availError)
  }

  // Fetch existing bookings for the next 30 days
  const startDate = new Date()
  const endDate = addDays(new Date(), 30)

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('session_date')
    .eq('mentor_id', mentorId)
    .neq('status', 'cancelled')
    .gte('session_date', startDate.toISOString())
    .lte('session_date', endDate.toISOString())

  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError)
  }

  return NextResponse.json({
    availability: availability || [],
    bookings: bookings || [],
  })
}
