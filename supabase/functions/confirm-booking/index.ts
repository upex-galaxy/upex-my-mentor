import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { ICalCalendar, ICalEvent, ICalEventStatus, ICalOrganizer, ICalAttendee, ical } from 'ical-generator';
import { Resend } from '@resend/deno';

console.log(`Function "confirm-booking" up and running!`);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'Booking ID is required.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    );

    // 1. Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        id,
        session_datetime,
        duration_minutes,
        mentor_id,
        mentee_id,
        mentors (id, name, email, timezone),
        users (id, name, email, timezone)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError?.message || 'Booking not found');
      return new Response(JSON.stringify({ error: bookingError?.message || 'Booking not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const mentee = booking.users;
    const mentor = booking.mentors;

    if (!mentee || !mentor) {
      console.error('Mentee or Mentor data not found for booking:', bookingId);
      return new Response(JSON.stringify({ error: 'Mentee or Mentor data not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Generate email content and .ics for mentee
    const sessionStart = new Date(booking.session_datetime);
    const sessionEnd = new Date(sessionStart.getTime() + booking.duration_minutes * 60 * 1000);
    const menteeLocalTime = formatInTimeZone(sessionStart, mentee.timezone, 'MMMM dd, yyyy, h:mm a zzz');
    const mentorLocalTime = formatInTimeZone(sessionStart, mentor.timezone, 'MMMM dd, yyyy, h:mm a zzz');

    const menteeEmailSubject = `Your session with ${mentor.name} is confirmed!`;
    const menteeEmailBody = `
Hi ${mentee.name},

Great news! Your ${booking.duration_minutes}-minute session with **${mentor.name}** is confirmed.

**When:** ${menteeLocalTime}
**Link:** [Link to Video Call]  // TODO: Replace with actual video call link

We\'ve attached a calendar invite to this email.
    `;

    const mentorEmailSubject = `Your session with ${mentee.name} is confirmed!`;
    const mentorEmailBody = `
Hi ${mentor.name},

Great news! Your ${booking.duration_minutes}-minute session with **${mentee.name}** is confirmed.

**When:** ${mentorLocalTime}
**Link:** [Link to Video Call]  // TODO: Replace with actual video call link

We\'ve attached a calendar invite to this email.
    `;

    const commonIcsDetails = {
      start: sessionStart,
      end: sessionEnd,
      description: `Mentorship session with ${mentee.name} and ${mentor.name}.\nLink: [Link to Video Call]`, // TODO: Replace with actual video call link
      url: '[Link to Platform/Booking] ', // TODO: Replace with actual platform/booking link
      organizer: {
        name: Deno.env.get('FROM_NAME') ?? 'Upex My Mentor',
        email: Deno.env.get('FROM_EMAIL') ?? 'confirmations@upexmymentor.com',
      },
      attendees: [
        { name: mentee.name, email: mentee.email, rsvp: true },
        { name: mentor.name, email: mentor.email, rsvp: true },
      ],
      status: ICalEventStatus.CONFIRMED,
    };

    const menteeCal = ical({ name: menteeEmailSubject, timezone: mentee.timezone });
    menteeCal.createEvent({
      ...commonIcsDetails,
      summary: `Mentorship Session with ${mentor.name}`,
    });

    const mentorCal = ical({ name: mentorEmailSubject, timezone: mentor.timezone });
    mentorCal.createEvent({
      ...commonIcsDetails,
      summary: `Mentorship Session with ${mentee.name}`,
    });

    const menteeIcs = menteeCal.toString();
    const mentorIcs = mentorCal.toString();

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'confirmations@upexmymentor.com';
    const FROM_NAME = Deno.env.get('FROM_NAME') ?? 'Upex My Mentor';

    // Helper function for sending email with retry logic
    const sendEmailWithRetry = async (to: string, subject: string, html: string, attachments: any[], retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const { data, error } = await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject: subject,
            html: html,
            attachments: attachments,
          });

          if (error) {
            throw new Error(error.message);
          }
          console.log(`Email sent successfully to ${to}.`);
          return true;
        } catch (error) {
          console.error(`Attempt ${i + 1} failed for ${to}:`, error.message);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 5; // Exponential backoff
          }
        }
      }
      console.error(`Failed to send email to ${to} after ${retries} attempts.`);
      return false;
    };

    // Send email to mentee
    const menteeEmailSent = await sendEmailWithRetry(
      mentee.email,
      menteeEmailSubject,
      menteeEmailBody,
      [
        {
          filename: 'session.ics',
          content: menteeIcs,
          contentType: 'text/calendar',
        },
      ],
    );

    // Send email to mentor
    const mentorEmailSent = await sendEmailWithRetry(
      mentor.email,
      mentorEmailSubject,
      mentorEmailBody,
      [
        {
          filename: 'session.ics',
          content: mentorIcs,
          contentType: 'text/calendar',
        },
      ],
    );

    if (menteeEmailSent || mentorEmailSent) {
      // Update booking status in Supabase if at least one email was sent successfully
      const { error: updateError } = await supabaseClient
        .from('bookings')
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (updateError) {
        console.error('Error updating booking confirmation_sent_at:', updateError.message);
        return new Response(JSON.stringify({ error: 'Failed to update booking status.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      console.log('Booking confirmation_sent_at updated successfully.');
    }

    return new Response(JSON.stringify({ message: 'Confirmation process completed.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
