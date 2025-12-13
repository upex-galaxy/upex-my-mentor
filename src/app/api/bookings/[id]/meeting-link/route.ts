/**
 * PATCH /api/bookings/[id]/meeting-link
 * MYM-30: Allow mentor to add/update the session meeting link
 *
 * Only the mentor of the booking can update the meeting link.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { z } from 'zod'

const meetingLinkSchema = z.object({
  meetingLink: z.string().url('El link debe ser una URL válida'),
})

interface SuccessResponse {
  success: true
  meetingLink: string
}

interface ErrorResponse {
  success: false
  error: string
  message: string
}

type ApiResponse = SuccessResponse | ErrorResponse

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id: bookingId } = await params
    const supabase = await createServer()

    // 1. Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión para realizar esta acción',
        },
        { status: 401 }
      )
    }

    // 2. Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(bookingId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_BOOKING_ID',
          message: 'ID de reserva inválido',
        },
        { status: 400 }
      )
    }

    // 3. Get the booking and verify mentor ownership
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, mentor_id, status')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'BOOKING_NOT_FOUND',
          message: 'Reserva no encontrada',
        },
        { status: 404 }
      )
    }

    // 4. Verify the user is the mentor of this booking
    if (booking.mentor_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Solo el mentor puede actualizar el link de la sesión',
        },
        { status: 403 }
      )
    }

    // 5. Parse and validate request body
    let body: { meetingLink: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_JSON',
          message: 'El cuerpo de la solicitud no es JSON válido',
        },
        { status: 400 }
      )
    }

    const validation = meetingLinkSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: validation.error.errors[0]?.message || 'Datos inválidos',
        },
        { status: 400 }
      )
    }

    const { meetingLink } = validation.data

    // 6. Update the booking with the meeting link
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        session_meeting_link: meetingLink,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('[Meeting Link API] Update error:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: 'UPDATE_ERROR',
          message: 'Error al actualizar el link de la sesión',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      meetingLink,
    })
  } catch (error) {
    console.error('[Meeting Link API] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
