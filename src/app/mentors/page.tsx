
import { createServer } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MentorCard } from "@/components/mentors/mentor-card";
import { MentorFilters } from "@/components/mentors/mentor-filters";
import { MentorPagination } from "@/components/mentors/mentor-pagination";
import { Mentor } from "@/types";
import { Database } from "@/types/supabase";

const PAGE_SIZE = 12;



type ProfileRow = Database['public']['Tables']['profiles']['Row'];







// Helper to transform DB profile to Mentor domain type



function transformToMentor(profile: ProfileRow): Mentor {



  return {



    id: profile.id,



    email: profile.email!,



    name: profile.name!,



    role: "mentor",



    photoUrl: profile.photo_url || undefined,



    description: profile.description || undefined,



    createdAt: new Date(profile.created_at!),



    profile: {



      userId: profile.id,



      specialties: profile.specialties || [],



      hourlyRate: profile.hourly_rate || 0,



      linkedinUrl: profile.linkedin_url || undefined,



      githubUrl: profile.github_url || undefined,



      isVerified: profile.is_verified || false,



      averageRating: profile.average_rating || 0,



      totalReviews: profile.total_reviews || 0,



      yearsOfExperience: profile.years_of_experience || 0,



    },



  };



}







export default async function MentorsPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    skill?: string | string[];
    cursor?: string;
    page?: string;
  }>
}) {
  const supabase = await createServer();
  const params = await searchParams;

  const query = params.q as string | undefined;
  const skills = Array.isArray(params.skill)
    ? params.skill
    : params.skill
    ? [params.skill]
    : [];
  const cursor = params.cursor;
  const currentPage = parseInt(params.page || "1", 10);



  // Build query
  let mentorQuery = supabase
    .from("profiles")
    .select("*")
    .eq("role", "mentor")
    .eq("is_verified", true);

  if (query) {
    mentorQuery = mentorQuery.ilike("name", `%${query}%`);
  }

  if (skills.length > 0) {
    mentorQuery = mentorQuery.contains("specialties", skills);
  }

  // Apply cursor-based pagination
  // Fetch one extra to determine if there's a next page
  mentorQuery = mentorQuery
    .order("average_rating", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true }) // Secondary sort for stable pagination
    .limit(PAGE_SIZE + 1);

  if (cursor) {
    // Cursor format: "rating:id" - get items after this combination
    const [cursorRating, cursorId] = cursor.split(":");
    mentorQuery = mentorQuery.or(
      `average_rating.lt.${cursorRating},and(average_rating.eq.${cursorRating},id.gt.${cursorId})`
    );
  }

  // Fetch mentors, skills, and total count in parallel
  const [
    { data: mentorsData, error: mentorsError },
    { data: skillsData, error: skillsError },
    { count: totalVerifiedMentors, error: countError },
  ] = await Promise.all([
    mentorQuery,
    supabase.rpc('get_all_unique_skills'),
    // Count total verified mentors (without filters) to detect empty system
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "mentor")
      .eq("is_verified", true),
  ]);

  const hasNoMentorsInSystem = (totalVerifiedMentors ?? 0) === 0;
  const hasFiltersApplied = !!query || skills.length > 0;

  if (mentorsError || skillsError || countError) {
    console.error("Error fetching mentors:", mentorsError || skillsError || countError);
    // Handle error state in UI
  }

  // Determine pagination state
  const allFetchedMentors = (mentorsData || []).map(transformToMentor);
  const hasNextPage = allFetchedMentors.length > PAGE_SIZE;
  const hasPreviousPage = currentPage > 1;

  // Limit to PAGE_SIZE for display
  const mentors: Mentor[] = hasNextPage
    ? allFetchedMentors.slice(0, PAGE_SIZE)
    : allFetchedMentors;

  // Create cursor for next page (last item's rating:id)
  const lastMentor = mentors[mentors.length - 1];
  const nextCursor = lastMentor
    ? `${lastMentor.profile.averageRating}:${lastMentor.id}`
    : undefined;

  const allSkills: string[] = skillsData || [];



  return (

    <div data-testid="mentorsPage" className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1">

        {/* Header */}

        <div data-testid="page_header" className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 py-12">

          <div className="container mx-auto px-4">

            <h1 data-testid="page_title" className="text-4xl font-bold mb-4">Explorar Mentores</h1>

            <p data-testid="page_description" className="text-lg text-muted-foreground max-w-2xl">

              Encuentra al mentor perfecto para acelerar tu carrera tech. Todos

              nuestros mentores son verificados y expertos en sus áreas.

            </p>

          </div>

        </div>



        <div className="container mx-auto px-4 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Sidebar - Filters */}

            <div data-testid="filters_sidebar" className="lg:col-span-1">

              <MentorFilters allSkills={allSkills} />

            </div>



            {/* Mentors Grid */}

            <div className="lg:col-span-3">

              {/* Results count */}

              <div className="mb-6">

                <p data-testid="results_count" className="text-sm text-muted-foreground">

                  {mentors.length} mentor

                  {mentors.length !== 1 ? "es" : ""} encontrado

                  {mentors.length !== 1 ? "s" : ""}

                </p>

              </div>



              {/* Mentors grid */}

              {mentors.length > 0 ? (
                <div data-testid="mentors_grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {mentors.map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} />
                  ))}
                </div>
              ) : hasNoMentorsInSystem ? (
                <div data-testid="empty_state_no_mentors" className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👨‍🏫</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aún no hay mentores disponibles</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    ¡Vuelve pronto o aplica para ser uno de nuestros primeros mentores verificados!
                  </p>
                </div>
              ) : (
                <div data-testid="empty_state_no_results" className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sin resultados</h3>
                  <p className="text-muted-foreground mb-4">
                    No se encontraron mentores con los filtros seleccionados.
                  </p>
                </div>
              )}

              {/* Pagination */}
              <MentorPagination
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                nextCursor={nextCursor}
                currentPage={currentPage}
              />
            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>

  );

}


