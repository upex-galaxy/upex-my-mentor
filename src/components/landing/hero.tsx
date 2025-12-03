import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, VideoIcon } from "lucide-react";

export function Hero() {
  return (
    <section data-testid="heroSection" className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-950/20 dark:via-fuchsia-950/20 dark:to-violet-950/20" />

      {/* Content */}
      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div data-testid="badge_text" className="mb-8 inline-flex items-center rounded-full border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-sm">
            <Star className="mr-2 h-4 w-4 fill-primary text-primary" />
            <span className="font-medium">
              Conecta con expertos verificados
            </span>
          </div>

          {/* Headline */}
          <h1 data-testid="headline" className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Acelera tu carrera tech con{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              mentoría personalizada
            </span>
          </h1>

          {/* Subheadline */}
          <p data-testid="subheadline" className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
            Marketplace que conecta ingenieros senior verificados con
            estudiantes y profesionales tech en sesiones 1-a-1 de alto impacto.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/mentors">
              <Button data-testid="explore_mentors_button" size="lg" className="w-full sm:w-auto text-base px-8">
                Explorar Mentores
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button
                data-testid="how_it_works_button"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-8"
              >
                Cómo Funciona
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div data-testid="stats_section" className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div data-testid="stats_mentors" className="flex flex-col items-center">
              <Users className="mb-2 h-8 w-8 text-primary" />
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-muted-foreground">
                Mentores Verificados
              </div>
            </div>
            <div data-testid="stats_sessions" className="flex flex-col items-center">
              <VideoIcon className="mb-2 h-8 w-8 text-primary" />
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm text-muted-foreground">
                Sesiones Completadas
              </div>
            </div>
            <div data-testid="stats_rating" className="flex flex-col items-center">
              <Star className="mb-2 h-8 w-8 fill-primary text-primary" />
              <div className="text-3xl font-bold">4.9/5</div>
              <div className="text-sm text-muted-foreground">
                Valoración Promedio
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
