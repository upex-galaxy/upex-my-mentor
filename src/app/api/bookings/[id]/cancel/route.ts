/**
 * POST /api/bookings/[id]/cancel
 * MYM-31: Cancel a session and process refund
 *
 * Validates:
 * - User is authenticated
 * - User is a participant (mentor or student) of the booking
 * - Booking status is 'confirmed'
 * - Current time is more than 24 hours before session start
 *
 * Actions on success:
 * - Update booking status to 'cancelled'
 * - Process refund via Stripe
 * - Update transaction status to 'refunded'
 * - Send cancellation notification emails to both parties
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { resend, EMAIL_CONFIG, isEmailServiceConfigured } from '@/lib/email/resend'
import { canCancelSession } from '@/lib/date-utils'
import type { CancelSessionResponse, CancelErrorCode } from '@/types/sessions'

function errorResponse(
  error: CancelErrorCode,
  message: string,
  status: number
): NextResponse<CancelSessionResponse> {
  return NextResponse.json(
    { success: false, error, message },
    { status }
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CancelSessionResponse>> {
  try {
    const { id: bookingId } = await params
    const supabase = await createServer()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse(
        'UNAUTHORIZED',
        'Debes iniciar sesión para cancelar una sesión',
        401
      )
    }

    // 2. Get booking with participant info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        mentor_id,
        student_id,
        session_date,
        duration_minutes,
        status,
        total_cost,
        mentor:profiles!bookings_mentor_id_fkey(id, name, email),
        student:profiles!bookings_student_id_fkey(id, name, email)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return errorResponse(
        'BOOKING_NOT_FOUND',
        'No se encontró la sesión solicitada',
        404
      )
    }

    // 3. Validate user is a participant
    const isParticipant = booking.mentor_id === user.id || booking.student_id === user.id

    if (!isParticipant) {
      return errorResponse(
        'NOT_A_PARTICIPANT',
        'No tienes permiso para cancelar esta sesión',
        403
      )
    }

    // 4. Check if already cancelled (idempotency)
    if (booking.status === 'cancelled') {
      return errorResponse(
        'SESSION_ALREADY_CANCELLED',
        'Esta sesión ya ha sido cancelada',
        400
      )
    }

    // 5. Validate booking status is 'confirmed'
    if (booking.status !== 'confirmed') {
      return errorResponse(
        'SESSION_NOT_CONFIRMED',
        'Solo se pueden cancelar sesiones confirmadas',
        400
      )
    }

    // 6. Validate 24-hour cancellation window (server-side authority)
    if (!canCancelSession(booking.session_date)) {
      return errorResponse(
        'CANCELLATION_WINDOW_CLOSED',
        'No es posible cancelar con menos de 24 horas de anticipación',
        400
      )
    }

    // 7. Get transaction for refund
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('id, stripe_payment_intent_id, status')
      .eq('booking_id', bookingId)
      .single()

    // 8. Process refund via Stripe if transaction exists
    let refundId: string | undefined

    if (transaction?.stripe_payment_intent_id && transaction.status === 'succeeded') {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: transaction.stripe_payment_intent_id,
          reason: 'requested_by_customer',
        })
        refundId = refund.id

        // Update transaction status to refunded
        await supabase
          .from('transactions')
          .update({
            status: 'refunded',
            updated_at: new Date().toISOString(),
          })
          .eq('id', transaction.id)

      } catch (stripeError) {
        console.error('[Cancel Session] Stripe refund error:', stripeError)
        // Don't change booking status if refund fails
        return errorResponse(
          'REFUND_FAILED',
          'Error al procesar el reembolso. Por favor, contacta a soporte.',
          500
        )
      }
    }

    // 9. Update booking to cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('[Cancel Session] Update booking error:', updateError)
      return errorResponse(
        'INTERNAL_ERROR',
        'Error al actualizar el estado de la sesión',
        500
      )
    }

    // 10. Send cancellation notification emails
    const mentor = booking.mentor as { id: string; name: string | null; email: string }
    const student = booking.student as { id: string; name: string | null; email: string }
    const cancelledByName = user.id === mentor.id ? mentor.name : student.name

    if (isEmailServiceConfigured() && resend) {
      const sessionDate = new Date(booking.session_date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      // Email to student (mentee)
      try {
        await resend.emails.send({
          from: EMAIL_CONFIG.FROM_EMAIL,
          to: student.email,
          subject: 'Tu sesión ha sido cancelada - Upex My Mentor',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Sesión Cancelada</h2>
              <p>Hola ${student.name || 'estudiante'},</p>
              <p>Tu sesión de mentoría ha sido cancelada.</p>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Mentor:</strong> ${mentor.name}</p>
                <p style="margin: 4px 0;"><strong>Fecha:</strong> ${sessionDate}</p>
                <p style="margin: 4px 0;"><strong>Cancelado por:</strong> ${cancelledByName}</p>
              </div>
              ${refundId ? '<p style="color: #059669;"><strong>Se ha procesado un reembolso completo.</strong></p>' : ''}
              <p>Puedes buscar otro mentor y agendar una nueva sesión en cualquier momento.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://upexmymentor.com'}/mentors"
                 style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
                Buscar Mentores
              </a>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('[Cancel Session] Error sending student email:', emailError)
        // Don't fail the cancellation if email fails
      }

      // Email to mentor
      try {
        await resend.emails.send({
          from: EMAIL_CONFIG.FROM_EMAIL,
          to: mentor.email,
          subject: 'Una sesión ha sido cancelada - Upex My Mentor',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Sesión Cancelada</h2>
              <p>Hola ${mentor.name || 'mentor'},</p>
              <p>Una sesión de mentoría ha sido cancelada.</p>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Estudiante:</strong> ${student.name}</p>
                <p style="margin: 4px 0;"><strong>Fecha:</strong> ${sessionDate}</p>
                <p style="margin: 4px 0;"><strong>Cancelado por:</strong> ${cancelledByName}</p>
              </div>
              <p>Tu horario ha sido liberado y está disponible para nuevas reservas.</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('[Cancel Session] Error sending mentor email:', emailError)
        // Don't fail the cancellation if email fails
      }
    } else {
      console.log('[Cancel Session] Email service not configured - skipping notifications')
    }

    // 11. Return success
    return NextResponse.json({
      success: true,
      message: 'Sesión cancelada exitosamente. Se ha procesado tu reembolso.',
      refundId,
    })

  } catch (error) {
    console.error('[Cancel Session] Unexpected error:', error)
    return errorResponse(
      'INTERNAL_ERROR',
      'Error interno del servidor',
      500
    )
  }
}
