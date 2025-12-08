# STORY-MYM-15: Search Mentors by Keyword

**Jira Key:** MYM-15
**Epic:** MYM-13 - Mentor Discovery & Search
**Status:** IN REVIEW (PR #41)
**Priority:** Medium
**Labels:** `shift-left-reviewed`

---

## User Story

As a Mentee, I want to search for mentors by keyword so that I can find relevant experts

---

## Description

To quickly find relevant mentors, a mentee should be able to type a keyword (like a programming language, tool, or concept) into a search bar and see a list of matching mentors.

**Search Behavior (Refined):**
- Search is **case-insensitive** ("react" matches "React")
- Search uses **partial matching** ("Java" matches "JavaScript")
- Search covers **multiple fields**: `full_name`, `bio`, and `specialties[]`
- Only **verified mentors** appear in search results
- Multiple words use **OR logic** ("React TypeScript" shows mentors with either skill)

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentee performs a successful search

* **Given:** A mentee is on the mentor gallery page (`/mentors`)
* **And:** Verified mentors exist with "React" in their profile (name, bio, or specialties)
* **When:** They type "React" into the search bar and press Enter (or wait 300ms debounce)
* **Then:** The gallery updates to show only verified mentors matching "React"
* **And:** The URL updates to `/mentors?keyword=React`
* **And:** A loading skeleton is shown during the search

### Scenario 2: Search yields no results

* **Given:** A mentee is on the mentor gallery page
* **When:** They type a keyword that matches no mentors, like "COBOL"
* **Then:** The gallery displays: "No mentors found matching 'COBOL'. Try a different search term."
* **And:** A "Clear search" button is displayed
* **And:** No mentor cards are shown

### Scenario 3: Case-insensitive search

* **Given:** A mentor exists with specialty "React"
* **When:** The mentee searches "react" (lowercase)
* **Then:** The mentor with "React" appears in results

### Scenario 4: Partial match search

* **Given:** A mentor exists with specialty "JavaScript"
* **When:** The mentee searches "Java"
* **Then:** The mentor with "JavaScript" appears in results

### Scenario 5: Empty search clears filters

* **Given:** A mentee has an active search with filtered results
* **When:** They clear the search input and press Enter (or click "Clear search")
* **Then:** The gallery shows all verified mentors
* **And:** The URL updates to `/mentors` (no query param)

### Scenario 6: Search with multiple words (OR logic)

* **Given:** Mentor "María" has specialties ["React", "TypeScript"]
* **And:** Mentor "Carlos" has specialties ["React", "Node.js"]
* **And:** Mentor "Ana" has specialties ["TypeScript", "Angular"]
* **When:** The mentee searches "React TypeScript"
* **Then:** All three mentors appear in results (OR logic)

### Scenario 7: Only verified mentors in results

* **Given:** A verified mentor exists with "Python" in specialties
* **And:** An unverified mentor exists with "Python" in specialties
* **When:** The mentee searches "Python"
* **Then:** Only the verified mentor appears in results

---

## Technical Specifications (Dev Lead Refined)

### Search Algorithm

| Aspect | Decision | Implementation |
|--------|----------|----------------|
| Case-sensitivity | Case-insensitive | PostgreSQL `ILIKE` |
| Match type | Partial match | `%keyword%` pattern |
| Fuzzy/Typo tolerance | NO (MVP) | Can add in v2 |
| Search fields | `full_name`, `bio`, `specialties[]` | OR across fields |
| Multiple words | OR logic | Split by spaces, OR each |
| Only verified | YES | `WHERE is_verified = true` |

### Input Validation

| Constraint | Value | Behavior |
|------------|-------|----------|
| Max length | 100 characters | Truncate silently |
| Empty/whitespace | Valid | Shows all mentors |
| Special characters | Sanitized | Escaped for SQL safety |

### API Endpoint

```
GET /api/mentors?keyword={keyword}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "full_name": "string",
      "photo_url": "url",
      "bio": "string",
      "specialties": ["string"],
      "hourly_rate": 50.00,
      "average_rating": 4.8,
      "is_verified": true
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

### Database Query (Supabase)

```sql
SELECT * FROM mentor_profiles mp
JOIN profiles p ON mp.user_id = p.id
WHERE mp.is_verified = true
AND (
  p.full_name ILIKE '%keyword%'
  OR p.bio ILIKE '%keyword%'
  OR EXISTS (
    SELECT 1 FROM unnest(mp.specialties) AS specialty
    WHERE specialty ILIKE '%keyword%'
  )
)
ORDER BY mp.average_rating DESC NULLS LAST
```

### Security Requirements

| Risk | Mitigation |
|------|------------|
| SQL Injection | Supabase parameterized queries (NEVER string concatenation) |
| XSS | React auto-escapes, sanitize before display |
| DoS (long input) | 100 char limit + rate limiting |

### Frontend Implementation

- **Component:** Controlled `<Input>` with `maxLength={100}`
- **Debounce:** 300ms before API call
- **Submit:** On Enter key or debounce timeout
- **Loading:** Skeleton loader during search
- **URL Sync:** Update `?keyword=` query param for shareability

---

## Definition of Done

* [x] Search bar component implemented with controlled input
* [x] API endpoint accepts `keyword` query parameter
* [x] Search is case-insensitive and supports partial matching
* [x] Only verified mentors appear in results
* [x] Empty search shows all verified mentors
* [x] "No results" message displayed with clear search option
* [x] URL updates with search query (shareable)
* [x] Loading state shown during search (SSR skeleton)
* [x] Input sanitized for security (SQL injection, XSS)
* [ ] Unit tests achieve > 80% coverage
* [ ] Integration tests verify search filtering
* [ ] E2E tests (Playwright) cover all 7 scenarios
* [x] Code review completed and approved
* [x] Documentation updated
* [ ] Deployed to staging environment

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-15-search-mentors-keyword/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-15-search-mentors-keyword/implementation-plan.md`
* **Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-15

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-07 | QA (Shift-Left) | Initial story analysis, identified 4 blockers |
| 2025-12-07 | Dev Lead | Technical decisions: search algorithm, input validation, security |
| 2025-12-07 | QA (Shift-Left) | Story refined with 7 acceptance criteria, technical specs |
| 2025-12-07 | Developer | Implementation complete: RPC function, MentorFilters, ClearSearchButton. PR #41 created |
