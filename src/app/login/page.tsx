"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/auth-context";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navbar } from "@/components/layout/navbar";
import { LogIn, Info, GraduationCap, Briefcase } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const fillMentorDemo = () => {
    setValue("email", "mentor.demo@upexmymentor.com");
    setValue("password", "Demo123!");
  };

  const fillStudentDemo = () => {
    setValue("email", "student.demo@upexmymentor.com");
    setValue("password", "Demo123!");
  };

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setIsLoading(true);

    try {
      await login(data);
      router.push(redirectTo);
    } catch (err) {
      // Error handling - display user-friendly message
      if (err instanceof Error) {
        // Map Supabase error messages to user-friendly Spanish messages
        const errorMessage = err.message;
        if (errorMessage.includes("Invalid login credentials")) {
          setServerError("Email o contraseña incorrectos. Verifica e intenta de nuevo.");
        } else if (errorMessage.includes("Email not confirmed")) {
          setServerError("Por favor verifica tu email antes de iniciar sesión.");
        } else if (errorMessage.includes("Too many requests")) {
          setServerError("Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.");
        } else {
          setServerError("Error al iniciar sesión. Intenta de nuevo.");
        }
      } else {
        setServerError("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      <form onSubmit={handleSubmit(onSubmit)}>
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

          {/* Server Error */}
          {serverError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {serverError}
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="/password-reset"
              className="text-sm text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
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
  );
}

function LoginFormSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-muted animate-pulse" />
        <div className="h-8 bg-muted rounded animate-pulse w-40 mx-auto" />
        <div className="h-4 bg-muted rounded animate-pulse w-64 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-24" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-10 bg-muted rounded animate-pulse w-full" />
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
