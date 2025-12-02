'use client'

import { useEffect, useState } from 'react'
import { LockKeyhole, Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { TokenErrorState } from '@/components/auth/token-error-state'

type TokenState = 'loading' | 'valid' | 'expired' | 'invalid'

export default function ResetPasswordConfirmPage() {
  const [tokenState, setTokenState] = useState<TokenState>('loading')
  const supabase = createClient()

  useEffect(() => {
    // Supabase automatically processes hash params when the page loads
    // and triggers onAuthStateChange with PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Token is valid, user can now set new password
          setTokenState('valid')
        } else if (event === 'SIGNED_IN' && session) {
          // Check if this is a recovery session
          // Sometimes Supabase fires SIGNED_IN instead of PASSWORD_RECOVERY
          const isRecoverySession = session.user?.recovery_sent_at != null
          if (isRecoverySession) {
            setTokenState('valid')
          }
        }
      }
    )

    // Check initial state - if no hash params, token is invalid
    const checkInitialState = async () => {
      // Give Supabase a moment to process the hash params
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // If still loading, check if there's an active session
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // There's a session, check if it's a recovery session
        setTokenState('valid')
      } else {
        // No session and no PASSWORD_RECOVERY event - token is invalid/expired
        setTokenState('invalid')
      }
    }

    checkInitialState()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
        {tokenState === 'loading' && (
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verificando enlace...</p>
            </CardContent>
          </Card>
        )}

        {tokenState === 'valid' && (
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <LockKeyhole className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Crear nueva contraseña</CardTitle>
              <CardDescription>
                Ingresa tu nueva contraseña segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResetPasswordForm />
            </CardContent>
          </Card>
        )}

        {tokenState === 'expired' && <TokenErrorState type="expired" />}

        {tokenState === 'invalid' && <TokenErrorState type="invalid" />}
      </main>
    </div>
  )
}
