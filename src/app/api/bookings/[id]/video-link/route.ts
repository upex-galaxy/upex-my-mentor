/**
 * GET /api/bookings/[id]/video-link
 * MYM-30: Get video call link for a booking session
 *
 * Validates:
 * - User is authenticated
 * - User is a participant (mentor or student) of the booking
 * - Current time is within join window (15 min before to 1h after session end)
 * - Video call URL exists
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { isWithinJoinWindow, isSessionExpired, canJoinNow } from '@/lib/date-utils'

// Error codes for client handling
type VideoLinkErrorCode =
  | 'UNAUTHORIZED'
  | 'BOOKING_NOT_FOUND'
  | 'NOT_A_PARTICIPANT'
  | 'TOO_EARLY_TO_JOIN'
  | 'SESSION_EXPIRED'
  | 'LINK_NOT_AVAILABLE'
  | 'INTERNAL_ERROR'

interface VideoLinkSuccessResponse {
  success: true
  url: string
}

interface VideoLinkErrorResponse {
  success: false
  error: VideoLinkErrorCode
  message: string
}

type VideoLinkResponse = VideoLinkSuccessResponse | VideoLinkErrorResponse

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<VideoLinkResponse>> {
  try {
    const { id: bookingId } = await params
    const supabase = await createServer()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión para acceder a este enlace'
        },
        { status: 401 }
      )
    }

    // 2. Get booking with mentor and student info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        mentor_id,
        student_id,
        session_date,
        duration_minutes,
        status,
        videocall_url
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'No se encontró la sesión solicitada'
        },
        { status: 404 }
      )
    }

    // 3. Validate user is a participant
    const isParticipant = booking.mentor_id === user.id || booking.student_id === user.id

    if (!isParticipant) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_A_PARTICIPANT',
          message: 'No tienes acceso a esta sesión'
        },
        { status: 403 }
      )
    }

    // 4. Validate booking status (must be confirmed or completed)
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: 'LINK_NOT_AVAILABLE',
          message: 'Esta sesión no está confirmada'
        },
        { status: 400 }
      )
    }

    // 5. Check if session has expired
    if (isSessionExpired(booking.session_date, booking.duration_minutes)) {
      return NextResponse.json(
        {
          success: false,
          error: 'SESSION_EXPIRED',
          message: 'Esta sesión ya finalizó'
        },
        { status: 410 }
      )
    }

    // 6. Check if it's too early to join
    if (!canJoinNow(booking.session_date)) {
      return NextResponse.json(
        {
          success: false,
          error: 'TOO_EARLY_TO_JOIN',
          message: 'Aún es muy temprano para unirse. Podrás acceder 15 minutos antes de la sesión.'
        },
        { status: 403 }
      )
    }

    // 7. Validate video call URL exists
    if (!booking.videocall_url) {
      return NextResponse.json(
        {
          success: false,
          error: 'LINK_NOT_AVAILABLE',
          message: 'El enlace de video no está disponible. Por favor, contacta a soporte.'
        },
        { status: 503 }
      )
    }

    // 8. All validations passed - return the URL
    return NextResponse.json({
      success: true,
      url: booking.videocall_url
    })

  } catch (error) {
    console.error('[Video Link API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}
