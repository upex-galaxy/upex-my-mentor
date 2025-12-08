/**
 * Stripe Client-Side Utilities
 * MYM-25: Client-side Stripe.js loader
 *
 * Usage: Import this in client components for Stripe Elements and redirects
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Get or create the Stripe.js instance
 * Uses singleton pattern to avoid loading multiple times
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

/**
 * Redirect to Stripe Checkout using a Checkout Session URL
 * Modern approach that works with Payment Links and Checkout Sessions
 * @param checkoutUrl - URL returned from creating a Checkout Session
 */
export function redirectToStripeCheckout(checkoutUrl: string): void {
  window.location.href = checkoutUrl
}
