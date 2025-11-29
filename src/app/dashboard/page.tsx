import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createServer } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, BookOpen, Star, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServer();

  // Get authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Fetch bookings for the user
  const isStudent = profile.role === "student";
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, mentor:profiles!mentor_id(name), student:profiles!student_id(name)")
    .eq(isStudent ? "student_id" : "mentor_id", authUser.id)
    .order("session_date", { ascending: true });

  // Calculate stats
  const upcomingSessions = bookings?.filter(b =>
    new Date(b.session_date) > new Date() &&
    (b.status === "confirmed" || b.status === "pending_payment")
  ) || [];

  const completedSessions = bookings?.filter(b => b.status === "completed") || [];
  const totalHours = completedSessions.reduce((sum, b) => sum + (b.duration_minutes / 60), 0);

  // For mentors, fetch average rating from profile
  const averageRating = profile.role === "mentor" ? profile.average_rating : null;
  const totalReviews = profile.role === "mentor" ? profile.total_reviews : null;

  // Check profile completion for mentors
  const hasSpecialties = profile.specialties && profile.specialties.length > 0;
  const hasRate = profile.hourly_rate && profile.hourly_rate > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              {profile.photo_url ? (
                <div className="relative h-20 w-20 rounded-full overflow-hidden ring-4 ring-background">
                  <Image
                    src={profile.photo_url}
                    alt={profile.name || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold ring-4 ring-background">
                  {profile.name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">Bienvenido, {profile.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={profile.role === "mentor" ? "default" : "secondary"}>
                    {profile.role === "mentor" ? "Mentor" : "Estudiante"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {profile.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sesiones Programadas
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingSessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingSessions.length === 0
                    ? "No tienes sesiones próximas"
                    : `Próxima: ${new Date(upcomingSessions[0]?.session_date).toLocaleDateString()}`
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {profile.role === "mentor" ? "Total Sesiones" : "Horas de Mentoría"}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile.role === "mentor" ? completedSessions.length : totalHours.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile.role === "mentor" ? "Sesiones impartidas" : "Horas completadas"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valoración Promedio
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {averageRating ? Number(averageRating).toFixed(1) : "-"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalReviews ? `${totalReviews} reviews` : "Sin reviews aún"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Sesiones Próximas</CardTitle>
                <CardDescription>
                  Tus sesiones programadas aparecerán aquí
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No tienes sesiones programadas
                    </p>
                    {profile.role === "student" && (
                      <Link href="/mentors">
                        <Button>Explorar Mentores</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">
                            {isStudent ? booking.mentor?.name : booking.student?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.session_date).toLocaleString()} • {booking.duration_minutes} min
                          </p>
                        </div>
                        <Badge>{booking.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Completa tu Perfil</CardTitle>
                <CardDescription>
                  Mejora tu experiencia completando tu perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-medium">Información básica</span>
                  </div>
                  <Badge variant="secondary">✓ Completo</Badge>
                </div>

                {profile.role === "mentor" && (
                  <>
                    <div className={`flex items-center justify-between p-4 rounded-lg border ${hasSpecialties ? '' : 'border-dashed'}`}>
                      <div className="flex items-center gap-3">
                        <BookOpen className={`h-5 w-5 ${hasSpecialties ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-medium ${hasSpecialties ? '' : 'text-muted-foreground'}`}>
                          Skills y Especialidades
                        </span>
                      </div>
                      <Badge variant={hasSpecialties ? "secondary" : "outline"}>
                        {hasSpecialties ? "✓ Completo" : "Pendiente"}
                      </Badge>
                    </div>

                    <div className={`flex items-center justify-between p-4 rounded-lg border ${hasRate ? '' : 'border-dashed'}`}>
                      <div className="flex items-center gap-3">
                        <Calendar className={`h-5 w-5 ${hasRate ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-medium ${hasRate ? '' : 'text-muted-foreground'}`}>
                          Tarifa por Hora
                        </span>
                      </div>
                      <Badge variant={hasRate ? "secondary" : "outline"}>
                        {hasRate ? "✓ Completo" : "Pendiente"}
                      </Badge>
                    </div>
                  </>
                )}

                <div className="pt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {profile.role === "mentor"
                      ? "Los perfiles completos reciben 3x más solicitudes de sesión."
                      : "Un perfil completo ayuda a los mentores a entender mejor tus necesidades."}
                  </p>
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm">
                      Editar Perfil
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          {profile.role === "student" && (
            <Card className="mt-6 bg-gradient-to-r from-primary to-accent text-white border-none">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      ¿Listo para comenzar?
                    </h3>
                    <p className="text-white/90">
                      Encuentra al mentor perfecto y agenda tu primera sesión hoy
                    </p>
                  </div>
                  <Link href="/mentors">
                    <Button size="lg" variant="secondary">
                      Explorar Mentores
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
