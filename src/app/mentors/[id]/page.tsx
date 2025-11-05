import { notFound } from "next/navigation";
import Image from "next/image";
import { getMentorById } from "@/lib/data";
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

export default async function MentorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mentor = getMentorById(id);

  if (!mentor) {
    notFound();
  }

  const { profile } = mentor;

  // Mock reviews data
  const mockReviews = [
    {
      id: "1",
      reviewerName: "Laura García",
      rating: 5,
      comment:
        "Excelente mentor. Me ayudó a resolver un problema complejo de arquitectura y aprendí muchísimo en una sola sesión.",
      date: "Hace 2 semanas",
    },
    {
      id: "2",
      reviewerName: "David Martínez",
      rating: 5,
      comment:
        "Muy profesional y paciente. Explica conceptos complejos de forma clara. 100% recomendado.",
      date: "Hace 1 mes",
    },
    {
      id: "3",
      reviewerName: "Ana Torres",
      rating: 4,
      comment:
        "Gran experiencia. La sesión fue muy productiva y obtuve feedback valioso para mi proyecto.",
      date: "Hace 2 meses",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {mentor.photoUrl ? (
                  <div className="relative h-32 w-32 rounded-full overflow-hidden ring-4 ring-background">
                    <Image
                      src={mentor.photoUrl}
                      alt={mentor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold ring-4 ring-background">
                    {mentor.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{mentor.name}</h1>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center text-lg">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-bold mr-1">
                      {profile.averageRating}
                    </span>
                    <span className="text-muted-foreground">
                      ({profile.totalReviews} reviews)
                    </span>
                  </div>

                  {profile.yearsOfExperience && (
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{profile.yearsOfExperience} años de experiencia</span>
                    </div>
                  )}

                  {profile.isVerified && (
                    <Badge className="bg-green-600">✓ Verificado</Badge>
                  )}
                </div>

                <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
                  {mentor.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.specialties.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-3">
                  {profile.linkedinUrl && (
                    <a
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
              <Card className="w-full md:w-80 flex-shrink-0">
                <CardHeader>
                  <CardTitle className="text-3xl">
                    ${profile.hourlyRate}
                    <span className="text-base font-normal text-muted-foreground">
                      /hora
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg" disabled>
                    <Calendar className="mr-2 h-5 w-5" />
                    Agendar Sesión
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    El sistema de booking estará disponible próximamente
                  </p>

                  <div className="pt-4 border-t space-y-3 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      Sesiones de 1 hora
                    </div>
                    <div className="flex items-center text-muted-foreground">
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
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">
            Reviews ({profile.totalReviews})
          </h2>

          <div className="space-y-6">
            {mockReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold">{review.reviewerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {review.date}
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
