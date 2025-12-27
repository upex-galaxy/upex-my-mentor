import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function StudentNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
      <div className="text-center px-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
          <GraduationCap className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Estudiante no encontrado</h1>
        <p className="text-muted-foreground mb-6">
          El perfil que buscas no existe o no está disponible.
        </p>
        <Link href="/dashboard">
          <Button>Volver al Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
