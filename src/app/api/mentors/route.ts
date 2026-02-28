import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'

const PAGE_SIZE = 20

/**
 * GET /api/mentors
 *
 * Public endpoint to list all verified mentors with pagination and filters.
 *
 * Query Parameters:
 * - keyword: Search term for name, description, or specialties
 * - skill: Filter by specialty (can be repeated for multiple skills)
 * - cursor: Pagination cursor in format "rating:id"
 * - limit: Number of results per page (default: 20, max: 50)
 *
 * Returns mentors ordered by average_rating DESC (nulls last), then by id ASC.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Parse query parameters
  const keyword = (searchParams.get('keyword') || '').trim().slice(0, 100)
  const skills = searchParams.getAll('skill').filter(Boolean)
  const cursor = searchParams.get('cursor') || undefined
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || String(PAGE_SIZE), 10), 1),
    50
  )

  const supabase = await createServer()

  let mentorsResult

  if (keyword) {
    // Use RPC function for keyword search
    let searchQuery = supabase.rpc('search_mentors_by_keyword', {
      search_keyword: keyword,
    })

    // Apply skill filter if selected
    if (skills.length > 0) {
      searchQuery = searchQuery.contains('specialties', skills)
    }

    // Apply cursor-based pagination
    searchQuery = searchQuery.limit(limit + 1)

    if (cursor) {
      const [cursorRating, cursorId] = cursor.split(':')
      const ratingNum = parseFloat(cursorRating)

      if (ratingNum === 0 || isNaN(ratingNum)) {
        // Cursor is from NULL rating - only get NULLs with higher id
        searchQuery = searchQuery.is('average_rating', null).gt('id', cursorId)
      } else {
        // Non-NULL rating - get lower ratings, same rating with higher id, or all NULLs
        searchQuery = searchQuery.or(
          `average_rating.lt.${cursorRating},and(average_rating.eq.${cursorRating},id.gt.${cursorId}),average_rating.is.null`
        )
      }
    }

    mentorsResult = await searchQuery
  } else {
    // No keyword - use regular query
    let mentorQuery = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor')
      .eq('is_verified', true)

    if (skills.length > 0) {
      mentorQuery = mentorQuery.contains('specialties', skills)
    }

    // Apply cursor-based pagination
    mentorQuery = mentorQuery
      .order('average_rating', { ascending: false, nullsFirst: false })
      .order('id', { ascending: true })
      .limit(limit + 1)

    if (cursor) {
      const [cursorRating, cursorId] = cursor.split(':')
      const ratingNum = parseFloat(cursorRating)

      if (ratingNum === 0 || isNaN(ratingNum)) {
        // Cursor is from NULL rating - only get NULLs with higher id
        mentorQuery = mentorQuery.is('average_rating', null).gt('id', cursorId)
      } else {
        // Non-NULL rating - get lower ratings, same rating with higher id, or all NULLs
        mentorQuery = mentorQuery.or(
          `average_rating.lt.${cursorRating},and(average_rating.eq.${cursorRating},id.gt.${cursorId}),average_rating.is.null`
        )
      }
    }

    mentorsResult = await mentorQuery
  }

  const { data: mentorsData, error } = mentorsResult

  if (error) {
    console.error('Error fetching mentors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mentors', details: error.message },
      { status: 500 }
    )
  }

  const allMentors = mentorsData || []
  const hasNextPage = allMentors.length > limit
  const mentors = hasNextPage ? allMentors.slice(0, limit) : allMentors

  // Create cursor for next page
  const lastMentor = mentors[mentors.length - 1]
  const nextCursor = lastMentor
    ? `${lastMentor.average_rating || 0}:${lastMentor.id}`
    : undefined

  return NextResponse.json({
    mentors: mentors.map((mentor) => ({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      photoUrl: mentor.photo_url,
      description: mentor.description,
      specialties: mentor.specialties || [],
      hourlyRate: mentor.hourly_rate || 0,
      linkedinUrl: mentor.linkedin_url,
      githubUrl: mentor.github_url,
      isVerified: mentor.is_verified || false,
      averageRating: mentor.average_rating || 0,
      totalReviews: mentor.total_reviews || 0,
      yearsOfExperience: mentor.years_of_experience || 0,
    })),
    pagination: {
      hasNextPage,
      nextCursor: hasNextPage ? nextCursor : undefined,
      pageSize: limit,
    },
  })
}
