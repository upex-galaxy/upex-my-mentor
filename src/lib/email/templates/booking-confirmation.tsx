import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
  Hr,
  Preview,
  Section,
  Heading,
} from '@react-email/components'
import type { BookingConfirmationEmailProps } from '@/types/scheduling'

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
}

const header = {
  backgroundColor: '#9333EA', // Primary purple
  padding: '24px',
  borderRadius: '8px 8px 0 0',
}

const headerText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  margin: '0',
}

const content = {
  padding: '24px',
}

const heading = {
  fontSize: '20px',
  color: '#1f2937',
  marginBottom: '16px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '16px 0',
}

const sessionDetails = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const detailRow = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '8px 0',
}

const detailLabel = {
  fontWeight: 'bold' as const,
  color: '#1f2937',
}

const button = {
  backgroundColor: '#9333EA',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
  margin: '24px 0',
}

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  marginTop: '32px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

export function BookingConfirmationEmail({
  recipientName,
  recipientRole,
  otherPartyName,
  sessionDate,
  sessionTime,
  timezone,
  durationMinutes,
  videocallUrl,
}: BookingConfirmationEmailProps) {
  const roleLabel = recipientRole === 'mentor' ? 'Mentee' : 'Mentor'
  const previewText = `Your ${durationMinutes}-minute mentorship session with ${otherPartyName} is confirmed!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>Upex My Mentor</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Session Confirmed! 🎉</Heading>

            <Text style={paragraph}>Hi {recipientName},</Text>

            <Text style={paragraph}>
              Great news! Your {durationMinutes}-minute mentorship session is confirmed.
            </Text>

            <Section style={sessionDetails}>
              <Text style={detailRow}>
                <span style={detailLabel}>When:</span> {sessionDate} at {sessionTime} ({timezone})
              </Text>
              <Text style={detailRow}>
                <span style={detailLabel}>{roleLabel}:</span> {otherPartyName}
              </Text>
              <Text style={detailRow}>
                <span style={detailLabel}>Duration:</span> {durationMinutes} minutes
              </Text>
            </Section>

            {videocallUrl ? (
              <Link href={videocallUrl} style={button}>
                Join Video Call
              </Link>
            ) : (
              <Text style={paragraph}>
                The video call link will be provided before the session.
              </Text>
            )}

            <Text style={paragraph}>
              We&apos;ve attached a calendar invite to this email. Click to add it to your calendar.
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              <strong>Need to reschedule?</strong> Please contact your{' '}
              {recipientRole === 'mentor' ? 'mentee' : 'mentor'} directly or visit your dashboard.
            </Text>

            <Text style={footer}>
              See you there!
              <br />
              The Upex My Mentor Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

/**
 * Renders the email template to an HTML string
 */
export async function renderBookingConfirmationEmail(
  props: BookingConfirmationEmailProps
): Promise<string> {
  const { render } = await import('@react-email/components')
  return render(<BookingConfirmationEmail {...props} />)
}
