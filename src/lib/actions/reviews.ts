'use server';

import { createServer } from '@/lib/supabase/server';
import type {
  ReviewSubmission,
  ReviewEligibility,
  BookingForReview,
} from '@/types';

/**
 * Check if a user can leave a review for a specific booking
 * Returns eligibility status and booking details if eligible
 */
export async function checkReviewEligibility(
  bookingId: string
): Promise<ReviewEligibility> {
  const supabase = await createServer();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { canReview: false, reason: 'not_authenticated' };
  }

  // Fetch booking with participant names
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(
      `
      id,
      mentor_id,
      student_id,
      session_date,
      duration_minutes,
      status,
      mentor:profiles!bookings_mentor_id_fkey(name),
      student:profiles!bookings_student_id_fkey(name)
    `
    )
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return { canReview: false, reason: 'booking_not_found' };
  }

  // Check if user is a participant
  const isMentor = booking.mentor_id === user.id;
  const isMentee = booking.student_id === user.id;

  if (!isMentor && !isMentee) {
    return { canReview: false, reason: 'not_participant' };
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    return { canReview: false, reason: 'not_completed' };
  }

  // Check if 1 hour has passed since session end
  const sessionStart = new Date(booking.session_date);
  const sessionEnd = new Date(
    sessionStart.getTime() + booking.duration_minutes * 60 * 1000
  );
  const oneHourAfterEnd = new Date(sessionEnd.getTime() + 60 * 60 * 1000);
  const now = new Date();

  if (now < oneHourAfterEnd) {
    return { canReview: false, reason: 'too_early' };
  }

  // Check if user has already reviewed this booking
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('reviewer_id', user.id)
    .single();

  if (existingReview) {
    return { canReview: false, reason: 'already_reviewed' };
  }

  // User can review - prepare booking data
  const bookingForReview: BookingForReview = {
    id: booking.id,
    mentor_id: booking.mentor_id,
    student_id: booking.student_id,
    mentor_name: (booking.mentor as { name: string | null })?.name ?? null,
    student_name: (booking.student as { name: string | null })?.name ?? null,
    session_date: booking.session_date,
    duration_minutes: booking.duration_minutes,
    status: booking.status,
  };

  return {
    canReview: true,
    booking: bookingForReview,
  };
}

/**
 * Create a new review
 * Validates eligibility again before creating
 */
export async function createReview(
  data: ReviewSubmission
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServer();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    return { success: false, error: 'La valoración debe ser entre 1 y 5' };
  }

  // Validate comment length
  if (data.comment && data.comment.length > 500) {
    return {
      success: false,
      error: 'El comentario no puede exceder 500 caracteres',
    };
  }

  // Re-check eligibility before creating
  const eligibility = await checkReviewEligibility(data.booking_id);

  if (!eligibility.canReview) {
    const errorMessages: Record<string, string> = {
      not_authenticated: 'No autenticado',
      booking_not_found: 'Sesión no encontrada',
      not_participant: 'No tienes permiso para valorar esta sesión',
      not_completed: 'La sesión aún no ha sido completada',
      too_early: 'Podrás dejar tu valoración 1 hora después de completar la sesión',
      already_reviewed: 'Ya dejaste una valoración para esta sesión',
    };

    return {
      success: false,
      error: errorMessages[eligibility.reason || ''] || 'Error desconocido',
    };
  }

  // Create the review
  const { error: insertError } = await supabase.from('reviews').insert({
    booking_id: data.booking_id,
    reviewer_id: user.id,
    subject_id: data.subject_id,
    rating: data.rating,
    comment: data.comment || null,
  });

  if (insertError) {
    console.error('Error creating review:', insertError);

    // Handle unique constraint violation
    if (insertError.code === '23505') {
      return { success: false, error: 'Ya dejaste una valoración para esta sesión' };
    }

    return { success: false, error: 'Error al guardar la valoración' };
  }

  return { success: true };
}

/**
 * Get the role of the current user in a booking
 * Returns 'mentor' | 'mentee' | null
 */
export async function getUserRoleInBooking(
  bookingId: string
): Promise<'mentor' | 'mentee' | null> {
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: booking } = await supabase
    .from('bookings')
    .select('mentor_id, student_id')
    .eq('id', bookingId)
    .single();

  if (!booking) return null;

  if (booking.mentor_id === user.id) return 'mentor';
  if (booking.student_id === user.id) return 'mentee';

  return null;
}
