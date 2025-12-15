import { Resend } from 'resend'

/**
 * Singleton Resend client instance
 *
 * Environment variables required:
 * - RESEND_API_KEY: Your Resend API key
 *
 * @see https://resend.com/docs
 */
function createResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not configured - emails will be logged but not sent')
    return null
  }

  return new Resend(apiKey)
}

export const resend = createResendClient()

/**
 * Email configuration constants
 */
export const EMAIL_CONFIG = {
  /**
   * Sender email address (must be verified in Resend)
   * Using Resend's test domain for development
   */
  FROM_EMAIL: process.env.EMAIL_FROM_ADDRESS || 'MyMentor <onboarding@resend.dev>',

  /**
   * Production sender email (requires domain verification)
   */
  PRODUCTION_FROM_EMAIL: 'MyMentor <confirmations@mymentor.com>',

  /**
   * Whether to use dry-run mode (log instead of send)
   */
  DRY_RUN: process.env.EMAIL_DRY_RUN === 'true' || !process.env.RESEND_API_KEY,
} as const

/**
 * Checks if the email service is properly configured
 */
export function isEmailServiceConfigured(): boolean {
  return resend !== null && !EMAIL_CONFIG.DRY_RUN
}
