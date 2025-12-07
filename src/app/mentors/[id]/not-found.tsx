import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function MentorNotFound() {
  return (
    <div
      data-testid="mentor_not_found"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50"
    >
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-3xl font-bold mt-4 mb-2">Mentor no encontrado</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Lo sentimos, no pudimos encontrar este mentor. Puede que el perfil no
          exista o aun no este verificado.
        </p>
        <Link href="/mentors">
          <Button size="lg">
            <Users className="mr-2 h-5 w-5" />
            Explorar Mentores
          </Button>
        </Link>
      </div>
    </div>
  );
}
