import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div data-testid="notFoundPage" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-900/40 dark:via-fuchsia-900/20 dark:to-violet-900/40">
      <div className="text-center px-4">
        <h1 data-testid="error_code" className="text-9xl font-bold gradient-text-simple">
          404
        </h1>
        <h2 data-testid="error_title" className="text-3xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">Página no encontrada</h2>
        <p data-testid="error_description" className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link href="/" data-testid="home_link">
          <Button data-testid="home_button" size="lg">
            <Home className="mr-2 h-5 w-5" />
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
