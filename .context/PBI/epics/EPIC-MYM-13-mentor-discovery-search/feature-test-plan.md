# Feature Test Plan: EPIC-MYM-13 - Mentor Discovery & Search

**Fecha:** 2025-11-07
**QA Lead:** AI-Generated (Pending Assignment)
**Epic Jira Key:** MYM-13
**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

This epic delivers the core marketplace value proposition: enabling mentees to discover and evaluate verified tech mentors efficiently. This is the PRIMARY revenue driver for Upex My Mentor - without effective mentor discovery, the marketplace fails. The business model depends on a 20% commission per booking, and bookings cannot happen if mentees cannot find suitable mentors.

**Key Value Proposition:**

- Enables mentees to discover mentors matching their specific technical needs (React, AWS, Python, etc.)
- Provides transparent mentor information (skills, pricing, ratings, reviews) to support informed decision-making
- Reduces time-to-mentor from hours of manual research to minutes of efficient browsing
- Creates trust through verified mentor profiles and authentic reviews
- Powers the discovery-to-booking funnel that generates revenue

**Success Metrics (KPIs):**

From Executive Summary and Epic metrics:

- 70% of mentees use search/filters (indicates discovery tools are essential)
- Average time on mentor discovery page: 3-5 minutes (efficient discovery)
- 40% of mentees visit 3+ mentor profiles before booking (comparison shopping)
- 25% conversion rate from mentor profile view to booking attempt (critical funnel metric)
- Search returns results in <500ms for keyword queries (performance KPI)
- 500 students in first 3 months (discovery must work to attract and retain)
- 50 mentors in first 3 months (visibility in search is critical for mentor satisfaction)
- <5% bounce rate on mentor gallery (users find value immediately)
- >60% users interact with filters (filters add value to search experience)

**User Impact:**

- **Laura (Desarrolladora Junior, 24 años):** As a mentee focused on React and career growth, Laura needs to quickly find React mentors within her budget (50-100 USD/hour) and evaluate them through reviews. If search is slow or returns irrelevant results, she will abandon the platform. The filter-by-skill and price-range features are critical for her journey.
- **Carlos (Arquitecto Senior, 40 años):** As a mentor, Carlos needs his profile to appear prominently in relevant searches (AWS, System Design). If his profile is buried or doesn't rank well for his specialties, he won't get bookings. Search relevance directly impacts his income potential on the platform.
- **Sofía (Career Changer, 32 años):** As a career changer from marketing to Data Science, Sofía needs discovery tools to explore different mentors and learning paths. She relies on filters (min rating 4.0+, availability) and detailed mentor profiles to make confident decisions about significant time/money investments.

**Critical User Journeys:**

- **Journey 1: Laura's Mentor Discovery Journey (from user-journeys.md):**
  - Step 1: Laura logs in and navigates to "Find Mentors" page
  - Step 2: She searches for "React" in keyword search
  - Step 3: Applies filters (Price: $50-$100, Min Rating: 4.0+)
  - Step 4: Browses mentor cards in gallery (photo, name, skills, rate, rating)
  - Step 5: Clicks on mentor card to view detailed profile
  - Step 6: Reviews mentor bio, skills, reviews, availability
  - Step 7: Decides to book a session (transitions to EPIC-MYM-18)

This journey touches ALL 4 stories (MYM-14, MYM-15, MYM-16, MYM-17) and is the happy path for the epic.

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- Next.js 15 App Router pages and components:
  - `/mentors` route - Mentor gallery/listing page (MYM-14)
  - `/mentors/[id]` route - Mentor detail page (MYM-17)
- React components (from epic technical specs):
  - `MentorGallery` - Grid layout of mentor cards with pagination/infinite scroll
  - `MentorCard` - Preview card showing photo, name, primary skills, hourly rate, average rating
  - `SearchBar` - Keyword search input with real-time results (MYM-15)
  - `FilterSidebar` - Multi-select filters for skills, price range, availability, rating (MYM-16)
  - `MentorProfile` - Full profile page layout
  - `RatingDisplay` - Star rating visualization component
  - `ReviewCard` - Individual review component for mentor detail page
  - `PaginationControls` - Pagination UI (20 mentors per page)
- Client-side state management for filters and search (React state or Zustand)
- Image optimization for mentor photos (Next.js Image component, lazy loading)

**Backend:**

- Next.js 15 API Routes:
  - `GET /api/mentors` - List/search/filter mentors with query params (FR-006, FR-007)
    - Query params: `?keyword=react&skills[]=react&min_price=50&max_price=150&min_rating=4.0&available=true&page=1&limit=20`
  - `GET /api/mentors/:id` - Get mentor detail including reviews (FR-008)
- Server-side business logic:
  - Full-text search implementation on bio and specialties
  - Complex filtering logic (combining multiple filters with AND/OR logic)
  - Rating aggregation from reviews table
  - Availability calculation from availability table
  - Pagination logic (cursor-based or offset-based)
- Response formatting (match api-contracts.yaml schema)

**Database:**

- **Tables involved (PostgreSQL via Supabase):**
  - `public.profiles` table - stores id, name, photo_url, description
  - `public.mentor_profiles` table - stores profile_id (FK), specialties (text[]), hourly_rate, linkedin_url, github_url, verification_status
  - `public.reviews` table - stores mentor_id (FK), rating (1-5), comment, created_at
  - `public.availability` table - stores mentor_id (FK), date, time_slots (for availability filter)
- **Critical queries (from epic technical specs):**
  - Mentor listing with aggregated rating:
    ```sql
    SELECT profiles.*, mentor_profiles.*, AVG(reviews.rating) as avg_rating, COUNT(reviews.id) as review_count
    FROM profiles
    JOIN mentor_profiles ON profiles.id = mentor_profiles.profile_id
    LEFT JOIN reviews ON mentor_profiles.id = reviews.mentor_id
    WHERE mentor_profiles.verification_status = 'verified'
    GROUP BY profiles.id, mentor_profiles.id
    ```
  - Search with filters (full-text search, range queries, joins):
    ```sql
    WHERE mentor_profiles.verification_status = 'verified'
      AND (profiles.description ILIKE '%keyword%' OR 'keyword' = ANY(mentor_profiles.specialties))
      AND mentor_profiles.hourly_rate BETWEEN min_price AND max_price
      AND avg_rating >= min_rating
      AND EXISTS (SELECT 1 FROM availability WHERE mentor_id = mentor_profiles.id AND date = ?)
    ```
- **Indexing (from epic performance optimization):**
  - Index on `mentor_profiles.verification_status`
  - Full-text index on `profiles.description`
  - GIN index on `mentor_profiles.specialties` (array)
  - Index on `mentor_profiles.hourly_rate`

**External Services:**

- **Supabase Database:** PostgreSQL with RLS policies (only verified mentors visible)
- **Supabase Storage:** CDN for mentor profile photos (WebP format, lazy loading)
- **Optional (future):** Supabase Realtime for live updates to mentor availability

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- Frontend ↔ Backend API (GET /api/mentors endpoint with complex query params)
- Frontend ↔ Backend API (GET /api/mentors/:id endpoint)
- Backend ↔ Supabase Database (complex queries with joins, full-text search, aggregations)
- Backend ↔ Supabase Storage (mentor photo retrieval via CDN URLs)
- MentorGallery ↔ SearchBar ↔ FilterSidebar (real-time filter updates without page reload)

**External Integration Points:**

- Upex My Mentor Backend ↔ Supabase PostgreSQL (query performance critical)
- Upex My Mentor Frontend ↔ Supabase Storage CDN (image loading performance)

**Data Flow:**

```
Mentor Discovery Flow (MYM-14 + MYM-15 + MYM-16):
User → Frontend (MentorGallery) → GET /api/mentors?page=1&limit=20 → Backend
                                                                      ↓
                                  Supabase DB (complex query with joins) ← Backend
                                  ↓
                         JSON response (mentors array + pagination) → Frontend
                         ↓
               MentorGallery renders MentorCards with data

Search/Filter Flow (real-time):
User types keyword → SearchBar → GET /api/mentors?keyword=react → Backend → DB
                                                                    ↓
                                        Updated mentor list → Frontend (re-render gallery)

User selects filter → FilterSidebar → GET /api/mentors?skills[]=react&min_price=50 → Backend → DB
                                                                                      ↓
                                                    Filtered mentor list → Frontend (re-render gallery)

Mentor Detail Flow (MYM-17):
User clicks MentorCard → Navigate to /mentors/:id → GET /api/mentors/:id → Backend
                                                                            ↓
                                  Supabase DB (join profiles + mentor_profiles + reviews)
                                  ↓
                         JSON response (full mentor data + reviews) → Frontend
                         ↓
               MentorProfile component renders full profile + ReviewCards
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Poor search relevance - users cannot find mentors matching their needs

- **Impact:** High
- **Likelihood:** High
- **Area Affected:** Backend search logic, user experience
- **Mitigation Strategy:**
  - Implement fuzzy search for typo tolerance (e.g., "Reactjs" matches "React")
  - Search across multiple fields: bio, specialties, name
  - Weight matches (specialty match > bio match)
  - Test with realistic user queries from user research
  - Implement "Did you mean?" suggestions for no results
  - A/B test search algorithms in production
- **Test Coverage Required:**
  - Positive: Search for exact skill name ("React"), partial match ("React Native"), synonym ("ReactJS")
  - Negative: Search with typos ("Recat"), special characters, SQL injection attempts
  - Edge: Empty search query, very long search query (>100 chars), Unicode characters
  - Integration: Verify search uses full-text index for performance

#### Risk 2: Slow page load with 50+ mentors (violates <2.5s LCP requirement)

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Frontend performance, database query performance
- **Mitigation Strategy:**
  - Implement pagination (20 mentors per page per epic specs)
  - Use cursor-based pagination for better performance at scale
  - Implement caching (5-minute cache for gallery per epic specs)
  - Lazy load mentor photos (Next.js Image component)
  - Use CDN for photo delivery (Supabase Storage)
  - Optimize DB queries with proper indexes (per epic)
  - Consider ISR (Incremental Static Regeneration) for gallery page
- **Test Coverage Required:**
  - Performance: Measure LCP with 50, 100, 200 mentors in database
  - Performance: Measure API response time for /api/mentors with filters
  - Positive: Pagination works correctly (page 1, 2, 3, last page)
  - Edge: Navigate to page beyond total pages (should handle gracefully)

#### Risk 3: Complex filter combinations return empty results (poor UX)

- **Impact:** Medium
- **Likelihood:** High
- **Area Affected:** Backend filtering logic, user experience
- **Mitigation Strategy:**
  - Show mentor count for each filter option BEFORE applying (e.g., "React (23)")
  - Implement "no results" state with helpful messaging (per epic)
  - Suggest relaxing filters (e.g., "No mentors found. Try removing price filter.")
  - Ensure filters combine logically (AND logic within category, OR across categories)
  - Log filter combinations that return zero results for product analytics
- **Test Coverage Required:**
  - Negative: Apply filters with zero matches (e.g., React + $500/hour + 5.0 rating)
  - Boundary: Apply all filters simultaneously
  - Edge: Apply filter, get results, then apply more filters until zero results
  - Integration: Verify filter count updates correctly as filters change

#### Risk 4: SQL injection vulnerabilities in search and filter inputs

- **Impact:** High
- **Likelihood:** Low (using Supabase client SDK reduces risk)
- **Area Affected:** Backend → Database security
- **Mitigation Strategy:**
  - Use Supabase client SDK (parameterized queries by default)
  - Validate and sanitize ALL query params server-side
  - Implement input length limits (keyword <100 chars)
  - Enable Row Level Security (RLS) on all tables
  - Audit raw SQL queries (should be none)
- **Test Coverage Required:**
  - Security: Test SQL injection patterns in keyword search, skills filter
  - Negative: Input with SQL keywords (`'; DROP TABLE mentors;--`, `' OR '1'='1`)
  - Integration: Verify RLS prevents access to unverified mentors

#### Risk 5: Mentor photos fail to load or load slowly (broken UX, slow LCP)

- **Impact:** Medium
- **Likelihood:** Medium
- **Area Affected:** Frontend (image loading), Supabase Storage integration
- **Mitigation Strategy:**
  - Use Next.js Image component (automatic optimization, lazy loading)
  - Require photos during mentor profile creation (prevent null photo_url)
  - Use placeholder avatars for missing photos
  - Optimize photos to WebP format in storage (per epic notes)
  - Use CDN for fast delivery (Supabase Storage provides this)
  - Implement error handling for broken image URLs
- **Test Coverage Required:**
  - Positive: Photos load correctly from Supabase Storage
  - Negative: Mentor with null photo_url (should show placeholder)
  - Edge: Broken photo URL (404), very large photo (test compression)
  - Performance: Measure image load time (should use lazy loading)

#### Risk 6: Pagination or infinite scroll breaks with concurrent data changes

- **Impact:** Medium
- **Likelihood:** Low
- **Area Affected:** Frontend pagination, backend query consistency
- **Mitigation Strategy:**
  - Use cursor-based pagination (per epic specs) for consistency
  - Implement stable sorting (e.g., by created_at + id to avoid duplicates)
  - Cache query results briefly (5 minutes per epic) to prevent mid-pagination changes
  - Handle edge case: user on page 3, new mentor added (should not break pagination)
- **Test Coverage Required:**
  - Boundary: Navigate to last page, then navigate to page beyond total (should handle gracefully)
  - Edge: Mentor added/deleted while user is browsing (test pagination stability)
  - Integration: Verify pagination metadata correct (total_count, total_pages, current_page)

---

### Business Risks

#### Risk 1: Mentees cannot find relevant mentors → no bookings → no revenue

- **Impact on Business:** Directly impacts 25% conversion rate from profile view to booking (KPI)
- **Impact on Users:** Laura abandons platform if she can't find React mentors in her price range; platform loses student acquisition
- **Likelihood:** High
- **Mitigation Strategy:**
  - Prioritize search relevance testing (test with realistic queries)
  - Ensure filters work correctly (price, skills, rating)
  - Implement analytics to track zero-result searches (product team can improve)
  - A/B test search algorithms
  - Provide helpful "no results" messaging with suggestions
- **Acceptance Criteria Validation:**
  - Epic AC #2 says "Search returns relevant results" but doesn't define "relevant" - AMBIGUITY
  - SUGGESTION: Add acceptance criteria with specific relevance metrics (e.g., "Search for 'React' returns all mentors with React in specialties")

#### Risk 2: Confusing filters lead to user frustration and abandonment

- **Impact on Business:** Impacts <5% bounce rate goal and >60% filter interaction goal
- **Impact on Users:** Sofía (career changer) needs clear, intuitive filters to explore options; complex UI causes decision paralysis
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Start with essential filters only (per epic: skills, price, availability, rating)
  - Progressive disclosure (don't show all filters at once)
  - Clear filter labels and help text
  - Show active filters with "Clear all" option (per epic)
  - User testing before launch (Shift-Left!)
- **Acceptance Criteria Validation:**
  - Epic AC #3 says "Filters can be combined" but doesn't specify AND/OR logic - AMBIGUITY
  - Epic AC #8 says "Mobile-responsive design" but doesn't specify mobile filter UX (drawer? accordion?) - AMBIGUITY

#### Risk 3: Mentors without visibility in search results lose trust and leave platform

- **Impact on Business:** Impacts "50 mentors in 3 months" KPI; retention problem
- **Impact on Users:** Carlos (mentor) expects his AWS/System Design skills to rank him high in searches; if buried, he won't see ROI and will leave
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Ensure search relevance is fair (alphabetical or rating-based, not arbitrary)
  - Implement ranking algorithm (consider rating, reviews, response rate - future)
  - Provide mentor analytics (how many times profile viewed) - OUT OF SCOPE but critical
  - Ensure all verified mentors appear in relevant searches (not just featured mentors)
- **Acceptance Criteria Validation:**
  - Epic says sorting is OUT OF SCOPE, but ranking/ordering is critical for fairness - MISSING INFORMATION
  - SUGGESTION: Define default ordering (e.g., "by average rating descending" or "random shuffle for fairness")

#### Risk 4: Poor mobile experience on mentor discovery reduces conversion

- **Impact on Business:** Impacts 500 students KPI (many users browse on mobile)
- **Impact on Users:** Laura browses mentors during commute on mobile; if filters are hard to use or gallery is slow, she abandons
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Mobile-first design for filters (drawer or bottom sheet)
  - Touch-friendly filter controls (checkboxes, sliders)
  - Optimize images for mobile (smaller sizes, WebP)
  - Test on real devices (iOS Safari, Android Chrome)
- **Acceptance Criteria Validation:**
  - Epic AC #8 says "Mobile-responsive design" but no specific mobile UX requirements - AMBIGUITY
  - SUGGESTION: Add AC for "Filters accessible on mobile via drawer" and "Gallery scrolls smoothly on mobile"

---

### Integration Risks

#### Integration Risk 1: GET /api/mentors endpoint returns incorrect data or fails under load

- **Integration Point:** Frontend ↔ Backend API (GET /api/mentors)
- **What Could Go Wrong:** Complex query params mishandled, filters not applied correctly, pagination breaks, API times out
- **Impact:** High
- **Mitigation:**
  - API contract testing (validate request/response against api-contracts.yaml)
  - Load testing with realistic filter combinations
  - Integration tests for all query param combinations
  - Error handling for API failures (show error state in UI)
  - Monitor API response time in production (<500ms p95 per NFR)

#### Integration Risk 2: Complex database queries with joins are slow or timeout

- **Integration Point:** Backend ↔ Supabase Database
- **What Could Go Wrong:** Query with full-text search + multiple filters + joins exceeds 500ms, database connection pool exhausted
- **Impact:** High
- **Mitigation:**
  - Database indexes properly configured (per epic: verification_status, specialties GIN, hourly_rate, description full-text)
  - Query optimization (avoid N+1 queries, use joins efficiently)
  - Connection pooling configured correctly in Supabase
  - Load testing at 100 concurrent users (MVP target)
  - Monitor slow query log in Supabase

#### Integration Risk 3: Frontend filter state management breaks with rapid filter changes

- **Integration Point:** MentorGallery ↔ SearchBar ↔ FilterSidebar (internal frontend)
- **What Could Go Wrong:** User rapidly selects/deselects filters, state becomes inconsistent, duplicate API calls, race conditions
- **Impact:** Medium
- **Mitigation:**
  - Debounce search input (wait 300ms after user stops typing)
  - Debounce filter changes (batch filter updates)
  - Use React state management properly (useState or Zustand)
  - Cancel in-flight API requests when new filters applied
  - Integration tests for rapid filter changes

#### Integration Risk 4: Photo URLs from Supabase Storage are broken or inaccessible

- **Integration Point:** Frontend ↔ Supabase Storage CDN
- **What Could Go Wrong:** Photo URLs return 404, CORS issues, Storage bucket permissions wrong
- **Impact:** Medium
- **Mitigation:**
  - Verify Supabase Storage bucket is public (or signed URLs if private)
  - Test photo URLs from different domains (CORS headers correct)
  - Implement placeholder avatars for missing photos
  - Error boundary for image load failures
  - Integration tests for photo loading

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1: How does keyword search work exactly? Fuzzy search? Partial match? Case-sensitive?**

- **Found in:** STORY-MYM-15 states "Keyword search across mentor bio, skills, name" but no details on search algorithm
- **Question for PO/Dev:**
  - Is it exact match only or partial match? (e.g., does "React" match "React Native"?)
  - Is it case-sensitive or case-insensitive? (should "react" match "React"?)
  - Does it support fuzzy search for typos? (e.g., "Recat" matches "React"?)
  - How are multiple words handled? (e.g., "React AWS" - AND or OR logic?)
  - Which field has priority? (specialty exact match > bio partial match?)
- **Impact if not clarified:** Testing cannot validate search correctness; users may get irrelevant results; inconsistent behavior

**Ambiguity 2: How do filters combine? AND logic or OR logic?**

- **Found in:** Epic AC #3 says "Filters can be combined (e.g., 'React' + '$50-$100/hr' + '4+ stars')" but doesn't specify combination logic
- **Question for PO/Dev:**
  - Are filters within the same category combined with OR? (e.g., skills: React OR AWS)
  - Are filters across categories combined with AND? (skills: React AND price: $50-100 AND rating: 4+)
  - Can user select multiple skills? (multi-select per epic, but how do they combine?)
  - What happens if user selects conflicting filters? (e.g., min_price > max_price)
- **Impact if not clarified:** Test cases cannot validate filter behavior; users may get unexpected results; product team can't define requirements

**Ambiguity 3: What is the default ordering of mentor results? Random? By rating? By date joined?**

- **Found in:** Epic states "Sorting options (price low-to-high, rating, popularity)" is OUT OF SCOPE, but doesn't define DEFAULT ordering
- **Question for PO:**
  - What is the default order when user first lands on gallery? (alphabetical by name? by rating descending? random?)
  - Is ordering stable? (same order on every page load or random shuffle for fairness?)
  - Does ordering affect pagination? (if random, pagination becomes inconsistent)
  - Should we implement basic ordering even if sorting UI is out of scope? (e.g., always show by rating descending)
- **Impact if not clarified:** Testing cannot validate ordering; user experience inconsistent; mentors may complain about unfair visibility

**Ambiguity 4: What exactly is displayed in mentor card vs. detail page?**

- **Found in:** Epic lists card fields (photo, name, primary skills, hourly rate, rating) and detail page fields (full bio, all skills, reviews, availability, CTA)
- **Question for PO/Dev:**
  - Card says "primary skills" - how many skills shown? (top 3? all skills?)
  - Card says "average rating" - is review count shown? (e.g., "4.7 (23 reviews)")
  - Detail page says "recent reviews (paginated)" - how many per page? (5? 10?)
  - Detail page says "availability calendar preview" - what does this show if availability filtering is enabled? (next 7 days? next available slot?)
- **Impact if not clarified:** UI tests cannot validate correct fields; design mismatches; inconsistent user experience

**Ambiguity 5: How does pagination work? Offset-based or cursor-based?**

- **Found in:** Epic technical specs mention "cursor-based pagination for better performance" but API contracts show `page` and `limit` params (offset-based)
- **Question for Dev:**
  - Is pagination offset-based (page=2&limit=20) or cursor-based (cursor=abc123&limit=20)?
  - If offset-based, what happens if mentors are added/deleted between page navigations? (duplicates or skipped mentors?)
  - If cursor-based, what is the cursor? (id? created_at?)
  - What is the max limit allowed? (api-contracts.yaml says max 100, epic says 20 per page - which is enforced?)
- **Impact if not clarified:** API tests cannot validate pagination; frontend may implement wrong pagination type; data consistency issues

**Ambiguity 6: What happens if NO mentors match filters? What is the "helpful messaging"?**

- **Found in:** Epic AC #9 says "Empty states are handled gracefully (no mentors match filters)" but doesn't specify the message or UX
- **Question for PO:**
  - What is the exact message shown? (e.g., "No mentors found. Try adjusting your filters.")
  - Should we suggest specific actions? (e.g., "Try removing the price filter" or "Show all mentors")
  - Should we log zero-result filter combinations for analytics?
  - Is there a "Reset filters" button in the empty state?
- **Impact if not clarified:** UI tests cannot validate empty state; poor user experience; users don't know how to recover

**Ambiguity 7: How does "availability" filter work without booking/calendar system?**

- **Found in:** Epic scope includes "Filter by availability (has open slots)" but EPIC-MYM-18 (Scheduling & Booking) is blocked by this epic
- **Question for PO/Dev:**
  - Does availability table exist yet? (if not, this filter cannot work)
  - What does "available" mean? (has at least one future slot? available this week?)
  - Can this filter be implemented in MVP or should it be moved to EPIC-MYM-18?
  - If implemented, how is availability data populated? (mentors manually set availability? automatic from bookings?)
- **Impact if not clarified:** Testing blocked on missing dependency; filter may not work; user expectations not met

---

### Missing Information

**Missing 1: Search result ranking algorithm - how are results ordered?**

- **Needed for:** MYM-15 (search) testing and fairness validation
- **Suggestion:** Add to epic technical specs:
  - Define ranking factors (e.g., relevance score = specialty match weight + bio match weight)
  - Or default to ordering by rating descending
  - Or random shuffle for fairness
  - Document ranking logic for transparency (mentors will ask why they're not at top of results)

**Missing 2: Search autocomplete/suggestions - is this in scope?**

- **Needed for:** MYM-15 (search) UX validation
- **Suggestion:** Clarify if autocomplete is in scope for MVP
  - Epic says "Real-time search results" - does this mean autocomplete dropdown or just fast results?
  - If autocomplete is in scope, what suggestions are shown? (popular skills? mentors names?)
  - If out of scope, document as future enhancement

**Missing 3: Filter count badges - show number of mentors per filter option?**

- **Needed for:** MYM-16 (filters) UX and reducing zero-result frustration
- **Suggestion:** Add to epic scope or future enhancements
  - Show mentor count next to each filter option (e.g., "React (23)", "AWS (15)")
  - Update counts dynamically as other filters are applied
  - Helps users avoid zero-result combinations
  - BEST PRACTICE for e-commerce/marketplace filter UX

**Missing 4: Review display format and sorting on mentor detail page**

- **Needed for:** MYM-17 (detail page) testing
- **Suggestion:** Add to story details:
  - How are reviews sorted? (most recent first? highest rating first? most helpful first?)
  - How many reviews shown per page? (5? 10?)
  - Is there a "helpful" vote on reviews? (out of scope?)
  - What fields are shown per review? (rating, comment, date, reviewer name/photo?)

**Missing 5: Mobile filter UX pattern - drawer? accordion? separate page?**

- **Needed for:** Mobile testing (epic AC #8)
- **Suggestion:** Add to design specs:
  - On mobile, filters shown in bottom drawer (opens on "Filter" button tap)
  - Or filters shown in accordion (collapsible sections)
  - Or filters on separate /mentors/filters page (navigate back to apply)
  - BEST PRACTICE: Bottom drawer with "Apply filters" button

**Missing 6: Error handling for API failures**

- **Needed for:** Integration testing and error state validation
- **Suggestion:** Add to epic technical specs:
  - If GET /api/mentors fails (500 error), show "Something went wrong. Please refresh." with retry button
  - If GET /api/mentors times out, show loading skeleton, then error after 10 seconds
  - If network is offline, show "You are offline. Please check your connection."
  - Document error state UX for all failure scenarios

---

### Suggested Improvements (Before Implementation)

**Improvement 1: Add filter count badges to reduce zero-result frustration**

- **Story Affected:** MYM-16 (filters)
- **Current State:** Epic doesn't mention filter count badges
- **Suggested Change:** Show mentor count next to each filter option (e.g., "React (23)", "Python (15)", "Available this week (8)")
- **Benefit:** Reduces user frustration from zero-result filter combinations (high likelihood risk); improves filter UX; standard e-commerce pattern; directly impacts >60% filter interaction goal

**Improvement 2: Define default ordering to ensure fair mentor visibility**

- **Story Affected:** MYM-14 (gallery), MYM-15 (search)
- **Current State:** No default ordering specified (sorting is out of scope)
- **Suggested Change:** Implement basic ordering even if UI controls are out of scope (e.g., order by average rating descending, or random shuffle on each session for fairness)
- **Benefit:** Prevents mentor complaints about visibility (business risk #3); ensures fair distribution of booking opportunities; impacts mentor retention (50 mentors KPI)

**Improvement 3: Implement search autocomplete/suggestions for better UX**

- **Story Affected:** MYM-15 (search)
- **Current State:** Epic mentions "real-time search results" but unclear if autocomplete is included
- **Suggested Change:** Add autocomplete dropdown showing skill suggestions as user types (e.g., type "Rea" → suggests "React", "React Native")
- **Benefit:** Improves search UX and reduces typos; helps users discover correct skill names; reduces zero-result searches; standard search pattern

**Improvement 4: Add mentor profile preview/teaser in gallery for better conversion**

- **Story Affected:** MYM-14 (gallery)
- **Current State:** Mentor card shows basic info (photo, name, skills, rate, rating)
- **Suggested Change:** Add "View Profile" button on hover (desktop) or long-press (mobile) to show quick preview tooltip with bio excerpt and review count
- **Benefit:** Reduces need to navigate to full profile page for every mentor; improves browsing efficiency; increases conversion from discovery to profile view (40% view 3+ profiles goal)

**Improvement 5: Implement skeleton loading states for better perceived performance**

- **Story Affected:** MYM-14 (gallery), MYM-15 (search), MYM-16 (filters)
- **Current State:** Epic mentions <2s page load but doesn't specify loading UX
- **Suggested Change:** Show skeleton loading cards while fetching mentors (instead of blank screen or spinner)
- **Benefit:** Improves perceived performance (feels faster even if actual load time is same); reduces bounce rate (<5% goal); standard UX pattern for marketplaces

**Improvement 6: Add "Recently Viewed" mentors section (move to future epic)**

- **Story Affected:** ALL stories (new feature)
- **Current State:** Out of scope per epic (listed in "Out of Scope (Future)")
- **Suggested Change:** Keep out of scope for MVP, but prioritize for next iteration
- **Benefit:** Helps users revisit mentors without re-searching; increases conversion from browsing to booking; captures user intent; standard marketplace pattern (Amazon, Airbnb)

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

- Functional testing (UI, API, Database) for ALL user stories (MYM-14, MYM-15, MYM-16, MYM-17)
- Integration testing:
  - Frontend ↔ Backend API (GET /api/mentors with all query param combinations)
  - Frontend ↔ Backend API (GET /api/mentors/:id)
  - Backend ↔ Supabase Database (complex queries with joins, full-text search, aggregations)
  - Backend ↔ Supabase Storage (mentor photo URLs from CDN)
  - MentorGallery ↔ SearchBar ↔ FilterSidebar (real-time state management)
- Non-functional testing:
  - Performance: Page load <2.5s LCP (NFR-P-001), API response <500ms p95 (NFR-P-002)
  - Security: SQL injection in search/filters, XSS in mentor data display, RLS policy enforcement
  - Usability: WCAG 2.1 AA compliance (NFR-U-001), clear error messages
- Cross-browser testing: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile responsiveness: iOS Safari, Android Chrome (mobile-first design)
- API contract validation (according to api-contracts.yaml for GET /api/mentors and GET /api/mentors/:id)
- Data validation (search returns only verified mentors, ratings calculated correctly, filters applied correctly)

**Out of Scope (For This Epic):**

- Sorting UI (explicitly out of scope per epic - sorting options for price, rating, popularity)
- Saved/favorited mentors (out of scope per epic)
- Mentor recommendations (AI-powered matching out of scope)
- Advanced filters (years of experience, location/timezone out of scope)
- "Recently viewed" mentors (out of scope per epic)
- Mentor video introductions (out of scope per epic)
- Booking functionality (covered in EPIC-MYM-18 - Scheduling & Booking)
- Review submission (covered in EPIC-MYM-7 - Reputation & Reviews)
- Load testing beyond 100 concurrent users (MVP target per NFR)
- Penetration testing (recommend external security audit before production)

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** > 80% code coverage (per NFR maintainability specs)
- **Focus Areas:**
  - Search logic functions (keyword matching, fuzzy search if implemented)
  - Filter logic functions (combining multiple filters, price range validation)
  - Pagination logic (offset calculation, total pages calculation)
  - Rating aggregation functions (average rating from reviews)
  - Data transformation functions (API response formatting)
  - Validation functions (query param validation, filter value validation)
- **Responsibility:** Dev team (QA validates tests exist and coverage meets goal)

#### Integration Testing

- **Coverage Goal:** All integration points identified in architecture analysis
- **Focus Areas:**
  - Frontend ↔ Backend API (test GET /api/mentors with all query params: keyword, skills, min_price, max_price, min_rating, available, page, limit)
  - Frontend ↔ Backend API (test GET /api/mentors/:id with valid/invalid mentor IDs)
  - Backend ↔ Supabase Database (test complex queries return correct data with filters)
  - Backend ↔ Supabase Database (test full-text search on bio and specialties)
  - Backend ↔ Supabase Database (test rating aggregation from reviews table)
  - Backend ↔ Supabase Storage (test mentor photo URLs are accessible)
  - Contract testing for API endpoints (request/response schemas match api-contracts.yaml)
  - RLS policy enforcement (only verified mentors returned, unverified mentors excluded)
- **Responsibility:** QA + Dev (pair programming recommended)

#### End-to-End (E2E) Testing

- **Coverage Goal:** Critical user journeys complete (from user personas and user journeys docs)
- **Tool:** Playwright
- **Focus Areas:**
  - **Journey 1 (Laura - Mentee Discovery):** Login → Navigate to /mentors → Search "React" → Apply filters (price $50-100, rating 4+) → Browse gallery → Click mentor card → View detail page → Verify reviews shown → Navigate back to gallery
  - **Journey 2 (Browse without filters):** Login → Navigate to /mentors → Browse gallery page 1 → Navigate to page 2 → Navigate back to page 1 → Click mentor → View detail
  - **Journey 3 (Empty state):** Login → Navigate to /mentors → Apply filters with zero matches → Verify empty state message → Clear filters → Verify mentors shown again
  - **Journey 4 (Mobile):** Login on mobile → Open /mentors → Open filter drawer → Apply filters → Browse gallery → View mentor detail
  - Happy paths complete (all steps successful)
  - Error scenarios (network failure, API timeout, broken images)
- **Responsibility:** QA team

#### API Testing

- **Coverage Goal:** 100% of discovery endpoints added in this epic
- **Tool:** Postman/Newman or Playwright API
- **Focus Areas:**
  - `GET /api/mentors` - Test all query param combinations:
    - No params (default: page 1, limit 20, all verified mentors)
    - With keyword (valid keyword, empty keyword, special chars, SQL injection)
    - With skills filter (single skill, multiple skills, non-existent skill)
    - With price range (valid range, min > max, negative values, zero)
    - With min_rating (valid rating 0-5, out of range, non-numeric)
    - With available filter (true/false, invalid value)
    - With pagination (page 1, page 2, page beyond total, limit 1-100, limit > 100)
    - Combined filters (keyword + skills + price + rating + pagination)
  - `GET /api/mentors/:id` - Test mentor detail retrieval:
    - Valid mentor ID (returns full mentor data + reviews)
    - Invalid mentor ID (404 error)
    - Non-existent mentor ID (404 error)
    - Unverified mentor ID (should return 404 or 403, not show unverified)
  - Contract validation (request/response schemas match api-contracts.yaml)
  - Status codes correct (200, 400, 404, 500)
  - Error responses include proper error codes and messages
  - Performance (response time <500ms p95)
- **Responsibility:** QA team

---

### Test Types per Story

For each story in this epic (MYM-14, MYM-15, MYM-16, MYM-17), the following test types must be covered:

**Positive Test Cases:**

- Happy path (successful flow with valid data)
- Valid data variations (different valid query params, optional fields)
- Successful integration with database (queries return correct data)
- Successful rendering of UI components

**Negative Test Cases:**

- Invalid input data (malformed query params, out-of-range values)
- API failures (500 errors, timeouts, database unavailable)
- Empty states (no mentors found, no reviews for mentor)
- Broken images (photo URL 404, null photo_url)
- Unauthorized access (accessing unverified mentor profiles if blocked)

**Boundary Test Cases:**

- Min/max values (page=1, page=last, limit=1, limit=100, min_price=0, max_price=9999)
- Empty values (keyword empty, skills array empty, no filters applied)
- Edge cases (exactly 20 mentors on page, exactly 0 mentors match filter)
- Pagination edge cases (navigate beyond last page, negative page number)

**Security Test Cases:**

- SQL injection attempts (in keyword search, skills filter)
- XSS injection attempts (in mentor bio display, name display, review display)
- RLS policy enforcement (verify unverified mentors not returned)
- HTTPS enforcement (all API calls use https)

**Exploratory Testing:**

- User experience flows (discovery smoothness, filter clarity, mobile UX)
- Edge cases not covered in formal test cases
- Cross-browser/device compatibility issues
- **Recommendation:** Conduct exploratory testing session BEFORE implementation using Figma mockups/prototypes to identify UX issues early (Shift-Left!)

---

## 📊 Test Cases Summary by Story

### STORY-MYM-14: Mentor Gallery

**Complexity:** Medium
**Estimated Test Cases:** 22

**Rationale:** MYM-14 is the foundation of discovery - displays all verified mentors in a paginated gallery. Complexity comes from database integration (query with joins), pagination logic, and image loading. Not highly complex because it's a read-only display without filters (filters are in MYM-16).

**Breakdown:**

- **Positive: 6 test cases**
  - Load mentor gallery page 1 with default settings (20 mentors)
  - Navigate to page 2 (next 20 mentors)
  - Navigate to last page (remaining mentors)
  - Navigate back to page 1 from page 2
  - Mentor cards display correct data (photo, name, skills, rate, rating)
  - Click mentor card navigates to detail page
- **Negative: 6 test cases**
  - API returns 500 error (show error state with retry button)
  - API times out (show loading skeleton, then error)
  - No mentors exist in database (show empty state)
  - Mentor photo URL is broken (show placeholder avatar)
  - Navigate to page beyond total pages (handle gracefully, redirect to last page)
  - Database query fails (show error state)
- **Boundary: 5 test cases**
  - Exactly 20 mentors in database (1 page, no pagination controls)
  - Exactly 21 mentors in database (2 pages, pagination controls shown)
  - Mentor with no reviews (rating shows "No reviews yet")
  - Mentor with null photo_url (placeholder avatar shown)
  - Load gallery with 100+ mentors (performance test <2.5s LCP)
- **Integration: 5 test cases**
  - Frontend → Backend → Database flow (verify query joins profiles + mentor_profiles + reviews)
  - Pagination metadata correct (total_count, total_pages, current_page)
  - Only verified mentors returned (verification_status = 'verified')
  - Average rating calculated correctly from reviews table
  - Mentor photos load from Supabase Storage CDN

**Parametrized Tests:** Yes - test pagination with different page numbers (page=1, 2, 3, last). Test with different database states (0 mentors, 20, 50, 100).

---

### STORY-MYM-15: Keyword Search

**Complexity:** High
**Estimated Test Cases:** 26

**Rationale:** MYM-15 is the most complex story due to search algorithm implementation (full-text search, relevance, fuzzy matching), real-time updates, and numerous edge cases. Search quality directly impacts business KPIs (70% use search, 25% conversion rate).

**Breakdown:**

- **Positive: 7 test cases**
  - Search for exact skill name (e.g., "React") returns all React mentors
  - Search for partial skill name (e.g., "Reac") returns React mentors (if partial match implemented)
  - Search for mentor name returns that mentor
  - Search for keyword in bio returns matching mentors
  - Search is case-insensitive ("react" matches "React")
  - Search results update in real-time (no page reload)
  - Clear search query returns all mentors
- **Negative: 10 test cases**
  - Search for non-existent skill (e.g., "COBOL") returns empty state with helpful message
  - Search with SQL injection payload (e.g., `' OR '1'='1`) returns empty or sanitized results
  - Search with XSS payload (e.g., `<script>alert('XSS')</script>`) returns empty or sanitized results
  - Search with very long query (>100 chars) returns error or truncates
  - Search with special characters (e.g., `@#$%`) returns empty or handles gracefully
  - Search with only spaces returns all mentors (empty search)
  - API times out during search (show error state)
  - Rapidly type and delete search query (debounce works, no excessive API calls)
  - Search query with Unicode characters (e.g., "Español") handles correctly
  - Network offline during search (show offline message)
- **Boundary: 4 test cases**
  - Search query exactly at max length (if limit exists)
  - Search returns exactly 1 mentor
  - Search returns exactly 20 mentors (fits on 1 page)
  - Search returns 50+ mentors (pagination required)
- **Integration: 5 test cases**
  - Frontend → Backend → Database full-text search flow
  - Search uses full-text index on description field (verify in query plan)
  - Search on specialties array uses GIN index (verify in query plan)
  - Search results respect verification_status filter (only verified mentors)
  - Search response time <500ms p95 (performance test with 100+ mentors)

**Parametrized Tests:** Yes - test search with various query strings (skills, names, bio keywords, edge cases). Parametrize security payloads (SQL injection, XSS).

---

### STORY-MYM-16: Filters

**Complexity:** High
**Estimated Test Cases:** 34

**Rationale:** MYM-16 is highly complex due to multiple filter types (skills, price, rating, availability), filter combination logic (AND/OR), empty state handling, and real-time updates. Filter UX directly impacts business KPIs (>60% interact with filters, <5% bounce rate).

**Breakdown:**

- **Positive: 8 test cases**
  - Select single skill filter (e.g., React) returns only React mentors
  - Select multiple skills (e.g., React + AWS) returns mentors with React OR AWS (if OR logic)
  - Set price range (min $50, max $100) returns mentors in range
  - Set min rating (e.g., 4.0+) returns mentors with avg_rating >= 4.0
  - Set availability filter (available=true) returns mentors with open slots
  - Combine all filters (skills + price + rating + availability) returns matching mentors
  - Clear all filters returns all verified mentors
  - Filters update results in real-time (no page reload)
- **Negative: 12 test cases**
  - Apply filter with zero matches (show empty state with helpful message)
  - Set min_price > max_price (validation error or swap values)
  - Set min_price = 0 (should allow or show validation error?)
  - Set max_price = 9999 (should allow or cap at reasonable max?)
  - Set min_rating > 5.0 (validation error)
  - Set min_rating < 0 (validation error)
  - Select skill that no mentor has (empty state)
  - Availability filter when availability table is empty (no mentors have availability data)
  - API fails during filter application (show error state)
  - Rapidly select/deselect filters (debounce works, no excessive API calls)
  - Apply filters, then network goes offline (show offline message)
  - Select filters, then clear browser cache (filters reset correctly)
- **Boundary: 8 test cases**
  - Price range exactly matches one mentor ($75 - $75)
  - Min rating exactly at threshold (e.g., mentor has 4.0 rating, filter is min 4.0 - should match)
  - Select all available skills (all mentors shown)
  - Select 10+ skills (UI handles many selections)
  - Min price = max price (single price point)
  - Filter results in exactly 1 mentor
  - Filter results in exactly 20 mentors (fits on 1 page)
  - Filter results in 50+ mentors (pagination works with filters)
- **Integration: 6 test cases**
  - Frontend filter state → Backend query params (verify correct URL params sent)
  - Backend applies all filters correctly in SQL query
  - Filters combine with AND logic across categories (skills + price + rating)
  - Filters within skills combine with OR logic (React OR AWS)
  - Pagination works correctly with filters applied (page 2 of filtered results)
  - Filter count badges update correctly (if implemented as improvement)

**Parametrized Tests:** Yes - test price ranges with various min/max combinations. Test rating thresholds (3.0, 3.5, 4.0, 4.5, 5.0). Test skill combinations (single, multiple, all).

---

### STORY-MYM-17: Mentor Detail Page

**Complexity:** Medium
**Estimated Test Cases:** 20

**Rationale:** MYM-17 displays comprehensive mentor information and reviews. Moderate complexity due to data aggregation (reviews), pagination (reviews), and integration with EPIC-MYM-18 (Book a Session CTA). Not highly complex because it's mostly read-only display.

**Breakdown:**

- **Positive: 6 test cases**
  - Load mentor detail page with valid mentor ID
  - All mentor data displayed correctly (photo, name, bio, skills, rate, rating, review count)
  - LinkedIn/GitHub links displayed and clickable (open in new tab)
  - Reviews displayed with pagination (first 5-10 reviews)
  - Navigate to review page 2 (next reviews)
  - "Book a Session" CTA button present and navigates to booking flow (EPIC-MYM-18)
- **Negative: 7 test cases**
  - Load mentor detail with invalid mentor ID (404 error)
  - Load mentor detail with non-existent mentor ID (404 error)
  - Load mentor detail for unverified mentor (404 or 403 error, should not be accessible)
  - Mentor photo URL broken (show placeholder avatar)
  - Mentor has no reviews (show "No reviews yet" message)
  - LinkedIn URL is null (don't show LinkedIn link)
  - GitHub URL is null (don't show GitHub link)
- **Boundary: 4 test cases**
  - Mentor with exactly 1 review (no pagination)
  - Mentor with exactly 10 reviews (1 page, no pagination if 10 per page)
  - Mentor with 50+ reviews (pagination required)
  - Mentor bio at max length (500 chars, display handles long text)
- **Integration: 3 test cases**
  - Frontend → Backend → Database flow (verify query joins profiles + mentor_profiles + reviews)
  - Reviews sorted correctly (most recent first, per missing info needs clarification)
  - Availability calendar preview displayed (if availability filter is implemented)

**Parametrized Tests:** No - test cases are diverse enough that parametrization doesn't add significant value. Could parametrize review pagination (page 1, 2, last).

---

### Total Estimated Test Cases for Epic

**Total:** 102 test cases

**Breakdown:**

- Positive: 27
- Negative: 35
- Boundary: 21
- Integration: 19

**NOTE:** This is a realistic estimate based on complexity analysis. MYM-15 (search) and MYM-16 (filters) are the most complex (26 and 34 cases respectively) due to algorithm complexity and edge cases. MYM-14 and MYM-17 are moderate complexity (22 and 20 cases). We do NOT force minimum numbers - estimate reflects actual testing needs for quality assurance.

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

Based on user personas (Laura, Carlos, Sofía) and realistic marketplace data:

- **Verified Mentors (various profiles for discovery testing):**
  - **Mentor 1 - React Specialist:**
    - Name: Carlos Mendoza
    - Specialties: ["React", "TypeScript", "Next.js", "Redux"]
    - Hourly Rate: $75.00
    - Bio: "Frontend architect with 10 years of experience in React ecosystem."
    - LinkedIn: https://www.linkedin.com/in/carlosmendoza
    - GitHub: https://github.com/carlosmendoza
    - Photo: Valid Supabase Storage URL
    - Verification Status: verified
    - Reviews: 15 reviews, avg rating 4.7
  - **Mentor 2 - AWS Expert:**
    - Name: María González
    - Specialties: ["AWS", "DevOps", "Terraform", "Kubernetes"]
    - Hourly Rate: $100.00
    - Bio: "Cloud solutions architect, AWS certified professional."
    - Average Rating: 4.9, 23 reviews
  - **Mentor 3 - Full-Stack:**
    - Name: Juan Pérez
    - Specialties: ["Python", "Django", "React", "PostgreSQL"]
    - Hourly Rate: $60.00
    - Average Rating: 4.3, 8 reviews
  - **Mentor 4 - Budget-Friendly:**
    - Name: Ana Rodríguez
    - Specialties: ["JavaScript", "Node.js", "Express"]
    - Hourly Rate: $40.00
    - Average Rating: 4.5, 12 reviews
  - **Mentor 5 - Premium:**
    - Name: Roberto Sánchez
    - Specialties: ["System Design", "Microservices", "AWS", "Go"]
    - Hourly Rate: $150.00
    - Average Rating: 5.0, 30 reviews
  - **Mentor 6 - No Reviews:**
    - Name: Laura Fernández
    - Specialties: ["Vue.js", "Nuxt.js", "CSS"]
    - Hourly Rate: $50.00
    - Reviews: 0 reviews, no rating
  - **Mentor 7 - No Photo:**
    - Name: Pedro Martínez
    - Specialties: ["Java", "Spring Boot"]
    - Hourly Rate: $65.00
    - Photo: null (test placeholder avatar)
  - Create 50+ additional mentors with Faker.js for pagination and load testing

**Invalid Data Sets:**

- **Unverified Mentors (should NOT appear in search):**
  - Mentor with verification_status = 'pending'
  - Mentor with verification_status = 'rejected'
- **Search/Filter Attack Payloads:**
  - SQL Injection in keyword: `' OR '1'='1`, `'; DROP TABLE mentors;--`
  - XSS in keyword: `<script>alert('XSS')</script>`, `<img src=x onerror=alert('XSS')>`
  - SQL Injection in skills: `["React' OR '1'='1"]`
- **Invalid Query Params:**
  - min_price = -50 (negative price)
  - max_price = 0 (zero price)
  - min_rating = 6.0 (out of range)
  - page = -1 (negative page)
  - limit = 200 (exceeds max 100)

**Boundary Data Sets:**

- **Min/Max values:**
  - Price range: min $0 (or $1), max $9999
  - Rating: min 0.0, max 5.0
  - Page: 1, last page, page beyond total
  - Limit: 1, 20 (default), 100 (max)
- **Edge cases:**
  - Mentor with exactly 500 char bio (max length)
  - Mentor with exactly 20 skills (if max exists)
  - Mentor with hourly rate $0.01 (if allowed)
  - Search query exactly 100 chars (if max exists)
- **Empty states:**
  - Database with 0 verified mentors
  - Mentor with 0 reviews
  - Mentor with null LinkedIn URL
  - Mentor with null GitHub URL
  - Mentor with null photo_url
- **Pagination edge cases:**
  - Database with exactly 20 mentors (1 page, no pagination)
  - Database with exactly 21 mentors (2 pages)
  - Database with 100+ mentors (multiple pages)

**Test Data Management:**

- Use Faker.js for generating realistic mentor profiles (names, bios, skills)
- Create data factories for mentors with various characteristics (skills, prices, ratings)
- Seed test database with 50+ verified mentors, 5+ unverified mentors, 100+ reviews
- Clean up test data after test suite execution (delete test mentors, reviews)
- Use separate test database for integration/E2E tests (not production or staging)
- For E2E tests, seed database before test suite runs, clean up after

---

### Test Environments

**Staging Environment:**

- URL: [To be provided by DevOps]
- Database: Supabase staging project with seeded mentor data
- Supabase Storage: Staging bucket with test mentor photos
- **Purpose:** Primary testing environment for all test levels (integration, E2E, API)

**Production Environment:**

- URL: https://upexmymentor.com (or TBD)
- **Purpose:** ONLY smoke tests post-deployment
- **Restrictions:**
  - NO destructive tests
  - NO test data creation
  - ONLY verify critical paths work (mentor gallery loads, search works, detail page loads)
  - Run smoke tests via CI/CD after production deployment

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)

Testing can start when:

- [ ] Story is fully implemented and deployed to staging environment
- [ ] Code review is approved by 2+ reviewers
- [ ] Unit tests exist and are passing (>80% coverage for search/filter logic)
- [ ] Dev has done smoke testing and confirms basic functionality works (happy path)
- [ ] No blocker bugs exist in dependent stories (MYM-14 must be done before MYM-15/16/17)
- [ ] Test data is prepared and available in staging (50+ mentors seeded, reviews seeded)
- [ ] API documentation is updated in api-contracts.yaml (if API changes)
- [ ] Critical ambiguities from this test plan are clarified by PO/Dev (especially search algorithm, filter logic, ordering)
- [ ] Test cases are designed and reviewed (story-test-cases.md prompt executed)

### Exit Criteria (Per Story)

Story is considered "Done" from QA perspective when:

- [ ] All test cases are executed
- [ ] Critical/High priority test cases: 100% passing
- [ ] Medium/Low priority test cases: ≥95% passing
- [ ] All critical and high severity bugs are resolved and verified
- [ ] Medium severity bugs have mitigation plan or are scheduled for next sprint
- [ ] Regression testing passed (if changes affect existing features)
- [ ] Non-functional requirements validated:
  - Performance: Page load <2.5s LCP, API response <500ms p95
  - Security: No SQL injection, XSS vulnerabilities
  - Usability: WCAG 2.1 AA compliance (keyboard navigation, screen reader)
- [ ] Test execution report is generated and shared with team
- [ ] Known issues are documented in release notes (if any medium/low bugs remain)

### Epic Exit Criteria

Epic is considered "Done" from QA perspective when:

- [ ] ALL stories (MYM-14, MYM-15, MYM-16, MYM-17) meet individual exit criteria
- [ ] Integration testing across all stories is complete:
  - Full user journey: Login → Search → Filter → Browse → View Detail tested
  - API contract testing complete (GET /api/mentors, GET /api/mentors/:id validated)
- [ ] E2E testing of critical user journeys is complete and passing:
  - Laura's discovery journey (search + filter + detail)
  - Browse without filters journey
  - Empty state journey (zero results)
  - Mobile discovery journey
- [ ] Non-functional testing is complete:
  - Performance testing (LCP <2.5s, API <500ms, load with 100+ mentors)
  - Security testing (SQL injection, XSS, RLS enforcement)
  - Usability testing (WCAG 2.1 AA compliance, mobile UX)
  - Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Mobile responsiveness testing (iOS, Android)
- [ ] Exploratory testing session completed (findings documented and triaged)
- [ ] No critical or high severity bugs open
- [ ] Medium bugs reviewed and accepted by PO for release (or scheduled)
- [ ] QA sign-off document is created and approved by QA Lead and Product Owner
- [ ] Test metrics collected and reported (test pass rate, bug detection rate, coverage)
- [ ] Epic meets business KPIs readiness:
  - Search returns results <500ms
  - 70% of mentees can use search/filters successfully
  - Mentor gallery loads <2.5s with 50+ mentors

---

## 📝 Non-Functional Requirements Validation

### Performance Requirements

**NFR-P-001: Page Load Time (LCP) < 2.5s on 3G**

- **Target:** <2.5 seconds for mentor gallery and detail pages (from NFR specs)
- **Test Approach:**
  - Use Lighthouse in Chrome DevTools (throttled to 3G)
  - Test on staging with realistic network conditions
  - Measure LCP for /mentors page (gallery) and /mentors/:id page (detail)
  - Test with 50, 100, 200 mentors in database
- **Tools:** Lighthouse, WebPageTest
- **Pass Criteria:** LCP <2.5s for both gallery and detail pages on 3G

**NFR-P-002: API Response Time < 500ms (p95)**

- **Target:** <500ms p95 percentile for GET /api/mentors and GET /api/mentors/:id (epic metric)
- **Test Approach:**
  - Load test API endpoints with realistic concurrency (10-50 concurrent users)
  - Measure p50, p95, p99 response times
  - Test GET /api/mentors with various filter combinations
  - Test GET /api/mentors/:id with valid mentor IDs
- **Tools:** k6 or Apache JMeter
- **Pass Criteria:** p95 response time <500ms for both endpoints

**NFR-P-003: Filters Update UI in <200ms**

- **Target:** <200ms for filter updates without page reload (epic metric)
- **Test Approach:**
  - Measure time from filter selection to UI re-render
  - Test with various filter combinations
  - Verify debouncing works (no excessive API calls)
- **Tools:** Chrome DevTools Performance tab
- **Pass Criteria:** Filter updates feel instant (<200ms)

**NFR-P-004: Concurrent Users Support (100 users for MVP)**

- **Target:** 100 concurrent users without degradation (NFR spec)
- **Test Approach:**
  - Load test with 100 concurrent users browsing mentor gallery and searching
  - Monitor response times, error rates, database connections
  - Verify no performance degradation under load
- **Tools:** k6 with ramping scenario
- **Pass Criteria:** No errors, response times remain <500ms at 100 concurrent users

---

### Security Requirements

**NFR-S-001: SQL Injection Prevention in Search/Filter Inputs**

- **Requirement:** All search and filter inputs validated and sanitized (NFR-S-002)
- **Test Approach:**
  - Inject SQL injection payloads in keyword search (`' OR '1'='1`, `'; DROP TABLE mentors;--`)
  - Inject SQL injection payloads in skills filter, price range
  - Verify payloads are escaped/rejected, not executed
  - Verify Supabase client SDK uses parameterized queries
- **Tools:** Manual testing with payloads, OWASP ZAP (optional)
- **Pass Criteria:** No SQL injection vulnerabilities found

**NFR-S-002: XSS Prevention in Mentor Data Display**

- **Requirement:** All user-generated content sanitized before rendering (NFR-S-002)
- **Test Approach:**
  - Test mentor bio, name, skills display with XSS payloads (`<script>alert('XSS')</script>`)
  - Test review comments with XSS payloads
  - Verify React escapes by default (no dangerouslySetInnerHTML for user content)
  - Implement Content Security Policy (CSP) headers
- **Tools:** Manual testing with payloads, browser dev tools
- **Pass Criteria:** No XSS vulnerabilities found

**NFR-S-003: RLS Policy Enforcement (Only Verified Mentors Visible)**

- **Requirement:** Only verified mentors returned in search/gallery (epic AC #1)
- **Test Approach:**
  - Seed database with verified and unverified mentors
  - Query GET /api/mentors and verify only verified mentors returned
  - Attempt to access unverified mentor detail page (should 404)
  - Verify RLS policy on mentor_profiles table enforces verification_status filter
- **Tools:** API testing, manual DB inspection
- **Pass Criteria:** No unverified mentors accessible via API or UI

**NFR-S-004: HTTPS Only for All Communication**

- **Requirement:** All frontend-backend communication uses HTTPS/TLS 1.3 (NFR-S-001)
- **Test Approach:**
  - Verify all API calls use https:// protocol
  - Attempt http:// request (should auto-redirect or fail)
  - Check TLS version in browser dev tools (should be TLS 1.3)
- **Tools:** Browser dev tools (Network tab), SSL Labs test
- **Pass Criteria:** All traffic encrypted, TLS 1.3, no http allowed

---

### Usability Requirements

**NFR-U-001: WCAG 2.1 AA Compliance**

- **Requirement:** Mentor gallery, search, filters, detail page meet WCAG 2.1 AA (NFR-U)
- **Test Approach:**
  - Keyboard navigation testing (Tab, Enter, Esc keys work for all interactions)
  - Screen reader testing (VoiceOver on Mac, NVDA on Windows)
  - Color contrast validation (4.5:1 for text)
  - Focus indicators visible on all interactive elements
  - Test filter controls are keyboard accessible (checkboxes, sliders)
  - Test search autocomplete is screen reader accessible (if implemented)
- **Tools:** Lighthouse accessibility audit, axe DevTools, manual testing
- **Pass Criteria:** No WCAG 2.1 AA violations, keyboard navigable, screen reader compatible

**NFR-U-002: Clear Error Messages and Empty States**

- **Requirement:** Validation errors and empty states are helpful (epic AC #9)
- **Test Approach:**
  - Trigger empty state (no mentors match filters)
  - Verify error message is specific and helpful (e.g., "No mentors found. Try adjusting your filters.")
  - Verify "Clear filters" or "Reset" option is available
  - Test API error state (500 error, timeout) shows retry option
- **Tools:** Manual testing, screen reader
- **Pass Criteria:** All error messages clear, specific, accessible

---

## 🔄 Regression Testing Strategy

**Regression Scope:**

This epic builds on EPIC-MYM-2 (User Authentication) and EPIC-MYM-8 (Mentor Vetting), so regression testing must ensure:

- Authentication still works (login required to access mentor gallery)
- User profiles still load correctly (mentor detail page shows mentor profile data)
- Mentor vetting status correctly filters search results (only verified mentors shown)

**Regression Testing (for EPIC-MYM-13):**

- [ ] Login flow still works (dependency on EPIC-MYM-2)
- [ ] Mentor profiles created in EPIC-MYM-2 are correctly displayed in gallery (integration)
- [ ] Mentor verification status from EPIC-MYM-8 correctly filters search (only verified shown)
- [ ] Mentor profile detail page shows data from profiles and mentor_profiles tables (integration)
- [ ] Navigation across pages (login → gallery → detail) works without errors

**Regression Test Execution:**

- Run automated regression suite (unit + integration tests) before starting epic testing
- Re-run after all stories are complete
- Focus on integration points when testing EPIC-MYM-13 changes

---

## 📅 Testing Timeline Estimate

**Estimated Duration:** 2-3 sprints (4-6 weeks)

**Breakdown:**

- **Test case design:** 4 days (1 day per story, MYM-15/16 need extra time for complexity)
- **Test data preparation:** 2 days (seed 50+ mentors, 100+ reviews, create Faker factories)
- **Test execution (per story):**
  - MYM-14 (22 cases): 2.5 days
  - MYM-15 (26 cases): 3 days
  - MYM-16 (34 cases): 3.5 days
  - MYM-17 (20 cases): 2.5 days
  - **Total execution:** 11.5 days
- **Integration testing:** 2.5 days (test cross-story flows, full user journey)
- **E2E testing:** 3 days (critical user journeys)
- **Non-functional testing (performance, security, accessibility):** 3 days
- **Bug fixing cycles:** 5 days buffer (3-4 bug fix iterations expected for search/filter complexity)
- **Exploratory testing:** 2 days
- **Regression testing:** 1.5 days (test dependencies on EPIC-MYM-2, MYM-8)
- **Test reporting and sign-off:** 1 day

**Total:** ~36 days (approximately 2-3 sprints with 2 QA resources)

**Dependencies:**

- Depends on: EPIC-MYM-2 (User Authentication) - COMPLETE, EPIC-MYM-8 (Mentor Vetting) - COMPLETE
- Blocks: EPIC-MYM-18 (Scheduling & Booking) - discovery enables booking via "Book a Session" CTA

---

## 🛠️ Tools & Infrastructure

**Testing Tools:**

- **E2E Testing:** Playwright (TypeScript, supports all browsers, mobile testing)
- **API Testing:** Postman/Newman or Playwright API testing
- **Unit Testing:** Vitest (frontend), Jest (backend if separate)
- **Performance Testing:** Lighthouse (page load), k6 (API load testing)
- **Security Testing:** OWASP ZAP (optional), manual testing with payloads
- **Accessibility Testing:** Lighthouse, axe DevTools, manual screen reader testing
- **Test Data:** Faker.js for generating realistic mentor profiles and reviews
- **Visual Regression:** Percy or Chromatic (optional, for future)

**CI/CD Integration:**

- [ ] Tests run automatically on PR creation (unit + integration tests)
- [ ] Tests run on merge to main branch (full test suite including E2E)
- [ ] Tests run on deployment to staging (smoke tests + full suite)
- [ ] Smoke tests run on deployment to production (critical paths only)
- [ ] Test results reported in GitHub PR comments
- [ ] Failed tests block PR merge

**Test Management:**

- Jira for story tracking and bug tracking
- Test cases documented per story (using story-test-cases.md prompt)
- Test execution tracked in spreadsheet or Jira Xray (if available)
- Bug tracking in Jira with priority labels (Critical, High, Medium, Low)
- Test reports generated per story and per epic (summary metrics)

---

## 📊 Metrics & Reporting

**Test Metrics to Track:**

- Test cases executed vs. total (daily)
- Test pass rate (% passing)
- Bug detection rate (bugs found per test case)
- Bug fix rate (bugs fixed per day)
- Test coverage (unit test code coverage from Vitest/Jest reports)
- Time to test (actual days per story vs. estimated)
- Test execution velocity (test cases per day)
- Business KPI readiness (search <500ms, gallery <2.5s LCP)

**Reporting Cadence:**

- **Daily:** Test execution status update (standup report: X cases executed, Y passing, Z bugs found)
- **Per Story:** Test completion report (summary: total cases, pass rate, bugs, status)
- **Per Epic:** Comprehensive QA sign-off report (final metrics, risk summary, known issues, sign-off)

**Report Template (Per Story):**

```
Story: MYM-X - [Title]
Test Cases: X executed / Y total
Pass Rate: X%
Bugs Found: X (Critical: X, High: X, Medium: X, Low: X)
Bugs Fixed: X
Open Bugs: X (blocking/non-blocking)
Status: In Progress | Blocked | Complete
```

**Report Template (Per Epic):**

```
Epic: MYM-13 - Mentor Discovery & Search
Stories Tested: 4/4 complete
Total Test Cases: 102 executed
Pass Rate: X%
Total Bugs Found: X
Bugs Fixed: X
Open Bugs: X (with severity breakdown)
Critical Risks Mitigated: [List]
Known Issues: [List for release notes]
Business KPIs Met: Search <500ms (Yes/No), Gallery <2.5s (Yes/No)
QA Sign-off: Approved / Pending / Rejected
```

---

## 🎓 Notes & Assumptions

**Assumptions:**

- Supabase Database is pre-configured with mentor_profiles, profiles, reviews, availability tables
- Database is seeded with 50+ verified mentors and 100+ reviews before testing starts
- Figma designs for mentor gallery, search, filters, detail page are available for UI validation
- PO/Dev will answer critical ambiguities BEFORE implementation starts (Shift-Left!)
- 2 QA resources available for this epic (1 for test case design, 1 for execution)
- Access to staging environment and Supabase dashboard for DB inspection
- EPIC-MYM-2 (Auth) and EPIC-MYM-8 (Vetting) are complete and tested
- Availability table may not be implemented yet (availability filter may be deferred to EPIC-MYM-18)

**Constraints:**

- Time: 2-3 sprints (4-6 weeks) - tight but achievable with 2 QA resources and parallel dev/test
- Resources: 2 QA engineers (if only 1, extend timeline to 4 sprints)
- Tools: Playwright license not required (open source), but Jira Xray may require license
- Environment: Staging environment must be stable (no frequent deployments during testing)

**Known Limitations:**

- Cannot fully test search relevance without real user queries (will use synthetic test queries)
- Load testing limited to 100 concurrent users (MVP target) - higher load not tested
- Penetration testing not in scope - recommend external security audit before production launch
- Accessibility testing limited to automated tools + manual testing - no formal WCAG certification
- Multi-language support not tested (out of scope for MVP)
- Availability filter may be blocked if availability table not implemented (dependency on EPIC-MYM-18)

**Exploratory Testing Sessions:**

- **Recommended:** 2 exploratory testing sessions BEFORE and AFTER implementation
  - **Session 1 (BEFORE dev starts):** Test with Figma mockups/prototypes
    - Goal: Identify UX issues, confusing filter UI, search UX problems EARLY
    - Participants: QA Lead + UX Designer + 1 Dev
    - Duration: 2 hours
    - Output: List of UX improvements to add to stories
  - **Session 2 (AFTER implementation):** Test edge cases not covered in formal test cases
    - Goal: Find bugs outside scripted test cases, test realistic user discovery scenarios
    - Participants: 2 QA engineers
    - Duration: 4 hours (2 hours per QA)
    - Output: Bug reports for any issues found

---

## 📎 Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/epic.md`
- **Stories:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-*/story.md` (to be generated)
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/` (executive-summary.md, user-personas.md, user-journeys.md)
- **SRS:** `.context/SRS/` (functional-specs.md - FR-006, FR-007, FR-008, non-functional-specs.md, architecture-specs.md, api-contracts.yaml)
- **Dependencies:** EPIC-MYM-2 (User Authentication & Profiles), EPIC-MYM-8 (Mentor Vetting & Onboarding)
- **Jira Epic:** https://upexgalaxy61.atlassian.net/browse/MYM-13

---

**Formato:** Markdown estructurado siguiendo flujo **JIRA-FIRST → LOCAL MIRROR**

**Generated with Shift-Left Testing principles:** Analyze early, test early, prevent bugs before code is written.
