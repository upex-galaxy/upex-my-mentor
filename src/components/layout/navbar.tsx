"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu, Settings } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Upex My Mentor
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/mentors"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Explorar Mentores
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Cómo Funciona
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-muted">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Link href="/profile/edit">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar perfil"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/signup">
                  <Button>Registrarse</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link
              href="/mentors"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explorar Mentores
            </Link>
            <Link
              href="/how-it-works"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cómo Funciona
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="pt-2 space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-muted">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Link href="/profile/edit" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
