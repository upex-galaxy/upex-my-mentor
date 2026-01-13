import type { Metadata } from 'next'
import { KeyRound } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Recuperar Contraseña | MyMentor',
  description:
    'Recupera el acceso a tu cuenta de MyMentor. Te enviaremos un enlace para crear una nueva contraseña.',
}

export default function PasswordResetPage() {
  return (
    <div data-testid="passwordResetPage" className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-900/40 dark:via-fuchsia-900/20 dark:to-violet-900/40">
      <Card data-testid="page_card" className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <CardTitle data-testid="page_title" className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription data-testid="page_description">
              Te enviaremos un enlace para crear una nueva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
    </div>
  )
}
