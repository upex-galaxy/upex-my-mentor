'use client'

/**
 * ConnectBankAccountCard
 * MYM-25: Main component for Stripe Connect onboarding
 *
 * Displays the current connection status and provides actions
 * for the mentor to start or continue onboarding.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { StripeConnectStatusBadge } from './stripe-connect-status-badge'
import { Loader2, CreditCard, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import type { StripeConnectStatus, StripeConnectState, StripeOnboardingResult } from '@/types/payments'
import { getConnectState, STRIPE_CONNECT_MESSAGES } from '@/types/payments'

interface ConnectBankAccountCardProps {
  initialStatus: StripeConnectStatus | null
  onboardingResult?: StripeOnboardingResult | null
}

export function ConnectBankAccountCard({
  initialStatus,
  onboardingResult,
}: ConnectBankAccountCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectState = getConnectState(initialStatus)
  const messages = STRIPE_CONNECT_MESSAGES[connectState]

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start onboarding')
      }

      // Redirect to Stripe onboarding
      window.location.href = data.onboarding_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div data-testid="connectBankAccountCard" className="space-y-4">
      {/* Show result alert if coming back from Stripe */}
      {onboardingResult && (
        <OnboardingResultAlert result={onboardingResult} />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle data-testid="connect_card_title">{messages.title}</CardTitle>
                <CardDescription data-testid="connect_card_description" className="mt-1">
                  {messages.description}
                </CardDescription>
              </div>
            </div>
            <StripeConnectStatusBadge state={connectState} />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert data-testid="connect_error_alert" variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <ConnectStateContent
            state={connectState}
            status={initialStatus}
            isLoading={isLoading}
            onConnect={handleConnect}
            buttonText={messages.buttonText}
          />
        </CardContent>
      </Card>
    </div>
  )
}

interface ConnectStateContentProps {
  state: StripeConnectState
  status: StripeConnectStatus | null
  isLoading: boolean
  onConnect: () => void
  buttonText: string | null
}

function ConnectStateContent({
  state,
  status,
  isLoading,
  onConnect,
  buttonText,
}: ConnectStateContentProps) {
  if (state === 'connected') {
    return (
      <div data-testid="connect_state_connected" className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800">Tu cuenta está lista para recibir pagos</p>
          <p className="text-sm text-green-600">
            Los pagos de tus sesiones se depositarán automáticamente en tu cuenta bancaria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="connect_state_content" className="space-y-4">
      {state === 'pending_verification' && (
        <div data-testid="connect_state_pending" className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
          <p className="text-sm text-yellow-800">
            Stripe necesita información adicional para habilitar los pagos.
            Completa la verificación para comenzar a recibir pagos.
          </p>
        </div>
      )}

      {state === 'not_connected' && (
        <div data-testid="connect_state_not_connected" className="space-y-3 text-sm text-muted-foreground">
          <p>Al conectar tu cuenta bancaria:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Recibirás pagos directamente en tu cuenta</li>
            <li>Las transferencias se procesan automáticamente</li>
            <li>Stripe maneja toda la seguridad y cumplimiento</li>
          </ul>
        </div>
      )}

      {buttonText && (
        <Button
          onClick={onConnect}
          disabled={isLoading}
          data-testid="connect_bank_button"
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              {buttonText}
              <ExternalLink className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}

interface OnboardingResultAlertProps {
  result: StripeOnboardingResult
}

function OnboardingResultAlert({ result }: OnboardingResultAlertProps) {
  const config = {
    success: {
      variant: 'default' as const,
      icon: CheckCircle2,
      className: 'border-green-200 bg-green-50',
      iconClassName: 'text-green-600',
    },
    cancel: {
      variant: 'default' as const,
      icon: AlertCircle,
      className: 'border-yellow-200 bg-yellow-50',
      iconClassName: 'text-yellow-600',
    },
    refresh: {
      variant: 'default' as const,
      icon: AlertCircle,
      className: 'border-yellow-200 bg-yellow-50',
      iconClassName: 'text-yellow-600',
    },
  }

  const messages = STRIPE_CONNECT_MESSAGES[result]
  const alertConfig = config[result]
  const Icon = alertConfig.icon

  return (
    <Alert data-testid="onboarding_result_alert" variant={alertConfig.variant} className={alertConfig.className}>
      <Icon className={`h-4 w-4 ${alertConfig.iconClassName}`} />
      <AlertTitle>{messages.title}</AlertTitle>
      <AlertDescription>{messages.message}</AlertDescription>
    </Alert>
  )
}
