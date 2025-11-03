# EPIC-003: Mentor Discovery & Search

**Jira Key:** MYM-13
**Status:** ASSIGNED
**Priority:** CRITICAL
**Phase:** Core Marketplace (Sprint 3-4)

---

## Epic Description

This epic delivers the core marketplace experience for mentees: finding the right mentor. It includes features for browsing, searching, and filtering the list of available, approved mentors. This is where the value proposition of "access to verified expertise" comes to life through a well-designed discovery interface.

**Business Value:**
This is the primary entry point for revenue generation. Mentees must be able to:
- Discover mentors that match their specific needs
- Filter by relevant criteria (skills, price, availability, ratings)
- Make informed decisions through detailed mentor profiles
- Feel confident in their choice through transparent information

Without effective discovery, mentees cannot find mentors, and the marketplace fails.

---

## User Stories

1. **MYM-14** - As a Mentee, I want to see a gallery of all available mentors so that I can browse my options
2. **MYM-15** - As a Mentee, I want to search for mentors by keyword so that I can find relevant experts
3. **MYM-16** - As a Mentee, I want to filter mentors by their skills or technologies so that I can narrow down my search
4. **MYM-17** - As a Mentee, I want to view a mentor's detailed public profile so that I can decide if they are a good fit for me

---

## Scope

### In Scope
- **Mentor Gallery/Listing Page:**
  - Grid or card-based layout showing mentor previews
  - Pagination or infinite scroll
  - Shows: photo, name, primary skills, hourly rate, average rating
  - Only displays verified mentors (from EPIC-002)

- **Search Functionality:**
  - Keyword search across mentor bio, skills, name
  - Real-time search results
  - "No results" state with helpful messaging

- **Filtering:**
  - Filter by specific skills/technologies (multi-select)
  - Filter by price range (min/max hourly rate)
  - Filter by availability (has open slots)
  - Filter by rating (minimum rating threshold)
  - Clear all filters option

- **Mentor Detail Page:**
  - Full profile information
  - Bio/description
  - Skills/specialties list
  - Hourly rate prominently displayed
  - Average rating and total reviews
  - Recent reviews (paginated)
  - LinkedIn/GitHub links (if public)
  - Availability calendar preview
  - "Book a Session" CTA button

### Out of Scope (Future)
- Sorting options (price low-to-high, rating, popularity)
- Saved/favorited mentors
- Mentor recommendations based on user behavior
- Advanced filters (years of experience, location/timezone)
- "Recently viewed" mentors
- Mentor video introductions
- AI-powered matching

---

## Acceptance Criteria (Epic Level)

1. ✅ Mentor gallery displays all verified mentors with key information
2. ✅ Search returns relevant results based on keyword matching
3. ✅ Filters can be combined (e.g., "React" + "$50-$100/hr" + "4+ stars")
4. ✅ Filter results update in real-time without page reload
5. ✅ Mentor detail page shows comprehensive information
6. ✅ All mentor data is pulled from database (no hardcoded mentors)
7. ✅ Page loads in <2 seconds with 50 mentors
8. ✅ Mobile-responsive design for all discovery interfaces
9. ✅ Empty states are handled gracefully (no mentors match filters)
10. ✅ Clicking "Book a Session" navigates to booking flow (EPIC-004)

---

## Related Functional Requirements

- **FR-006:** El sistema debe permitir a los estudiantes buscar mentores por especialidad técnica
- **FR-007:** El sistema debe permitir a los estudiantes filtrar mentores por precio, disponibilidad y valoraciones
- **FR-008:** El sistema debe permitir a los estudiantes ver el perfil detallado de un mentor

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Database Queries
- **Mentor Listing:**
  ```sql
  SELECT profiles.*, mentor_profiles.*, AVG(reviews.rating) as avg_rating
  FROM profiles
  JOIN mentor_profiles ON profiles.id = mentor_profiles.profile_id
  LEFT JOIN reviews ON mentor_profiles.id = reviews.mentor_id
  WHERE mentor_profiles.verification_status = 'verified'
  GROUP BY profiles.id
  ```

- **Search with Filters:**
  - Full-text search on `profiles.description` and `mentor_profiles.specialties`
  - Range query on `hourly_rate`
  - Join with `availability` table for availability filter
  - Rating filter on aggregated reviews

### Performance Optimization
- **Indexing:**
  - Index on `mentor_profiles.verification_status`
  - Full-text index on `profiles.description`
  - GIN index on `mentor_profiles.specialties` (array)
  - Index on `mentor_profiles.hourly_rate`

- **Caching:**
  - Cache mentor gallery page for 5 minutes (invalidate on new approvals)
  - Cache individual mentor profiles for 1 hour
  - Use Supabase Realtime for live updates (optional for MVP)

- **Pagination:**
  - Limit to 20 mentors per page
  - Use cursor-based pagination for better performance

### API Endpoints (from SRS)
- `GET /api/mentors` - List mentors with query params
  - `?keyword=react`
  - `?skills[]=react&skills[]=typescript`
  - `?min_price=50&max_price=150`
  - `?min_rating=4.0`
  - `?available=true`
  - `?page=1&limit=20`

- `GET /api/mentors/:id` - Get mentor detail

See: `.context/SRS/api-contracts.yaml`

### Frontend Components
- `MentorGallery` - Grid layout of mentor cards
- `MentorCard` - Preview card component
- `SearchBar` - Keyword search input with autocomplete
- `FilterSidebar` - Multi-select filters
- `MentorProfile` - Full profile page
- `RatingDisplay` - Star rating visualization
- `ReviewCard` - Individual review component

---

## Dependencies

### External Dependencies
- None (all data from Supabase)

### Internal Dependencies
- **EPIC-001 (User Authentication):** Required
  - Mentor profiles must exist
- **EPIC-002 (Mentor Vetting):** Required
  - Only verified mentors are shown
- **EPIC-007 (Reputation & Reviews):** Partial
  - Can launch without reviews, but UX is better with them
  - Average rating display will be empty if no reviews exist

### Blocks
- **EPIC-004 (Scheduling & Booking):** Discovery enables booking

---

## Success Metrics

### Functional Metrics
- Search returns results in <500ms for keyword queries
- Filters update UI in <200ms
- Mentor detail page loads in <1 second
- 0 broken mentor profile links

### Business Metrics (from Executive Summary)
- 70% of mentees use search/filters (indicates need for discovery)
- Average time on mentor discovery page: 3-5 minutes
- 40% of mentees visit 3+ mentor profiles before booking
- 25% conversion rate from mentor profile view to booking attempt

### UX Metrics
- <5% bounce rate on mentor gallery
- >60% users interact with filters
- Average 2.5 filter combinations per session

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Poor search relevance (users can't find mentors) | High | Medium | Implement fuzzy search, test with real queries, iterate on algorithm |
| Slow page load with many mentors | Medium | Medium | Implement pagination, caching, lazy loading |
| Empty state (no mentors match filters) | Medium | High | Show helpful messaging, suggest relaxing filters |
| Filter overload confuses users | Low | Medium | Start with essential filters only, add progressively |
| Mentor photos missing (broken UX) | Low | Medium | Require photo during profile creation, use placeholder avatars |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-003-mentor-discovery/feature-test-plan.md`

### Test Coverage Requirements
- **Unit Tests:** Search/filter logic (>90% coverage)
- **Integration Tests:** API endpoints return correct filtered results
- **E2E Tests:** Full user journey from search to mentor profile view
- **Performance Tests:** Page load with 100+ mentors, search latency
- **Accessibility Tests:** Keyboard navigation, screen reader compatibility

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-003-mentor-discovery/feature-implementation-plan.md`

### Recommended Story Order
1. MYM-14 (Mentor gallery) - Foundation, basic listing
2. MYM-15 (Search) - Add keyword search
3. MYM-16 (Filters) - Add filtering capabilities
4. MYM-17 (Mentor detail page) - Complete discovery flow

### Estimated Effort
- **Development:** 2-3 sprints (4-6 weeks)
- **Testing:** 0.5 sprint (1 week)
- **Total:** 3-4 sprints

---

## Design Considerations

### Mentor Card Design
Each mentor card should display:
```
┌─────────────────────────┐
│ [Photo]                 │
│ Name                    │
│ Primary Skill           │
│ ★★★★☆ 4.7 (23 reviews) │
│ $100/hr                 │
│ [View Profile]          │
└─────────────────────────┘
```

### Filter Sidebar Design
```
Search: [____________]

Skills:
☑ React
☑ TypeScript
☐ Python
☐ AWS

Price Range:
[$50] ─── [$150]

Min Rating:
★★★★☆ 4.0+

Availability:
☐ Available this week

[Clear Filters]
```

### Mentor Detail Page Layout
```
┌───────────────────────────────────┐
│ [Photo] Name          $100/hr     │
│         ★★★★☆ 4.7 (23)            │
│                                   │
│ About                             │
│ [Bio text...]                     │
│                                   │
│ Skills: React, TypeScript, AWS    │
│                                   │
│ 🔗 LinkedIn  🔗 GitHub            │
│                                   │
│ [Book a Session]                  │
├───────────────────────────────────┤
│ Reviews (23)                      │
│ ┌─────────────────────────┐       │
│ │ ★★★★★ John D.           │       │
│ │ "Excellent mentor..."   │       │
│ └─────────────────────────┘       │
└───────────────────────────────────┘
```

---

## Notes

- Consider A/B testing different layouts (grid vs. list view)
- Monitor which filters are most used to prioritize future enhancements
- Ensure mentor photos are optimized for web (WebP format, lazy loading)
- Consider adding "Featured Mentors" section in v2
- LinkedIn/GitHub links should open in new tab

---

## Related Documentation

- **PRD:** `.context/PRD/user-journeys.md` (Mentee discovery journey)
- **PRD:** `.context/PRD/user-personas.md` (Laura - the Developer Junior)
- **SRS:** `.context/SRS/functional-specs.md` (FR-006, FR-007, FR-008)
- **Architecture:** `.context/SRS/architecture-specs.md` (API design)
- **API:** `.context/SRS/api-contracts.yaml` (Mentor endpoints)
