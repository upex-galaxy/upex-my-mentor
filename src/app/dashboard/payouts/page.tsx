/**
 * Dashboard Payouts Page
 * MYM-25: Mentor bank account connection and payout management
 *
 * This page allows mentors to:
 * - Connect their bank account via Stripe Connect
 * - View their connection status
 * - Manage their payout settings
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServer } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ConnectBankAccountCard } from '@/components/payments/connect-bank-account-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wallet } from 'lucide-react'
import type { StripeConnectStatus, StripeOnboardingResult } from '@/types/payments'

interface PayoutsPageProps {
  searchParams: Promise<{
    stripe_onboarding?: StripeOnboardingResult
  }>
}

export default async function PayoutsPage({ searchParams }: PayoutsPageProps) {
  const supabase = await createServer()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile to verify they're a mentor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Only mentors can access this page
  if (profile.role !== 'mentor') {
    redirect('/dashboard')
  }

  // Get Stripe Connect status
  const { data: stripeAccount } = await supabase
    .from('stripe_accounts')
    .select('*')
    .eq('mentor_id', user.id)
    .single()

  // Build status object
  const status: StripeConnectStatus | null = stripeAccount
    ? {
        connected: true,
        stripe_account_id: stripeAccount.stripe_account_id,
        onboarding_complete: stripeAccount.onboarding_complete ?? false,
        charges_enabled: stripeAccount.charges_enabled ?? false,
        payouts_enabled: stripeAccount.payouts_enabled ?? false,
      }
    : null

  // Get onboarding result from URL
  const params = await searchParams
  const onboardingResult = params.stripe_onboarding || null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 py-8">
          <div className="container mx-auto px-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Pagos y Transferencias</h1>
                <p className="text-muted-foreground mt-1">
                  Gestiona tu cuenta bancaria y recibe pagos por tus sesiones
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl">
            <ConnectBankAccountCard
              initialStatus={status}
              onboardingResult={onboardingResult}
            />

            {/* Info Section */}
            <div className="mt-8 p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-3">Cómo funcionan los pagos</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">1.</span>
                  <span>
                    Cuando un estudiante reserva una sesión contigo, el pago se procesa de forma segura.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">2.</span>
                  <span>
                    Después de completar la sesión, los fondos se transfieren automáticamente a tu cuenta bancaria.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">3.</span>
                  <span>
                    Las transferencias se procesan en 2-7 días hábiles dependiendo de tu banco.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
