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
 * @param body - Raw request body
 * @param signature - Stripe-Signature header
 * @returns Stripe.Event if valid, throws if invalid
 */
export function verifyWebhookSignature(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable')
  }

  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )
}
