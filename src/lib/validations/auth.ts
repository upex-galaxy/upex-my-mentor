import { z } from 'zod'

// Password policy constants (shared across schemas)
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

// Password policy regex patterns
const hasUppercase = /[A-Z]/
const hasNumber = /[0-9]/
const hasSpecialChar = /[^A-Za-z0-9]/

// Base password schema with policy validation
const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(PASSWORD_MAX_LENGTH, `Máximo ${PASSWORD_MAX_LENGTH} caracteres`)
  .regex(hasUppercase, 'Debe incluir una mayúscula')
  .regex(hasNumber, 'Debe incluir un número')
  .regex(hasSpecialChar, 'Debe incluir un símbolo (!@#$%...)')

// Email schema with normalization
const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Ingresa un email válido')
  .transform((val) => val.trim().toLowerCase())

// ===================
// Signup Schema
// ===================
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['mentor', 'student'], {
    required_error: 'Selecciona tu rol',
  }),
})

export type SignupFormData = z.infer<typeof signupSchema>

// ===================
// Login Schema
// ===================
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ===================
// Forgot Password Schema (request reset)
// ===================
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// ===================
// Reset Password Schema (set new password)
// ===================
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// ===================
// Password Strength Helper
// ===================
export interface PasswordRequirement {
  label: string
  met: boolean
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      label: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
      met: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      label: 'Una letra mayúscula',
      met: hasUppercase.test(password),
    },
    {
      label: 'Un número',
      met: hasNumber.test(password),
    },
    {
      label: 'Un símbolo (!@#$%...)',
      met: hasSpecialChar.test(password),
    },
  ]
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordRequirements(password).every((req) => req.met)
}
