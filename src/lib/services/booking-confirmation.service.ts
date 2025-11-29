import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { EmailService } from './email.service';

interface BookingConfirmationResult {
  success: boolean;
  mentorEmailSent: boolean;
  menteeEmailSent: boolean;
  error?: string;
}

export class BookingConfirmationService {
  /**
   * Send confirmation emails for a booking and update the database
   * @param bookingId - The ID of the booking to confirm
   * @returns Result of the confirmation process
   */
  static async sendConfirmationEmails(bookingId: string): Promise<BookingConfirmationResult> {
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration is missing');
      }

      const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

      // Fetch booking details with mentor and mentee information
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(
          `
          id,
          session_date,
          duration_minutes,
          videocall_url,
          status,
          mentor:profiles!bookings_mentor_id_fkey(id, name, email),
          mentee:profiles!bookings_student_id_fkey(id, name, email)
        `
        )
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        throw new Error(`Booking not found: ${bookingError?.message || 'Unknown error'}`);
      }

      // Validate booking status
      if (booking.status !== 'confirmed') {
        throw new Error(`Booking status is not 'confirmed': ${booking.status}`);
      }

      // Validate required fields
      if (!booking.videocall_url) {
        throw new Error('Booking does not have a videocall URL');
      }

      const mentor = Array.isArray(booking.mentor) ? booking.mentor[0] : booking.mentor;
      const mentee = Array.isArray(booking.mentee) ? booking.mentee[0] : booking.mentee;

      if (!mentor || !mentee) {
        throw new Error('Could not fetch mentor or mentee information');
      }

      if (!mentor.name || !mentor.email || !mentee.name || !mentee.email) {
        throw new Error('Mentor or mentee is missing required information (name/email)');
      }

      // Default timezone to UTC if not available (should be enhanced to support user-specific timezones)
      const mentorTimezone = 'America/New_York'; // TODO: Get from user profile
      const menteeTimezone = 'America/Los_Angeles'; // TODO: Get from user profile

      // Send confirmation emails
      const sessionDatetime = new Date(booking.session_date);
      const emailResult = await EmailService.sendSessionConfirmationEmails({
        sessionDatetime,
        durationMinutes: booking.duration_minutes,
        mentor: {
          name: mentor.name,
          email: mentor.email,
          timezone: mentorTimezone,
        },
        mentee: {
          name: mentee.name,
          email: mentee.email,
          timezone: menteeTimezone,
        },
        videocallUrl: booking.videocall_url,
      });

      // Update booking with confirmation timestamp only if at least one email was sent
      if (emailResult.mentorEmailSent || emailResult.menteeEmailSent) {
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            // Note: confirmation_sent_at field needs to be added to the database schema
            // For now, we'll update the updated_at timestamp
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        if (updateError) {
          console.error('Failed to update booking confirmation timestamp:', updateError);
        }
      }

      return {
        success: emailResult.mentorEmailSent || emailResult.menteeEmailSent,
        mentorEmailSent: emailResult.mentorEmailSent,
        menteeEmailSent: emailResult.menteeEmailSent,
      };
    } catch (error) {
      console.error('Error in sendConfirmationEmails:', error);
      return {
        success: false,
        mentorEmailSent: false,
        menteeEmailSent: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
