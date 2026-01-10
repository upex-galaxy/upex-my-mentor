'use server'

/**
 * Server Actions for Booking - MYM-21
 *
 * Handles booking creation with Stripe Checkout integration.
 * Includes race condition prevention and error handling.
 */

import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { getBaseUrl } from '@/lib/urls'
import type { BookingFormData, CreateBookingResult } from '@/types/scheduling'

// Initialize Stripe (server-side only)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
})

/**
 * Creates a booking and initiates Stripe Checkout
 *
 * @param data - Booking form data
 * @returns Result with checkout URL or error
 */
export async function createBooking(
  data: BookingFormData
): Promise<CreateBookingResult> {
  const supabase = await createServer()

  // 1. Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'Debes iniciar sesión para reservar una sesión',
      errorCode: 'UNAUTHORIZED',
    }
  }

  // 2. Fetch mentor details for Stripe metadata
  const { data: mentor, error: mentorError } = await supabase
    .from('profiles')
    .select('id, name, email, hourly_rate, is_verified')
    .eq('id', data.mentorId)
    .eq('role', 'mentor')
    .eq('is_verified', true)
    .single()

  if (mentorError || !mentor) {
    return {
      success: false,
      error: 'Mentor no encontrado o no verificado',
      errorCode: 'UNKNOWN',
    }
  }

  // 3. Check for existing booking at this time (race condition prevention)
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id')
    .eq('mentor_id', data.mentorId)
    .eq('session_date', data.sessionDate.toISOString())
    .neq('status', 'cancelled')
    .single()

  if (existingBooking) {
    return {
      success: false,
      error: 'Este horario ya no está disponible',
      errorCode: 'SLOT_TAKEN',
    }
  }

  // 4. Create booking with status 'pending_payment'
  // MYM-30: Include communication_channels as JSONB array
  const communicationChannels = data.communicationChannel
    ? [{ type: data.communicationChannel, selectedByMentee: true }]
    : null

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      mentor_id: data.mentorId,
      student_id: user.id,
      session_date: data.sessionDate.toISOString(),
      duration_minutes: data.durationMinutes,
      total_cost: data.totalCost,
      status: 'pending_payment',
      communication_channels: communicationChannels,
    })
    .select('id')
    .single()

  if (bookingError) {
    // Check if it's a unique constraint violation (race condition caught by DB)
    if (bookingError.code === '23505') {
      return {
        success: false,
        error: 'Este horario ya no está disponible',
        errorCode: 'SLOT_TAKEN',
      }
    }
    console.error('Booking creation error:', bookingError)
    return {
      success: false,
      error: 'Error al crear la reserva',
      errorCode: 'UNKNOWN',
    }
  }

  // 5. Fetch mentor's Stripe account for connected payments
  const { data: stripeAccount } = await supabase
    .from('stripe_accounts')
    .select('stripe_account_id, charges_enabled')
    .eq('mentor_id', data.mentorId)
    .single()

  // 6. Create Stripe Checkout Session
  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Sesión de mentoría con ${mentor.name}`,
              description: `Sesión de ${data.durationMinutes} minutos`,
            },
            unit_amount: Math.round(data.totalCost * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        mentor_id: data.mentorId,
        mentee_id: user.id,
      },
      success_url: `${getBaseUrl()}/bookings/${booking.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/mentors/${data.mentorId}/book?cancelled=true`,
    }

    // If mentor has Stripe Connect, use destination charges
    if (stripeAccount?.stripe_account_id && stripeAccount.charges_enabled) {
      const platformFeePercent = 0.15 // 15% platform fee
      const platformFee = Math.round(data.totalCost * 100 * platformFeePercent)

      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: stripeAccount.stripe_account_id,
        },
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams)

    // 7. Update booking with Stripe session ID (for tracking)
    await supabase
      .from('bookings')
      .update({ notes: `stripe_session:${checkoutSession.id}` })
      .eq('id', booking.id)

    return {
      success: true,
      bookingId: booking.id,
      checkoutUrl: checkoutSession.url || undefined,
    }
  } catch (stripeError) {
    console.error('Stripe error:', stripeError)

    // Rollback: Delete the pending booking
    await supabase.from('bookings').delete().eq('id', booking.id)

    return {
      success: false,
      error: 'Error al procesar el pago. Por favor, intenta de nuevo.',
      errorCode: 'STRIPE_ERROR',
    }
  }
}
