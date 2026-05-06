import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServer } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  GraduationCap,
  Calendar,
  User,
  Briefcase,
  DollarSign,
  Shield,
  Pencil,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Perfil | MyMentor',
  description: 'Tu perfil en MyMentor',
}

/**
 * My Profile Page
 * Shows the authenticated user's own profile with an edit button
 */
export default async function MyProfilePage() {
  const supabase = await createServer()

  // 1. Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  const memberSince = profile.created_at
    ? format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: es })
    : null

  // Role badge configuration
  const roleBadgeConfig = {
    student: {
      icon: GraduationCap,
      label: 'Estudiante',
      variant: 'secondary' as const,
    },
    mentor: {
      icon: Briefcase,
      label: 'Mentor',
      variant: 'default' as const,
    },
    admin: {
      icon: Shield,
      label: 'Administrador',
      variant: 'destructive' as const,
    },
  }

  const roleConfig = roleBadgeConfig[profile.role as keyof typeof roleBadgeConfig]
  const RoleIcon = roleConfig?.icon || User

  return (
    <div data-testid="myProfilePage" className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-900/40 dark:via-fuchsia-900/20 dark:to-violet-900/40 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card data-testid="profile_card" className="overflow-hidden">
            {/* Header with gradient background */}
            <div className="h-24 bg-gradient-to-r from-primary to-accent" />

            <CardContent className="relative pt-0 -mt-12">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div data-testid="avatar_container" className="relative h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-background shadow-lg">
                  {profile.photo_url ? (
                    <Image
                      src={profile.photo_url}
                      alt={profile.name || 'Usuario'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                      {profile.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>

                {/* Name and Role Badge */}
                <h1 data-testid="profile_name" className="mt-4 text-2xl font-bold text-center">
                  {profile.name || 'Usuario'}
                </h1>

                <Badge data-testid="role_badge" variant={roleConfig?.variant || 'secondary'} className="mt-2 gap-1">
                  <RoleIcon className="h-3 w-3" />
                  {roleConfig?.label || profile.role}
                </Badge>

                {/* Member since */}
                {memberSince && (
                  <div data-testid="member_since" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde {memberSince}</span>
                  </div>
                )}

                {/* Edit Profile Button */}
                <Button asChild className="mt-6 gap-2" data-testid="edit_profile_button">
                  <Link href="/profile/edit" data-testid="edit_profile_link">
                    <Pencil className="h-4 w-4" />
                    Editar Perfil
                  </Link>
                </Button>

                {/* Description/Bio */}
                {profile.description && (
                  <div data-testid="bio_section" className="mt-6 w-full">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      Acerca de mí
                    </div>
                    <p data-testid="bio_text" className="text-sm text-muted-foreground leading-relaxed">
                      {profile.description}
                    </p>
                  </div>
                )}

                {/* Mentor-specific fields */}
                {profile.role === 'mentor' && (
                  <div data-testid="mentor_details_section" className="mt-6 w-full space-y-4">
                    {/* Hourly Rate */}
                    {profile.hourly_rate && (
                      <div data-testid="hourly_rate" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>${profile.hourly_rate}</strong> / hora
                        </span>
                      </div>
                    )}

                    {/* Years of Experience */}
                    {profile.years_of_experience !== null && (
                      <div data-testid="years_experience" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>{profile.years_of_experience}</strong> años de experiencia
                        </span>
                      </div>
                    )}

                    {/* Specialties */}
                    {profile.specialties && profile.specialties.length > 0 && (
                      <div data-testid="specialties_section" className="w-full">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                          Especialidades
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.specialties.map((skill: string) => (
                            <Badge key={skill} data-testid="specialty_badge" variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty state if no description */}
                {!profile.description && (
                  <p data-testid="empty_bio_message" className="mt-6 text-sm text-muted-foreground text-center">
                    Aún no has agregado una descripción.{' '}
                    <Link href="/profile/edit" data-testid="add_bio_link" className="text-primary hover:underline">
                      Agregar ahora
                    </Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
