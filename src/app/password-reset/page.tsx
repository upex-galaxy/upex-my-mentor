import type { Metadata } from 'next'
import { KeyRound } from 'lucide-react'

import { Navbar } from '@/components/layout/navbar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Recuperar Contraseña | Upex My Mentor',
  description:
    'Recupera el acceso a tu cuenta de Upex My Mentor. Te enviaremos un enlace para crear una nueva contraseña.',
}

export default function PasswordResetPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription>
              Te enviaremos un enlace para crear una nueva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
