import { Search, Calendar, VideoIcon, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Search,
    title: "Encuentra tu Mentor",
    description:
      "Busca y filtra entre mentores verificados por tecnología, experiencia y precio.",
  },
  {
    icon: Calendar,
    title: "Agenda una Sesión",
    description:
      "Selecciona un horario que funcione para ti y reserva tu sesión 1-a-1.",
  },
  {
    icon: VideoIcon,
    title: "Conecta y Aprende",
    description:
      "Únete a la videollamada y recibe mentoría personalizada de alto impacto.",
  },
  {
    icon: Star,
    title: "Deja tu Feedback",
    description:
      "Valora tu experiencia y ayuda a la comunidad con tu opinión honesta.",
  },
];

export function HowItWorks() {
  return (
    <section data-testid="howItWorksSection" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 data-testid="section_title" className="text-3xl font-bold mb-4 sm:text-4xl">
            Cómo Funciona
          </h2>
          <p data-testid="section_description" className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empezar es simple. Sigue estos pasos para conectar con tu mentor
            ideal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} data-testid="step_card" className="relative">
              <CardContent className="pt-12 pb-8">
                {/* Step Number */}
                <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
                  <step.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
