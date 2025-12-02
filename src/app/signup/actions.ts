'use server'

import { createServer } from '@/lib/supabase/server'
import { signupSchema, type SignupFormData } from '@/lib/validations/auth'

// Error codes for client-side handling
export type SignupErrorCode =
  | 'VALIDATION_ERROR'
  | 'EMAIL_ALREADY_EXISTS'
  | 'WEAK_PASSWORD'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN_ERROR'

export interface SignupResult {
  success: boolean
  userId?: string
  error?: {
    code: SignupErrorCode
    message: string
    field?: 'email' | 'password' | 'role'
  }
}

export async function signupAction(formData: SignupFormData): Promise<SignupResult> {
  // 1. Validate input with Zod schema
  const validationResult = signupSchema.safeParse(formData)

  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0]
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: firstError.message,
        field: firstError.path[0] as 'email' | 'password' | 'role',
      },
    }
  }

  const { email, password, role } = validationResult.data

  try {
    // 2. Create Supabase server client
    const supabase = await createServer()

    // 3. Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role, // This will be used by the handle_new_user trigger
        },
      },
    })

    // 4. Handle Supabase errors
    if (error) {
      // Map Supabase error codes to our error codes
      if (error.message.includes('already registered') || error.code === 'user_already_exists') {
        return {
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Este email ya tiene una cuenta. ¿Quieres iniciar sesión?',
            field: 'email',
          },
        }
      }

      if (error.message.includes('password') || error.code === 'weak_password') {
        return {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: 'La contraseña no cumple los requisitos de seguridad',
            field: 'password',
          },
        }
      }

      // Generic error
      console.error('Signup error:', error)
      return {
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Error al crear la cuenta. Intenta de nuevo más tarde.',
        },
      }
    }

    // 5. Check if user was created
    if (!data.user) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'No se pudo crear la cuenta. Intenta de nuevo.',
        },
      }
    }

    // 6. Success!
    return {
      success: true,
      userId: data.user.id,
    }
  } catch (error) {
    console.error('Unexpected signup error:', error)
    return {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Error inesperado. Intenta de nuevo más tarde.',
      },
    }
  }
}
