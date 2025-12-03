'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordInput } from './password-input'
import { PasswordStrengthIndicator } from './password-strength'

export function ResetPasswordForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        if (updateError.message.includes('same')) {
          setError('La nueva contraseña debe ser diferente a la anterior.')
          return
        }
        setError('Error al actualizar la contraseña. Intenta de nuevo.')
        return
      }

      // Sign out to invalidate all sessions after password reset
      await supabase.auth.signOut()

      // Redirect to login with success message
      router.push('/login?reset=success')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    }
  }

  return (
    <form data-testid="resetPasswordForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert data-testid="error_alert" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Nueva contraseña
        </label>
        <PasswordInput
          id="password"
          data-testid="password_input"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
          disabled={isSubmitting}
        />
        {errors.password && (
          <p data-testid="password_error" className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {password && (
        <PasswordStrengthIndicator password={password} className="mt-2" />
      )}

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar contraseña
        </label>
        <PasswordInput
          id="confirmPassword"
          data-testid="confirm_password_input"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <p data-testid="confirm_password_error" className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button data-testid="submit_button" type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualizando...
          </>
        ) : (
          'Actualizar contraseña'
        )}
      </Button>
    </form>
  )
}
