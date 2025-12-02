'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface TokenErrorStateProps {
  type?: 'expired' | 'invalid' | 'used'
}

export function TokenErrorState({ type = 'invalid' }: TokenErrorStateProps) {
  const getMessage = () => {
    switch (type) {
      case 'expired':
        return {
          title: 'Enlace expirado',
          description:
            'Este enlace de recuperación ha expirado. Los enlaces son válidos por 1 hora.',
        }
      case 'used':
        return {
          title: 'Enlace ya utilizado',
          description:
            'Este enlace de recuperación ya fue utilizado. Por seguridad, cada enlace solo puede usarse una vez.',
        }
      default:
        return {
          title: 'Enlace inválido',
          description:
            'Este enlace de recuperación no es válido o ya fue utilizado.',
        }
    }
  }

  const message = getMessage()

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-2xl">{message.title}</CardTitle>
        <CardDescription>{message.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full">
          <Link href="/password-reset">
            Solicitar nuevo enlace
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
