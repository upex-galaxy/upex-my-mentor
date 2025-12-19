"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu, Settings, Shield, Wallet, MessageCircle, GraduationCap, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState } from "react";
import { MessagesNavIcon } from "@/components/messaging/messages-nav-icon";

/**
 * Role badge component - shows mentor/student indicator as floating label
 */
function RoleBadge({ role, floating = false }: { role: string; floating?: boolean }) {
  const config = {
    mentor: {
      label: "mentor",
      icon: BookOpen,
      className: "bg-primary text-primary-foreground",
    },
    student: {
      label: "estudiante",
      icon: GraduationCap,
      className: "bg-accent text-accent-foreground",
    },
    admin: {
      label: "admin",
      icon: Shield,
      className: "bg-destructive text-destructive-foreground",
    },
  }[role] || {
    label: role,
    icon: User,
    className: "bg-muted text-muted-foreground",
  };

  const Icon = config.icon;

  const baseClasses = "inline-flex items-center gap-0.5 text-[10px] font-semibold rounded-full shadow-sm";
  const floatingClasses = floating
    ? "absolute -top-3.5 -right-3 px-1.5 py-0.5"
    : "px-2 py-0.5";

  return (
    <span
      className={`${baseClasses} ${floatingClasses} ${config.className}`}
      title={`Rol: ${config.label}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}

/**
 * Get display name with fallback
 */
function getDisplayName(user: { name?: string | null; email: string }): string {
  if (user.name && user.name.trim() !== "") {
    return user.name;
  }
  // Fallback to email username part
  return user.email.split("@")[0];
}

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user ? getDisplayName(user) : "";

  return (
    <nav data-testid="navbar" className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" data-testid="logo_link" className="flex items-center space-x-2">
            <Image
              src="/web-app-manifest-192x192.png"
              alt="MyMentor Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
            <span className="font-[family-name:var(--font-poppins)] font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
              MyMentor
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div data-testid="desktop_nav" className="hidden md:flex items-center space-x-6">
            {/* Public navigation links */}
            <Link
              href="/mentors"
              data-testid="explore_mentors_link"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Explorar Mentores
            </Link>
            <Link
              href="/how-it-works"
              data-testid="how_it_works_link"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Cómo Funciona
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Auth state: Show skeleton while loading to prevent hydration mismatch */}
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
              </div>
            ) : user ? (
              <>
                {/* Primary action: Dashboard */}
                <Link
                  href="/dashboard"
                  data-testid="dashboard_link"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>

                {/* Messages */}
                <MessagesNavIcon />

                {/* Role-specific links */}
                {user.role === "mentor" && (
                  <Link
                    href="/dashboard/payouts"
                    data-testid="payouts_link"
                    className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    Pagos
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link
                    href="/admin/applications"
                    data-testid="admin_link"
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}

                {/* User info section */}
                <div data-testid="user_info" className="flex items-center space-x-2 pl-2 border-l border-border">
                  <div className="relative">
                    <span className="text-sm font-medium">{displayName}</span>
                    <RoleBadge role={user.role} floating />
                  </div>
                  <Link href="/profile/edit">
                    <Button
                      data-testid="settings_button"
                      variant="ghost"
                      size="icon"
                      title="Editar perfil"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    data-testid="logout_button"
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button data-testid="login_button" variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/signup">
                  <Button data-testid="signup_button">Registrarse</Button>
                </Link>
              </>
            )}

            {/* Theme toggle - always at the end */}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              data-testid="mobile_menu_button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div data-testid="mobile_menu" className="md:hidden py-4 space-y-3 border-t">
            {/* User info at top for logged in users */}
            {!isLoading && user && (
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{displayName}</span>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <Link
              href="/mentors"
              data-testid="mobile_explore_mentors_link"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explorar Mentores
            </Link>
            <Link
              href="/how-it-works"
              data-testid="mobile_how_it_works_link"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cómo Funciona
            </Link>

            {isLoading ? (
              <div className="space-y-2 pt-3 border-t border-border">
                <div className="h-10 bg-muted animate-pulse rounded-md" />
                <div className="h-10 bg-muted animate-pulse rounded-md" />
              </div>
            ) : user ? (
              <>
                <div className="border-t border-border pt-3 mt-3">
                  <Link
                    href="/dashboard"
                    data-testid="mobile_dashboard_link"
                    className="block py-2 text-sm font-medium hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/messages"
                    data-testid="mobile_messages_link"
                    className="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Mensajes
                  </Link>

                  {user.role === "mentor" && (
                    <Link
                      href="/dashboard/payouts"
                      data-testid="mobile_payouts_link"
                      className="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Wallet className="h-4 w-4" />
                      Pagos
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <Link
                      href="/admin/applications"
                      data-testid="mobile_admin_link"
                      className="flex items-center gap-2 py-2 text-sm font-medium text-primary hover:text-primary/80"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                </div>

                <div className="border-t border-border pt-3 mt-3 space-y-2">
                  <Link href="/profile/edit" onClick={() => setMobileMenuOpen(false)}>
                    <Button data-testid="mobile_settings_button" variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </Link>
                  <Button
                    data-testid="mobile_logout_button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-3 border-t border-border">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button data-testid="mobile_login_button" variant="ghost" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button data-testid="mobile_signup_button" className="w-full">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
