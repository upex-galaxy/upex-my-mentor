/**
 * MYM-30: Communication Preferences Page
 *
 * Page for mentors to configure their communication channel preferences.
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import { CommunicationPreferences } from '@/components/settings/communication-preferences'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Preferencias de Comunicación | MyMentor',
  description: 'Configura tus canales de comunicación preferidos para las sesiones de mentoría',
}

export default function CommunicationSettingsPage() {
  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>
      </div>

      {/* Page Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <Settings className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Canales</h1>
          <p className="text-muted-foreground mt-1">
            Define cómo te comunicarás con tus mentees durante las sesiones de mentoría.
          </p>
        </div>
      </div>

      <CommunicationPreferences />
    </div>
  )
}
