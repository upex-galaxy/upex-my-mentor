/**
 * MYM-30: Communication Preferences Page
 *
 * Page for mentors to configure their communication channel preferences.
 */

import { Metadata } from 'next'
import { CommunicationPreferences } from '@/components/settings/communication-preferences'

export const metadata: Metadata = {
  title: 'Preferencias de Comunicación | MyMentor',
  description: 'Configura tus canales de comunicación preferidos para las sesiones de mentoría',
}

export default function CommunicationSettingsPage() {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Configura cómo te comunicarás con tus mentees durante las sesiones.
        </p>
      </div>

      <CommunicationPreferences />
    </div>
  )
}
