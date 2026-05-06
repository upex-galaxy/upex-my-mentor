import { notFound } from "next/navigation";
import Image from "next/image";
import { createServer } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * MYM-97: Student Profile Page
 * Allows mentors to view basic information about their students
 */
export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServer();

  // Fetch student profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, photo_url, description, role, created_at')
    .eq('id', id)
    .eq('role', 'student')
    .single();

  if (error || !profile) {
    notFound();
  }

  const memberSince = profile.created_at
    ? format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: es })
    : null;

  return (
    <div data-testid="studentProfilePage" className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-900/40 dark:via-fuchsia-900/20 dark:to-violet-900/40 py-12">
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
                      alt={profile.name || 'Estudiante'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                      {profile.name?.charAt(0) || 'E'}
                    </div>
                  )}
                </div>

                {/* Name and Role Badge */}
                <h1 data-testid="student_name" className="mt-4 text-2xl font-bold text-center">
                  {profile.name || 'Estudiante'}
                </h1>

                <Badge
                  data-testid="role_badge"
                  variant="secondary"
                  className="mt-2 gap-1"
                >
                  <GraduationCap className="h-3 w-3" />
                  Estudiante
                </Badge>

                {/* Member since */}
                {memberSince && (
                  <div data-testid="member_since" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde {memberSince}</span>
                  </div>
                )}

                {/* Description/Bio */}
                {profile.description && (
                  <div data-testid="bio_section" className="mt-6 w-full">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      Acerca de
                    </div>
                    <p data-testid="bio_text" className="text-sm text-muted-foreground leading-relaxed">
                      {profile.description}
                    </p>
                  </div>
                )}

                {/* Empty state if no description */}
                {!profile.description && (
                  <p data-testid="empty_bio_message" className="mt-6 text-sm text-muted-foreground text-center">
                    Este estudiante aún no ha agregado una descripción.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
