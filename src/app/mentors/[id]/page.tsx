import { notFound } from "next/navigation";
import Image from "next/image";
import { createServer } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  Briefcase,
  MapPin,
  Linkedin,
  Github,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";
import type { Mentor } from "@/types";
import type { Database } from "@/types/supabase";

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'] & {
  reviewer: { name: string | null } | null;
};

// Helper to transform DB profile to Mentor domain type
function transformToMentor(profile: ProfileRow): Mentor {
  return {
    id: profile.id,
    email: profile.email!,
    name: profile.name!,
    role: "mentor",
    photoUrl: profile.photo_url || undefined,
    description: profile.description || undefined,
    createdAt: new Date(profile.created_at!),
    profile: {
      userId: profile.id,
      specialties: profile.specialties || [],
      hourlyRate: profile.hourly_rate || 0,
      linkedinUrl: profile.linkedin_url || undefined,
      githubUrl: profile.github_url || undefined,
      isVerified: profile.is_verified || false,
      averageRating: profile.average_rating || 0,
      totalReviews: profile.total_reviews || 0,
      yearsOfExperience: profile.years_of_experience || 0,
    },
  };
}

// Helper to format review date
function formatReviewDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 7) {
    return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `Hace ${months} mes${months !== 1 ? 'es' : ''}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `Hace ${years} año${years !== 1 ? 's' : ''}`;
  }
}

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServer();

  // Fetch mentor with reviews
  const { data: mentorData, error: mentorError } = await supabase
    .from('profiles')
    .select(`
      *,
      reviews:reviews!fk_subject (
        id,
        rating,
        comment,
        created_at,
        reviewer:reviewer_id (name)
      )
    `)
    .eq('id', id)
    .eq('role', 'mentor')
    .single();

  if (mentorError || !mentorData) {
    notFound();
  }

  const mentor = transformToMentor(mentorData);
  const reviews = (mentorData.reviews as unknown as ReviewRow[]) || [];

  const { profile } = mentor;

  return (
    <div data-testid="mentorDetailPage" className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div data-testid="profile_hero" className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {mentor.photoUrl ? (
                  <div data-testid="avatar_image" className="relative h-32 w-32 rounded-full overflow-hidden ring-4 ring-background">
                    <Image
                      src={mentor.photoUrl}
                      alt={mentor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div data-testid="avatar_image" className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold ring-4 ring-background">
                    {mentor.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 data-testid="name_text" className="text-4xl font-bold mb-2">{mentor.name}</h1>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div data-testid="rating_display" className="flex items-center text-lg">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-bold mr-1">
                      {profile.averageRating}
                    </span>
                    <span data-testid="reviews_count" className="text-muted-foreground">
                      ({profile.totalReviews} reviews)
                    </span>
                  </div>

                  {profile.yearsOfExperience && (
                    <div data-testid="experience_text" className="flex items-center text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{profile.yearsOfExperience} años de experiencia</span>
                    </div>
                  )}

                  {profile.isVerified && (
                    <Badge data-testid="verified_badge" className="bg-green-600">✓ Verificado</Badge>
                  )}
                </div>

                <p data-testid="description_text" className="text-lg text-muted-foreground mb-6 max-w-3xl">
                  {mentor.description}
                </p>

                {/* Skills */}
                <div data-testid="skills_container" className="flex flex-wrap gap-2 mb-6">
                  {profile.specialties.map((skill) => (
                    <Badge key={skill} data-testid="skill_badge" variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-3">
                  {profile.linkedinUrl && (
                    <a
                      data-testid="linkedin_link"
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-4 w-4 mr-1" />
                      LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      data-testid="github_link"
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="h-4 w-4 mr-1" />
                      GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Booking Card */}
              <Card data-testid="booking_card" className="w-full md:w-80 flex-shrink-0">
                <CardHeader>
                  <CardTitle data-testid="hourly_rate" className="text-3xl">
                    ${profile.hourlyRate}
                    <span className="text-base font-normal text-muted-foreground">
                      /hora
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button data-testid="book_button" className="w-full" size="lg" disabled>
                    <Calendar className="mr-2 h-5 w-5" />
                    Agendar Sesión
                  </Button>
                  <p data-testid="unavailable_note" className="text-xs text-center text-muted-foreground">
                    El sistema de booking estará disponible próximamente
                  </p>

                  <div className="pt-4 border-t space-y-3 text-sm">
                    <div data-testid="session_duration" className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      Sesiones de 1 hora
                    </div>
                    <div data-testid="cancellation_policy" className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Cancela hasta 24h antes
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div data-testid="reviews_section" className="container mx-auto px-4 py-12">
          <h2 data-testid="reviews_title" className="text-2xl font-bold mb-6">
            Reviews ({profile.totalReviews})
          </h2>

          {reviews.length > 0 ? (
            <div data-testid="reviews_list" className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} data-testid="review_item">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">
                          {review.reviewer?.name || 'Usuario anónimo'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatReviewDate(review.created_at!)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div data-testid="reviews_empty_state" className="text-center py-12">
              <p className="text-muted-foreground">
                Este mentor aún no tiene reviews.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
