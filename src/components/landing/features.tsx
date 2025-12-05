import { Shield, Clock, DollarSign, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Mentores Verificados",
    description:
      "Todos nuestros mentores pasan por un riguroso proceso de verificación de credenciales y experiencia.",
  },
  {
    icon: Clock,
    title: "Horarios Flexibles",
    description:
      "Agenda sesiones que se ajusten a tu zona horaria y disponibilidad. Tú tienes el control.",
  },
  {
    icon: DollarSign,
    title: "Transparencia de Precios",
    description:
      "Conoce la tarifa por hora de cada mentor antes de agendar. Sin costos ocultos.",
  },
  {
    icon: MessageSquare,
    title: "Sistema de Reputación",
    description:
      "Valoraciones bidireccionales que aseguran calidad tanto de mentores como de estudiantes.",
  },
];

export function Features() {
  return (
    <section data-testid="featuresSection" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 data-testid="section_title" className="text-3xl font-bold mb-4 sm:text-4xl">
            ¿Por qué Upex My Mentor?
          </h2>
          <p data-testid="section_description" className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una plataforma diseñada para garantizar confianza, calidad y
            resultados en cada interacción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              data-testid="feature_card"
              className="border-2 hover:border-primary/50 transition-colors"
            >
              <CardContent className="pt-8 pb-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
