
import { createServer } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MentorCard } from "@/components/mentors/mentor-card";
import { MentorFilters } from "@/components/mentors/mentor-filters";
import { MentorPagination } from "@/components/mentors/mentor-pagination";
import { ClearSearchButton } from "@/components/mentors/clear-search-button";
import { Mentor } from "@/types";
import { Database } from "@/types/supabase";

const PAGE_SIZE = 20;



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
    keyword?: string;  // MYM-15: Renamed from 'q' to 'keyword'
    skill?: string | string[];
    cursor?: string;
    page?: string;
  }>
}) {
  const supabase = await createServer();
  const params = await searchParams;

  // MYM-15: Renamed from 'q' to 'keyword', trim whitespace
  const keyword = (params.keyword || "").trim().slice(0, 100); // Max 100 chars
  const skills = Array.isArray(params.skill)
    ? params.skill
    : params.skill
    ? [params.skill]
    : [];
  const cursor = params.cursor;
  const currentPage = parseInt(params.page || "1", 10);



  // MYM-15: Use RPC function for keyword search across name, description, and specialties
  // This provides case-insensitive, partial matching with OR logic for multiple words
  let mentorsResult;

  if (keyword) {
    // Use the search_mentors_by_keyword RPC function
    let searchQuery = supabase.rpc('search_mentors_by_keyword', {
      search_keyword: keyword
    });

    // Apply skill filter if selected
    if (skills.length > 0) {
      searchQuery = searchQuery.contains("specialties", skills);
    }

    // Apply cursor-based pagination
    searchQuery = searchQuery.limit(PAGE_SIZE + 1);

    if (cursor) {
      const [cursorRating, cursorId] = cursor.split(":");
      const ratingNum = parseFloat(cursorRating);

      if (ratingNum === 0 || isNaN(ratingNum)) {
        // Cursor is from NULL rating - only get NULLs with higher id
        searchQuery = searchQuery
          .is("average_rating", null)
          .gt("id", cursorId);
      } else {
        // Non-NULL rating - get lower ratings, same rating with higher id, or all NULLs
        searchQuery = searchQuery.or(
          `average_rating.lt.${cursorRating},and(average_rating.eq.${cursorRating},id.gt.${cursorId}),average_rating.is.null`
        );
      }
    }

    mentorsResult = await searchQuery;
  } else {
    // No keyword - use regular query
    let mentorQuery = supabase
      .from("profiles")
      .select("*")
      .eq("role", "mentor")
      .eq("is_verified", true);

    if (skills.length > 0) {
      mentorQuery = mentorQuery.contains("specialties", skills);
    }

    // Apply cursor-based pagination
    mentorQuery = mentorQuery
      .order("average_rating", { ascending: false, nullsFirst: false })
      .order("id", { ascending: true })
      .limit(PAGE_SIZE + 1);

    if (cursor) {
      const [cursorRating, cursorId] = cursor.split(":");
      const ratingNum = parseFloat(cursorRating);

      if (ratingNum === 0 || isNaN(ratingNum)) {
        // Cursor is from NULL rating - only get NULLs with higher id
        mentorQuery = mentorQuery
          .is("average_rating", null)
          .gt("id", cursorId);
      } else {
        // Non-NULL rating - get lower ratings, same rating with higher id, or all NULLs
        mentorQuery = mentorQuery.or(
          `average_rating.lt.${cursorRating},and(average_rating.eq.${cursorRating},id.gt.${cursorId}),average_rating.is.null`
        );
      }
    }

    mentorsResult = await mentorQuery;
  }

  // Fetch skills and total count in parallel (mentors already fetched above)
  const [
    { data: skillsData, error: skillsError },
    { count: totalVerifiedMentors, error: countError },
  ] = await Promise.all([
    supabase.rpc('get_all_unique_skills'),
    // Count total verified mentors (without filters) to detect empty system
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "mentor")
      .eq("is_verified", true),
  ]);

  // Extract mentors data from result
  const { data: mentorsData, error: mentorsError } = mentorsResult;

  const hasNoMentorsInSystem = (totalVerifiedMentors ?? 0) === 0;
  // MYM-15: Updated to use keyword instead of query
  const hasFiltersApplied = !!keyword || skills.length > 0;

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

        <div data-testid="page_header" className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-950 dark:via-fuchsia-950 dark:to-violet-950 py-12">

          <div className="container mx-auto px-4">

            <h1 data-testid="page_title" className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Explorar Mentores</h1>

            <p data-testid="page_description" className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">

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
                // MYM-15: Updated empty state with keyword display and clear button
                <div data-testid="empty_state_no_results" className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sin resultados</h3>
                  <p data-testid="no_results_message" className="text-muted-foreground mb-4">
                    {keyword ? (
                      <>No mentors found matching &apos;{keyword}&apos;. Try a different search term.</>
                    ) : (
                      <>No se encontraron mentores con los filtros seleccionados.</>
                    )}
                  </p>
                  {hasFiltersApplied && (
                    <ClearSearchButton />
                  )}
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


