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
    <div data-testid="communicationSettingsPage" className="bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-900/40 dark:via-fuchsia-900/20 dark:to-violet-900/40 py-8">
        <div className="container mx-auto px-4">
          <Link href="/dashboard" data-testid="back_to_dashboard_link">
            <Button data-testid="back_to_dashboard_button" variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 data-testid="page_title" className="text-3xl font-bold text-gray-900 dark:text-white">Configuración de Canales</h1>
              <p data-testid="page_description" className="text-gray-600 dark:text-gray-300 mt-1">
                Define cómo te comunicarás con tus mentees durante las sesiones de mentoría.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl">
          <CommunicationPreferences />
        </div>
      </div>
    </div>
  )
}
