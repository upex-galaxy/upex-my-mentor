import { Resend } from 'resend';
import { CalendarService } from './calendar.service';

interface EmailRecipient {
  name: string;
  email: string;
  timezone: string;
}

interface SessionEmailData {
  sessionDatetime: Date;
  durationMinutes: number;
  mentor: EmailRecipient;
  mentee: EmailRecipient;
  videocallUrl: string;
}

export class EmailService {
  private static resend: Resend | null = null;
  private static readonly FROM_EMAIL = 'confirmations@upexmymentor.com';
  private static readonly FROM_NAME = 'Upex My Mentor';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [60000, 300000, 900000]; // 1min, 5min, 15min in milliseconds

  /**
   * Initialize Resend client with API key
   */
  private static getResendClient(): Resend {
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY environment variable is not set');
      }
      this.resend = new Resend(apiKey);
    }
    return this.resend;
  }

  /**
   * Send confirmation email to a recipient with retry logic
   */
  private static async sendEmailWithRetry(
    recipientEmail: string,
    subject: string,
    htmlContent: string,
    icsAttachment: Buffer,
    retryCount = 0
  ): Promise<boolean> {
    const resend = this.getResendClient();

    try {
      const result = await resend.emails.send({
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        to: recipientEmail,
        subject,
        html: htmlContent,
        attachments: [
          {
            filename: 'session.ics',
            content: icsAttachment,
          },
        ],
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log(`Email sent successfully to ${recipientEmail}`, { id: result.data?.id });
      return true;
    } catch (error) {
      console.error(`Email send failed (attempt ${retryCount + 1}/${this.MAX_RETRIES}):`, error);

      // Retry logic
      if (retryCount < this.MAX_RETRIES - 1) {
        const delay = this.RETRY_DELAYS[retryCount];
        console.log(`Retrying email send in ${delay / 1000} seconds...`);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        return this.sendEmailWithRetry(
          recipientEmail,
          subject,
          htmlContent,
          icsAttachment,
          retryCount + 1
        );
      }

      // All retries exhausted
      console.error(`Failed to send email to ${recipientEmail} after ${this.MAX_RETRIES} attempts`);
      return false;
    }
  }

  /**
   * Generate email HTML content for session confirmation
   */
  private static generateEmailHTML(
    recipientName: string,
    otherParticipantName: string,
    recipientType: 'mentor' | 'mentee',
    sessionDatetime: Date,
    recipientTimezone: string,
    videocallUrl: string,
    durationMinutes: number
  ): string {
    const formattedDate = CalendarService.formatDateForEmail(sessionDatetime, recipientTimezone);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4F46E5;
              color: white;
              padding: 30px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 30px 20px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .session-details {
              background-color: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .session-details strong {
              color: #4F46E5;
            }
            .cta-button {
              display: inline-block;
              background-color: #4F46E5;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Session Confirmed! 🎉</h1>
          </div>
          
          <div class="content">
            <p>Hi ${recipientName},</p>
            
            <p>Great news! Your ${durationMinutes}-minute session with <strong>${otherParticipantName}</strong> is confirmed.</p>
            
            <div class="session-details">
              <p><strong>When:</strong> ${formattedDate}</p>
              <p><strong>Duration:</strong> ${durationMinutes} minutes</p>
              <p><strong>${recipientType === 'mentor' ? 'Mentee' : 'Mentor'}:</strong> ${otherParticipantName}</p>
            </div>
            
            <p>We've attached a calendar invite to this email so you can easily add it to your calendar.</p>
            
            <p style="text-align: center;">
              <a href="${videocallUrl}" class="cta-button">Join Video Call</a>
            </p>
            
            <p>Looking forward to a great session!</p>
            
            <p>
              Best regards,<br>
              <strong>The Upex My Mentor Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Upex My Mentor. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send confirmation emails to both mentor and mentee
   */
  static async sendSessionConfirmationEmails(data: SessionEmailData): Promise<{
    mentorEmailSent: boolean;
    menteeEmailSent: boolean;
  }> {
    const { sessionDatetime, durationMinutes, mentor, mentee, videocallUrl } = data;

    // Generate .ics files for each recipient (with their respective timezone)
    const mentorICS = CalendarService.generateICS({
      sessionDatetime,
      durationMinutes,
      mentorName: mentor.name,
      menteeName: mentee.name,
      mentorEmail: mentor.email,
      menteeEmail: mentee.email,
      videocallUrl,
      recipientType: 'mentor',
      timezone: mentor.timezone,
    });

    const menteeICS = CalendarService.generateICS({
      sessionDatetime,
      durationMinutes,
      mentorName: mentor.name,
      menteeName: mentee.name,
      mentorEmail: mentor.email,
      menteeEmail: mentee.email,
      videocallUrl,
      recipientType: 'mentee',
      timezone: mentee.timezone,
    });

    // Generate email HTML for mentor
    const mentorHTML = this.generateEmailHTML(
      mentor.name,
      mentee.name,
      'mentor',
      sessionDatetime,
      mentor.timezone,
      videocallUrl,
      durationMinutes
    );

    // Generate email HTML for mentee
    const menteeHTML = this.generateEmailHTML(
      mentee.name,
      mentor.name,
      'mentee',
      sessionDatetime,
      mentee.timezone,
      videocallUrl,
      durationMinutes
    );

    // Send emails (with retry logic)
    const mentorSubject = `Your session with ${mentee.name} is confirmed!`;
    const menteeSubject = `Your session with ${mentor.name} is confirmed!`;

    const [mentorEmailSent, menteeEmailSent] = await Promise.all([
      this.sendEmailWithRetry(mentor.email, mentorSubject, mentorHTML, mentorICS),
      this.sendEmailWithRetry(mentee.email, menteeSubject, menteeHTML, menteeICS),
    ]);

    return {
      mentorEmailSent,
      menteeEmailSent,
    };
  }
}
