import { resend, EMAIL_CONFIG, isEmailServiceConfigured } from './resend'
import type { EmailData, EmailSendResult } from '@/types/scheduling'

/**
 * Retry delays in milliseconds: 1 minute, 5 minutes, 15 minutes
 */
const RETRY_DELAYS = [60_000, 300_000, 900_000] as const

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Logs email details in dry-run mode
 */
function logEmailDryRun(emailData: EmailData): void {
  console.log('[Email DRY-RUN] Would send email:')
  console.log(`  To: ${emailData.to}`)
  console.log(`  Subject: ${emailData.subject}`)
  console.log(`  Attachments: ${emailData.attachments?.length ?? 0}`)
  if (emailData.attachments) {
    emailData.attachments.forEach((att, i) => {
      console.log(`    [${i + 1}] ${att.filename}`)
    })
  }
}

/**
 * Sends an email with automatic retry on failure
 *
 * Uses exponential backoff: 1 min, 5 min, 15 min
 * Stops after 3 failed retries
 *
 * @param emailData - Email data including recipient, subject, body, and attachments
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Result indicating success/failure with retry count
 *
 * @example
 * const result = await sendEmailWithRetry({
 *   to: 'user@example.com',
 *   subject: 'Your session is confirmed',
 *   html: '<h1>Hello!</h1>',
 *   attachments: [{ filename: 'invite.ics', content: icsContent }]
 * })
 */
export async function sendEmailWithRetry(
  emailData: EmailData,
  maxRetries: number = 3
): Promise<EmailSendResult> {
  // Dry-run mode: log and return success
  if (EMAIL_CONFIG.DRY_RUN || !isEmailServiceConfigured()) {
    logEmailDryRun(emailData)
    return {
      success: true,
      messageId: `dry-run-${Date.now()}`,
      retryCount: 0,
    }
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend!.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        attachments: emailData.attachments?.map((att) => ({
          filename: att.filename,
          content: typeof att.content === 'string' ? Buffer.from(att.content) : att.content,
        })),
      })

      // Resend returns { data, error } structure
      if (result.error) {
        throw new Error(result.error.message)
      }

      return {
        success: true,
        messageId: result.data?.id,
        retryCount: attempt,
      }
    } catch (error) {
      lastError = error as Error

      console.error(`[Email] Send failed (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError.message)

      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        const delay = RETRY_DELAYS[attempt] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1]
        console.log(`[Email] Retrying in ${delay / 1000} seconds...`)
        await sleep(delay)
      }
    }
  }

  // All retries exhausted
  console.error(`[CRITICAL] Email send failed after ${maxRetries} retries:`, {
    to: emailData.to,
    subject: emailData.subject,
    error: lastError?.message,
  })

  return {
    success: false,
    error: lastError?.message ?? 'Unknown error',
    retryCount: maxRetries,
  }
}

/**
 * Sends an email immediately without retry
 * Use this for non-critical emails or testing
 */
export async function sendEmailNoRetry(emailData: EmailData): Promise<EmailSendResult> {
  return sendEmailWithRetry(emailData, 0)
}
