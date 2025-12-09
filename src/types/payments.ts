/**
 * Payment Types
 * MYM-25: Types for Stripe Connect and payment processing
 */

import type { Database } from './supabase'

// ==========================================
// Database Types (from Supabase schema)
// ==========================================

export type StripeAccount = Database['public']['Tables']['stripe_accounts']['Row']
export type StripeAccountInsert = Database['public']['Tables']['stripe_accounts']['Insert']
export type StripeAccountUpdate = Database['public']['Tables']['stripe_accounts']['Update']

// ==========================================
// Stripe Connect Status
// ==========================================

/**
 * Stripe Connect account status
 * Used to display the mentor's connection status in the UI
 */
export interface StripeConnectStatus {
  /** Whether the mentor has started the Connect process */
  connected: boolean
  /** Stripe Express account ID (null if not connected) */
  stripe_account_id: string | null
  /** Whether Stripe has completed identity verification */
  onboarding_complete: boolean
  /** Whether the account can accept charges */
  charges_enabled: boolean
  /** Whether the account can receive payouts */
  payouts_enabled: boolean
}

/**
 * Stripe Connect onboarding state for UI display
 */
export type StripeConnectState =
  | 'not_connected'      // No Stripe account exists
  | 'pending_verification' // Account created but verification incomplete
  | 'connected'          // Fully connected and ready for payouts

/**
 * Get the display state from connect status
 */
export function getConnectState(status: StripeConnectStatus | null): StripeConnectState {
  if (!status?.connected) return 'not_connected'
  if (!status.payouts_enabled) return 'pending_verification'
  return 'connected'
}

// ==========================================
// API Request/Response Types
// ==========================================

/**
 * Request to start Stripe Connect onboarding
 * POST /api/stripe/connect/onboard
 */
export interface StripeConnectOnboardRequest {
  /** URL to return to after successful onboarding */
  return_url: string
  /** URL to return to if user needs to refresh/retry */
  refresh_url: string
}

/**
 * Response from onboarding endpoint
 */
export interface StripeConnectOnboardResponse {
  /** Stripe-hosted onboarding URL */
  onboarding_url: string
}

/**
 * Response from status endpoint
 * GET /api/stripe/connect/status
 */
export interface StripeConnectStatusResponse {
  status: StripeConnectStatus
}

/**
 * API error response
 */
export interface PaymentAPIError {
  error: string
  details?: string
}

// ==========================================
// Query Parameter Types
// ==========================================

/**
 * Query parameters for the payouts page
 * Used to handle redirects from Stripe
 */
export type StripeOnboardingResult = 'success' | 'cancel' | 'refresh'

export interface PayoutsPageParams {
  stripe_onboarding?: StripeOnboardingResult
}

// ==========================================
// Transaction Types (MYM-24)
// ==========================================

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type TransactionStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

// ==========================================
// Checkout API Types (MYM-24)
// ==========================================

/**
 * Request to create a Stripe Checkout Session
 * POST /api/checkout/session
 */
export interface CreateCheckoutSessionRequest {
  booking_id: string
}

/**
 * Response from checkout session creation
 */
export interface CreateCheckoutSessionResponse {
  checkout_url: string
  session_id: string
}

/**
 * Query parameters for checkout success page
 */
export interface CheckoutSuccessParams {
  session_id?: string
}

/**
 * Query parameters for checkout cancel page
 */
export interface CheckoutCancelParams {
  booking_id?: string
}

// ==========================================
// UI Display Messages
// ==========================================

export const STRIPE_CONNECT_MESSAGES = {
  not_connected: {
    title: 'Connect Bank Account',
    description: 'Connect your bank account to receive payments from your mentoring sessions.',
    buttonText: 'Connect Bank Account',
  },
  pending_verification: {
    title: 'Verification Required',
    description: 'Stripe requires additional information to enable payouts. Please complete your profile on Stripe.',
    buttonText: 'Complete Verification on Stripe',
  },
  connected: {
    title: 'Account Connected',
    description: 'Your account is ready to receive payouts.',
    buttonText: null, // No button needed
  },
  success: {
    title: 'Success!',
    message: 'Your account has been successfully connected for payouts.',
  },
  cancel: {
    title: 'Connection Cancelled',
    message: 'The bank account connection was cancelled. You can try again anytime.',
  },
  refresh: {
    title: 'Session Expired',
    message: 'Your onboarding session expired. Please try again.',
  },
} as const

/**
 * MYM-24: Checkout page messages
 */
export const CHECKOUT_MESSAGES = {
  loading: 'Loading booking details...',
  redirecting: 'Redirecting to secure checkout...',
  success: {
    title: 'Payment Successful!',
    message: 'Your session has been confirmed. Check your email for details.',
  },
  cancel: {
    title: 'Payment Cancelled',
    message: 'Your payment was not completed. Your booking is held for 15 minutes.',
  },
  error: {
    booking_not_found: 'Booking not found. Please try again.',
    booking_expired: 'This booking has expired. Please create a new one.',
    booking_not_pending: 'This booking is not awaiting payment.',
    mentor_not_connected: 'This mentor cannot receive payments yet. Please contact support.',
    payment_failed: 'Payment failed. Please try again or use a different card.',
    generic: 'Something went wrong. Please try again.',
  },
} as const

// ==========================================
// Payout Types (MYM-27)
// ==========================================

export type Payout = Database['public']['Tables']['payouts']['Row']
export type PayoutInsert = Database['public']['Tables']['payouts']['Insert']
export type PayoutUpdate = Database['public']['Tables']['payouts']['Update']

export type PayoutItem = Database['public']['Tables']['payout_items']['Row']
export type PayoutItemInsert = Database['public']['Tables']['payout_items']['Insert']

export type FailedPayout = Database['public']['Tables']['failed_payouts']['Row']
export type FailedPayoutInsert = Database['public']['Tables']['failed_payouts']['Insert']

export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled'

export type PayoutFailureReason =
  | 'MENTOR_ACCOUNT_RESTRICTED'
  | 'MENTOR_ACCOUNT_NOT_FOUND'
  | 'STRIPE_API_ERROR'
  | 'INSUFFICIENT_BALANCE'
  | 'ZERO_AMOUNT'

// ==========================================
// Payout Processing Types
// ==========================================

/**
 * Eligible session for payout processing
 * Returned by the findEligiblePayouts query
 */
export interface EligiblePayout {
  booking_id: string
  transaction_id: string
  mentor_id: string
  net_amount: number
  stripe_account_id: string
  payouts_enabled: boolean
}

/**
 * Result of processing a single payout
 */
export interface PayoutProcessResult {
  booking_id: string
  success: boolean
  payout_id?: string
  stripe_transfer_id?: string
  error?: PayoutFailureReason
  error_details?: string
}

/**
 * Summary of payout job execution
 */
export interface PayoutJobSummary {
  started_at: string
  completed_at: string
  eligible_count: number
  processed_count: number
  success_count: number
  failed_count: number
  skipped_count: number
  results: PayoutProcessResult[]
}

/**
 * MYM-27: Payout notification messages
 */
export const PAYOUT_MESSAGES = {
  success: {
    title: 'Payout Sent!',
    message: 'Your payout has been sent! Funds arrive in 2-7 business days.',
  },
  failed: {
    title: 'Payout Failed',
    message: 'Your payout could not be processed. Please check your Stripe account settings.',
  },
  pending: {
    title: 'Payout Pending',
    message: 'Your payout is being processed.',
  },
} as const
