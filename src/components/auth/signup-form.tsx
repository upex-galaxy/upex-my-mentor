'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/auth/password-input'
import { PasswordStrengthIndicator } from '@/components/auth/password-strength'
import { RoleSelector } from '@/components/auth/role-selector'
import { signupSchema, type SignupFormData } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'

interface SignupFormProps {
  defaultRole?: 'mentor' | 'student'
}

export function SignupForm({ defaultRole }: SignupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      role: defaultRole ?? undefined,
    },
  })

  const password = watch('password', '')
  const selectedRole = watch('role')

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role,
          },
        },
      })

      if (error) {
        // Map Supabase errors to user-friendly messages
        if (error.message.includes('already registered') || error.code === 'user_already_exists') {
          setServerError('Este email ya tiene una cuenta. ¿Quieres iniciar sesión?')
        } else if (error.message.includes('password') || error.code === 'weak_password') {
          setServerError('La contraseña no cumple los requisitos de seguridad')
        } else {
          setServerError('Error al crear la cuenta. Intenta de nuevo más tarde.')
        }
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch {
      setServerError('Error inesperado. Intenta de nuevo más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form data-testid="signupForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Server Error Alert */}
      {serverError && (
        <div data-testid="server_error_alert" className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {serverError}
          {serverError.includes('iniciar sesión') && (
            <Link href="/login" className="block mt-1 text-primary hover:underline font-medium">
              Ir a iniciar sesión
            </Link>
          )}
        </div>
      )}

      {/* Role Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">¿Cómo te gustaría unirte?</label>
        <RoleSelector
          value={selectedRole ?? null}
          onChange={(role) => setValue('role', role, { shouldValidate: true })}
          error={errors.role?.message}
        />
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          data-testid="email_input"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          className={errors.email ? 'border-destructive' : ''}
          {...register('email')}
        />
        {errors.email && <p data-testid="email_error" className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <PasswordInput
          id="password"
          data-testid="password_input"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {errors.password && <p data-testid="password_error" className="text-xs text-red-500">{errors.password.message}</p>}

        {/* Password Strength Indicator */}
        {password && <PasswordStrengthIndicator password={password} className="mt-3" />}
      </div>

      {/* Submit Button */}
      <Button data-testid="submit_button" type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          'Crear cuenta'
        )}
      </Button>

      {/* Login Link */}
      <div className="text-sm text-center text-muted-foreground">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" data-testid="login_link" className="text-primary hover:underline font-medium">
          Inicia sesión
        </Link>
      </div>
    </form>
  )
}
