// src/pages/api/confirm-booking.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import ical from 'https://esm.sh/ical-generator@6.0.1'
import { formatInTimeZone } from 'https://esm.sh/date-fns-tz@3.1.3'

// --- Supabase Client Initialization ---
// Note: These would typically be loaded from environment variables.
// For this example, they are hardcoded. In a real scenario, use Deno.env.get("SUPABASE_URL")
const supabaseUrl = 'https://ionevzckjyxtpmyenbxc.supabase.co'
const supabaseKey = Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  try {
    const { bookingId } = await req.json()

    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'bookingId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`[+] Processing booking confirmation for: ${bookingId}`)

    // 1. Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        `
        *,
        mentor:mentors(*, user:users(*)),
        mentee:users(*)
      `
      )
      .eq('id', bookingId)
      .single()

    if (bookingError) throw new Error(`Booking fetch error: ${bookingError.message}`)
    if (!booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`[+] Found booking for mentee ${booking.mentee.full_name} with mentor ${booking.mentor.user.full_name}`);
    
    const { mentee, mentor, session_datetime, duration_minutes } = booking
    const sessionDate = new Date(session_datetime)

    // --- Template Data ---
    const mentorName = mentor.user.full_name
    const menteeName = mentee.full_name
    const menteeEmail = mentee.email
    const mentorEmail = mentor.user.email
    const menteeTimezone = mentee.timezone || 'UTC'
    const mentorTimezone = mentor.user.timezone || 'UTC'
    
    // --- .ics File Generation ---
    const calendar = ical({ name: 'Upex My Mentor Session' });

    const createCalendarEvent = (forMentor) => {
      const event = {
        start: sessionDate,
        end: new Date(sessionDate.getTime() + duration_minutes * 60000),
        summary: `Mentorship Session with ${forMentor ? menteeName : mentorName}`,
        description: `Your mentorship session is confirmed. Link: ${booking.video_call_link || 'TBA'}`,
        location: 'Online',
        organizer: { name: 'Upex My Mentor', email: 'confirmations@upexmymentor.com' },
        attendees: [
          { name: menteeName, email: menteeEmail },
          { name: mentorName, email: mentorEmail },
        ],
      };
      calendar.createEvent(event);
    };

    // Generate for mentee (this will be the same file content for both)
    createCalendarEvent(false);
    const icsFileContent = calendar.toString();
    
        // --- Email Sending Logic ---
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable not set.");
    }

    const sendEmail = async (recipientName, recipientEmail, recipientTimezone, isMentor) => {
      const subject = isMentor
        ? `Your session with ${menteeName} is confirmed!`
        : `Your session with ${mentorName} is confirmed!`;

      const formattedTime = formatInTimeZone(sessionDate, recipientTimezone, 'eeee, MMMM d, yyyy, h:mm a zzz');

      const body = `
        <p>Hi ${recipientName},</p>
        <p>Great news! Your ${duration_minutes}-minute session with <strong>${isMentor ? menteeName : mentorName}</strong> is confirmed.</p>
        <p><strong>When:</strong> ${formattedTime}</p>
        <p><strong>Link:</strong> <a href="${booking.video_call_link || '#'}">${booking.video_call_link || 'Link will be provided'}</a></p>
        <p>We've attached a calendar invite to this email.</p>
        <p>Thanks,<br/>The Upex My Mentor Team</p>
      `;

      const attachment = {
        filename: 'session.ics',
        content: btoa(icsFileContent), // Base64 encode the content
      };

      const payload = {
        from: 'Upex My Mentor <confirmations@upexmymentor.com>',
        to: [recipientEmail],
        subject: subject,
        html: body,
        attachments: [attachment],
      };

      console.log(`[+] Sending email to ${recipientEmail}`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Failed to send email to ${recipientEmail}: ${JSON.stringify(errorBody)}`);
      }
      console.log(`[+] Email sent successfully to ${recipientEmail}`);
      return response.json();
    };

    const sendEmailWithRetries = async (recipientName, recipientEmail, recipientTimezone, isMentor) => {
      const maxRetries = 3;
      const initialDelay = 60 * 1000; // 1 minute
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          await sendEmail(recipientName, recipientEmail, recipientTimezone, isMentor);
          return; // Success, exit the loop
        } catch (error) {
          console.error(`[-] Attempt ${attempt + 1} failed for ${recipientEmail}:`, error.message);
          if (attempt < maxRetries) {
            const delay = initialDelay * Math.pow(5, attempt);
            console.log(`[+] Retrying in ${delay / 1000 / 60} minutes...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error(`[-] All ${maxRetries + 1} attempts failed for ${recipientEmail}. Giving up.`);
            // In a real scenario, you would have monitoring/alerting here.
            throw new Error(`Failed to send email to ${recipientEmail} after ${maxRetries + 1} attempts.`);
          }
        }
        attempt++;
      }
    };

    // Send emails to both parties with retry logic
    // We run them in parallel to speed up the process.
    await Promise.all([
        sendEmailWithRetries(menteeName, menteeEmail, menteeTimezone, false),
        sendEmailWithRetries(mentorName, mentorEmail, mentorTimezone, true)
    ]);

    // 6. Update booking with confirmation_sent_at
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ confirmation_sent_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (updateError) {
      // Log this error but don't fail the request, as emails have already been sent.
      // This might require a separate monitoring/alerting mechanism.
      console.error(`[-] Failed to update booking confirmation status for ${bookingId}: ${updateError.message}`);
    } else {
      console.log(`[+] Successfully updated booking ${bookingId} with confirmation timestamp.`);
    }
    
    return new Response(JSON.stringify({ message: `Booking ${bookingId} processed successfully` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[-] Error processing booking:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})