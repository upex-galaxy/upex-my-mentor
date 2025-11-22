"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navbar } from "@/components/layout/navbar";
import { LogIn, Info, GraduationCap, Briefcase } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fillMentorDemo = () => {
    setEmail("mentor.demo@upexmymentor.com");
    setPassword("Demo123!");
  };

  const fillStudentDemo = () => {
    setEmail("student.demo@upexmymentor.com");
    setPassword("Demo123!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Demo Credentials Alert */}
              <Alert className="border-primary/50 bg-primary/5">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary font-semibold mb-3">Credenciales Demo</AlertTitle>
                <AlertDescription className="space-y-3">
                  {/* Mentor Demo */}
                  <div className="p-3 rounded-md bg-background/50 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Mentor (Laura Martínez)</span>
                    </div>
                    <div className="font-mono text-xs space-y-1 mb-2 text-muted-foreground">
                      <div>mentor.demo@upexmymentor.com</div>
                      <div>Demo123!</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fillMentorDemo}
                      className="w-full"
                    >
                      <Briefcase className="h-3 w-3 mr-1" />
                      Usar como Mentor
                    </Button>
                  </div>

                  {/* Student Demo */}
                  <div className="p-3 rounded-md bg-background/50 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Estudiante (Alex García)</span>
                    </div>
                    <div className="font-mono text-xs space-y-1 mb-2 text-muted-foreground">
                      <div>student.demo@upexmymentor.com</div>
                      <div>Demo123!</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fillStudentDemo}
                      className="w-full"
                    >
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Usar como Estudiante
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Regístrate aquí
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
