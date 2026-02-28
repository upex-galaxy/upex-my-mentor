/**
 * Stripe Server Client
 * MYM-25: Server-side Stripe SDK configuration
 *
 * Usage: Import this in API routes and server components
 * DO NOT import in client components (use client-side.ts instead)
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
})

/**
 * Verify Stripe webhook signature
 * Supports both platform webhooks (STRIPE_WEBHOOK_SECRET) and
 * Connect webhooks (STRIPE_WEBHOOK_SECRET_CONNECT)
 *
 * @param body - Raw request body
 * @param signature - Stripe-Signature header
 * @returns Stripe.Event if valid, throws if invalid
 */
export function verifyWebhookSignature(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  const platformSecret = process.env.STRIPE_WEBHOOK_SECRET
  const connectSecret = process.env.STRIPE_WEBHOOK_SECRET_CONNECT

  if (!platformSecret && !connectSecret) {
    throw new Error('Missing webhook secret environment variables')
  }

  // Try platform secret first (most common)
  if (platformSecret) {
    try {
      return stripe.webhooks.constructEvent(body, signature, platformSecret)
    } catch (err) {
      // If Connect secret exists, try it before failing
      if (!connectSecret) throw err
    }
  }

  // Try Connect secret
  if (connectSecret) {
    return stripe.webhooks.constructEvent(body, signature, connectSecret)
  }

  throw new Error('Webhook signature verification failed')
}
