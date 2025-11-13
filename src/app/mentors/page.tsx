
import { createServer } from "@/lib/supabase/server";

import { Navbar } from "@/components/layout/navbar";

import { Footer } from "@/components/layout/footer";

import { MentorCard } from "@/components/mentors/mentor-card";

import { MentorFilters } from "@/components/mentors/mentor-filters";

import { Mentor } from "@/types";

import { Database } from "@/types/supabase";



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







export default async function MentorsPage({ searchParams }: any) {

  const supabase = await createServer();

  const query = searchParams.q as string | undefined;

  const skills = Array.isArray(searchParams.skill)

    ? searchParams.skill

    : searchParams.skill

    ? [searchParams.skill]

    : [];



  // Build query

  let mentorQuery = supabase

    .from("profiles")

    .select("*")

    .eq("role", "mentor")

    .eq("is_verified", true);



  if (query) {

    mentorQuery = mentorQuery.ilike("name", `%${query}%`);

    // In a real app, you'd use full-text search here on multiple columns

  }



  if (skills.length > 0) {

    mentorQuery = mentorQuery.contains("specialties", skills);

  }



  // Fetch mentors and skills in parallel

  const [

    { data: mentorsData, error: mentorsError },

    { data: skillsData, error: skillsError },

  ] = await Promise.all([

    mentorQuery.order("average_rating", { ascending: false, nullsFirst: false }),

    supabase.rpc('get_all_unique_skills')

  ]);



  if (mentorsError || skillsError) {

    console.error("Error fetching mentors:", mentorsError || skillsError);

    // Handle error state in UI

  }



  const mentors: Mentor[] = (mentorsData || []).map(transformToMentor);

  const allSkills: string[] = skillsData || [];



  return (

    <div className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1">

        {/* Header */}

        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 py-12">

          <div className="container mx-auto px-4">

            <h1 className="text-4xl font-bold mb-4">Explorar Mentores</h1>

            <p className="text-lg text-muted-foreground max-w-2xl">

              Encuentra al mentor perfecto para acelerar tu carrera tech. Todos

              nuestros mentores son verificados y expertos en sus áreas.

            </p>

          </div>

        </div>



        <div className="container mx-auto px-4 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Sidebar - Filters */}

            <div className="lg:col-span-1">

              <MentorFilters allSkills={allSkills} />

            </div>



            {/* Mentors Grid */}

            <div className="lg:col-span-3">

              {/* Results count */}

              <div className="mb-6">

                <p className="text-sm text-muted-foreground">

                  {mentors.length} mentor

                  {mentors.length !== 1 ? "es" : ""} encontrado

                  {mentors.length !== 1 ? "s" : ""}

                </p>

              </div>



              {/* Mentors grid */}

              {mentors.length > 0 ? (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                  {mentors.map((mentor) => (

                    <MentorCard key={mentor.id} mentor={mentor} />

                  ))}

                </div>

              ) : (

                <div className="text-center py-12">

                  <p className="text-muted-foreground mb-4">

                    No se encontraron mentores con los filtros seleccionados.

                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>

  );

}


