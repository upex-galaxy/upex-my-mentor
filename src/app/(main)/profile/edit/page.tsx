import { redirect } from 'next/navigation'
import { createServer } from '@/lib/supabase/server'
import { MentorProfileForm } from '@/components/profile/mentor-profile-form'
import { BasicProfileForm } from '@/components/profile/basic-profile-form'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editar Perfil | MyMentor',
  description: 'Edita tu información de perfil',
}

export default async function ProfileEditPage() {
  const supabase = await createServer()

  // 1. Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Obtener perfil del usuario
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  // 3. Renderizar el formulario apropiado según el rol
  const isMentor = profile.role === 'mentor'

  return (
    <div data-testid="editProfilePage" className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-900/40 dark:via-fuchsia-900/20 dark:to-violet-900/40">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          {isMentor ? (
            <MentorProfileForm initialData={profile} />
          ) : (
            <BasicProfileForm initialData={profile} />
          )}
        </div>
      </div>
    </div>
  )
}
