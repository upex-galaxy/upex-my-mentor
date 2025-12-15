'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Mail, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null)

    try {
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/password-reset/confirm`,
        }
      )

      // Always show success message to prevent user enumeration
      // Even if email doesn't exist, Supabase returns success
      if (supabaseError) {
        // Only show error for rate limiting or network issues
        if (supabaseError.message.includes('rate')) {
          setError('Demasiados intentos. Espera unos minutos antes de intentar de nuevo.')
          return
        }
        // For other errors, still show success to prevent enumeration
      }

      setIsSubmitted(true)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    }
  }

  if (isSubmitted) {
    return (
      <div data-testid="success_message" className="space-y-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Revisa tu correo</h3>
          <p className="text-sm text-muted-foreground">
            Si existe una cuenta con este email, recibirás un enlace de
            recuperación en los próximos minutos. Revisa también tu carpeta de
            spam.
          </p>
        </div>
        <Link
          href="/login"
          data-testid="back_to_login_link"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <form data-testid="forgotPasswordForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert data-testid="error_alert" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            data-testid="email_input"
            type="email"
            placeholder="tu@email.com"
            className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
            {...register('email')}
            disabled={isSubmitting}
          />
        </div>
        {errors.email && (
          <p data-testid="email_error" className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button data-testid="submit_button" type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar enlace de recuperación'
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          data-testid="back_to_login_link"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a iniciar sesión
        </Link>
      </div>
    </form>
  )
}
