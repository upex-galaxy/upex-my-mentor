// MYM-12: Edge Function to send email notifications for mentor vetting status changes
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface VettingEmailPayload {
  mentor_id: string;
  mentor_email: string;
  mentor_name: string;
  action: "approved" | "rejected";
  rejection_reason?: string;
}

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: VettingEmailPayload = await req.json();

    // Validate payload
    if (!payload.mentor_email || !payload.action) {
      return new Response(
        JSON.stringify({ error: "Invalid payload: missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine template and subject
    const { subject, html } = getEmailContent(payload);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "Upex My Mentor <noreply@upexgalaxy.com>",
      to: payload.mentor_email,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Email sent successfully to ${payload.mentor_email}`, data);

    return new Response(
      JSON.stringify({ success: true, message_id: data?.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function getEmailContent(payload: VettingEmailPayload): {
  subject: string;
  html: string;
} {
  if (payload.action === "approved") {
    return {
      subject: "Your Mentor Application Has Been Approved!",
      html: getApprovalEmailTemplate(payload.mentor_name),
    };
  } else {
    return {
      subject: "Update on Your Mentor Application",
      html: getRejectionEmailTemplate(
        payload.mentor_name,
        payload.rejection_reason
      ),
    };
  }
}

function getApprovalEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Congratulations, ${name}!</h1>
        </div>
        <div class="content">
          <p>Great news! Your mentor application on <strong>Upex My Mentor</strong> has been approved.</p>
          <p>You're now part of our community of verified mentors. Students can now discover your profile and book mentorship sessions with you.</p>
          <h3>What's Next?</h3>
          <ul>
            <li>Complete your profile with a detailed bio and photo</li>
            <li>Set your availability for sessions</li>
            <li>Review your hourly rate and specialties</li>
          </ul>
          <p>We're excited to have you on board and look forward to seeing you help students grow in their careers!</p>
          <a href="https://my-mentor.upexgalaxy.com/dashboard" class="button">Go to Dashboard</a>
        </div>
        <div class="footer">
          <p>Upex My Mentor - Connecting Students with Expert Mentors</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getRejectionEmailTemplate(
  name: string,
  reason?: string
): string {
  const reasonSection = reason
    ? `<p><strong>Feedback from our team:</strong></p><p style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-style: italic;">${reason}</p>`
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6b7280; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Update on Your Application</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for your interest in becoming a mentor on <strong>Upex My Mentor</strong>.</p>
          <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
          ${reasonSection}
          <p>We encourage you to:</p>
          <ul>
            <li>Update your LinkedIn profile with more details about your experience</li>
            <li>Add projects to your GitHub showcasing your expertise</li>
            <li>Consider reapplying in the future with an enhanced profile</li>
          </ul>
          <p>If you have questions or believe this decision was made in error, please reach out to our support team.</p>
          <p>Best regards,<br>The Upex My Mentor Team</p>
        </div>
        <div class="footer">
          <p>Upex My Mentor - Connecting Students with Expert Mentors</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
