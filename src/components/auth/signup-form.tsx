'use client'

import { useState, useTransition } from 'react'
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
import { signupAction, type SignupResult } from '@/app/signup/actions'

interface SignupFormProps {
  defaultRole?: 'mentor' | 'student'
}

export function SignupForm({ defaultRole }: SignupFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
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

  const onSubmit = (data: SignupFormData) => {
    setServerError(null)

    startTransition(async () => {
      const result: SignupResult = await signupAction(data)

      if (result.success) {
        // Redirect to dashboard on success
        router.push('/dashboard')
        router.refresh()
      } else if (result.error) {
        // Handle specific field errors
        if (result.error.field === 'email' && result.error.code === 'EMAIL_ALREADY_EXISTS') {
          setServerError(result.error.message)
        } else {
          setServerError(result.error.message)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Server Error Alert */}
      {serverError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
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
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          className={errors.email ? 'border-destructive' : ''}
          {...register('email')}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <PasswordInput
          id="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}

        {/* Password Strength Indicator */}
        {password && <PasswordStrengthIndicator password={password} className="mt-3" />}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
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
        <Link href="/login" className="text-primary hover:underline font-medium">
          Inicia sesión
        </Link>
      </div>
    </form>
  )
}
