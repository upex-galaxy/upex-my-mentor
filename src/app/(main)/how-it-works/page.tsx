import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  Search,
  Calendar,
  Video,
  Star,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cómo Funciona | MyMentor",
  description:
    "Descubre cómo MyMentor conecta estudiantes con mentores tech verificados para sesiones de mentoría 1-a-1 personalizadas.",
};

const steps = [
  {
    icon: UserPlus,
    title: "1. Crea tu cuenta",
    description:
      "Regístrate gratis como estudiante o mentor. Los mentores pasan por un proceso de verificación para garantizar calidad.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Search,
    title: "2. Explora mentores",
    description:
      "Busca mentores por tecnología, experiencia, idioma y precio. Lee reseñas y encuentra el mentor perfecto para ti.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Calendar,
    title: "3. Agenda una sesión",
    description:
      "Selecciona un horario disponible que se ajuste a tu zona horaria. Paga de forma segura con Stripe.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Video,
    title: "4. Conéctate en vivo",
    description:
      "Únete a tu sesión de videollamada. Comparte pantalla, código y recibe feedback en tiempo real.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Star,
    title: "5. Deja una reseña",
    description:
      "Califica tu experiencia y ayuda a otros estudiantes a encontrar los mejores mentores.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
];

const benefits = {
  students: [
    "Acceso a mentores verificados con experiencia real",
    "Sesiones 1-a-1 personalizadas a tu ritmo",
    "Flexibilidad de horarios y zonas horarias",
    "Reembolso garantizado si cancelas con 24h de anticipación",
    "Sistema de reseñas transparente",
  ],
  mentors: [
    "Comparte tu conocimiento y genera ingresos extra",
    "Tú defines tu tarifa y disponibilidad",
    "Pagos seguros y automáticos vía Stripe",
    "Construye tu reputación con reseñas",
    "Plataforma sin costos de suscripción",
  ],
};

export default function HowItWorksPage() {
  return (
    <>
        {/* Hero Section with Large Logo */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-950/20 dark:via-fuchsia-950/20 dark:to-violet-950/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              {/* Large Logo */}
              <div className="mb-8">
                <Image
                  src="/logo.png"
                  alt="MyMentor Logo"
                  width={200}
                  height={200}
                  className="h-48 w-48 md:h-56 md:w-56 object-contain drop-shadow-2xl"
                  priority
                />
              </div>

              <h1 className="font-[family-name:var(--font-poppins)] text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Cómo Funciona
                </span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mb-8">
                MyMentor conecta estudiantes con mentores tech verificados para
                sesiones de mentoría 1-a-1 que aceleran tu crecimiento profesional.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/signup?role=student">
                  <Button size="lg" className="gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Soy Estudiante
                  </Button>
                </Link>
                <Link href="/signup?role=mentor">
                  <Button size="lg" variant="outline" className="gap-2">
                    <BookOpen className="h-5 w-5" />
                    Soy Mentor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Tu camino hacia el éxito en 5 pasos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {steps.map((step, index) => (
                <Card key={index} className="relative border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div
                      className={`mx-auto mb-4 h-14 w-14 rounded-full ${step.bgColor} flex items-center justify-center`}
                    >
                      <step.icon className={`h-7 w-7 ${step.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>

                  {/* Arrow connector (hidden on last item and mobile) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Beneficios para todos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Students Benefits */}
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-8 pb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Para Estudiantes</h3>
                  </div>

                  <ul className="space-y-3">
                    {benefits.students.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/mentors" className="block mt-6">
                    <Button className="w-full">Explorar Mentores</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Mentors Benefits */}
              <Card className="border-2 border-accent/20">
                <CardContent className="pt-8 pb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold">Para Mentores</h3>
                  </div>

                  <ul className="space-y-3">
                    {benefits.mentors.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/signup?role=mentor" className="block mt-6">
                    <Button variant="outline" className="w-full">
                      Convertirme en Mentor
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Únete a nuestra comunidad de mentores y estudiantes tech.
              Tu próximo salto profesional está a un click de distancia.
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Crear cuenta gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
    </>
  );
}
