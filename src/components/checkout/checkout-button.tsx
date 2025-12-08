'use client'

/**
 * CheckoutButton
 * MYM-24: Initiates Stripe Checkout redirect
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Loader2 } from 'lucide-react'
import type { CreateCheckoutSessionResponse, PaymentAPIError } from '@/types/payments'

interface CheckoutButtonProps {
  bookingId: string
  amount: number
  disabled?: boolean
}

export function CheckoutButton({ bookingId, amount, disabled }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ booking_id: bookingId }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as PaymentAPIError
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { checkout_url } = data as CreateCheckoutSessionResponse

      // Redirect to Stripe Checkout
      window.location.href = checkout_url
    } catch (err) {
      console.error('[Checkout] Error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        data-testid="checkout_button"
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting to checkout...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay ${amount.toFixed(2)} with Stripe
          </>
        )}
      </Button>

      {error && (
        <p data-testid="checkout_error" className="text-sm text-destructive text-center">
          {error}
        </p>
      )}
    </div>
  )
}
