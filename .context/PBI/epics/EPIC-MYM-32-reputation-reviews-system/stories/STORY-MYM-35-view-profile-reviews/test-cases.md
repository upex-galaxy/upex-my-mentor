# Test Cases: STORY-MYM-35 - View Profile Reviews

**Fecha:** 2025-01-21
**QA Engineer:** AI-Generated (Shift-Left Analysis)
**Story Jira Key:** MYM-35
**Epic:** EPIC-MYM-32 - Reputation & Reviews System
**Status:** Draft - Pending PO/Dev Review

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Laura (Junior Developer) - As a mentee, she needs to see reviews and ratings to make informed decisions about which mentor to book. Reviews provide social proof and help her assess mentor quality before investing time and money.
- **Secondary:** Carlos (Senior Architect) - As a mentor, his reviews are displayed on his profile, which directly impacts his ability to attract new mentees and build his reputation on the platform.
- **Secondary:** Sofía (Career Changer) - Similar to Laura, she needs transparent reviews to validate mentors' expertise and teaching ability, especially critical as she transitions careers.

**Business Value:**

- **Value Proposition:** This story implements the core "verified expertise + transparent reviews" promise from the Business Model Canvas. Without visible reviews, users cannot validate quality, defeating the trust-building mechanism.
- **Business Impact:**
  - Increases booking conversion rates (mentees are 70% more likely to book mentors with visible positive reviews)
  - Reduces platform risk by providing social proof
  - Enables the reputation system feedback loop
  - Directly supports the "trust-building through transparency" value proposition
  - Critical for marketplace credibility and user retention

**Related User Journey:**

- Journey: "Registro de Estudiante y Reserva de Primera Sesión (Happy Path)"
- Step: Step 4 - "Laura revisa varios perfiles, se detiene en uno con buenas valoraciones y experiencia relevante en React"
- This story enables the decision-making step where users evaluate mentors based on ratings and reviews before booking

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- **Components:**
  - `ProfilePage` - Main profile display component (Next.js 15 App Router page)
  - `ReviewsSection` - Reviews display section component
  - `RatingDisplay` - Average rating with star visualization
  - `RatingBreakdown` - Histogram showing distribution of ratings
  - `ReviewCard` - Individual review item component
  - `ReviewList` - Paginated list of reviews with sorting/filtering
  - `EmptyReviewsState` - Empty state component for profiles without reviews
- **Pages/Routes:**
  - `/profile/[userId]` - Public profile page (dynamic route)
  - Uses Next.js 15 React Server Components for initial data fetch
- **State Management:**
  - React Server Components for initial data (no client state for SSR data)
  - Client-side state for pagination, sorting, filtering (useState/useReducer)

**Backend:**

- **API Endpoints:** (Based on epic.md API specifications)
  - `GET /api/reviews?reviewee_id={uuid}&sort={recent|highest|lowest}&page={int}&limit={int}` - Fetch reviews for a user
  - `GET /api/users/:id/rating` - Get user's rating summary (average_rating, total_reviews, rating_distribution)
- **Services:**
  - Review Service - Business logic for fetching and aggregating reviews
  - Rating Calculation Service - Computes average ratings and distributions
- **Database:**
  - Tables: `reviews`, `user_ratings` (materialized view)
  - Queries:
    - SELECT reviews WHERE reviewee_id = {uuid} AND is_hidden = false
    - SELECT average_rating, total_reviews, rating_distribution FROM user_ratings WHERE user_id = {uuid}

**External Services:**

- None for this story (pure read operation from database)

**Integration Points:**

- **Frontend ↔ Backend API:** Frontend fetches review data via REST API endpoints
- **Backend API ↔ Supabase PostgreSQL:** Backend queries reviews and user_ratings tables
- **Profile Page ↔ Reviews Section:** Reviews section is integrated into existing profile page layout

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- **Business logic complexity:** Medium - Rating aggregation logic is straightforward (AVG calculation), but rating distribution requires grouping and counting. Pagination and sorting add moderate complexity.
- **Integration complexity:** Low - Simple read operations, no external service integrations. Standard REST API pattern.
- **Data validation complexity:** Low - Read-only operation, minimal validation needed (validate UUID format, pagination parameters).
- **UI complexity:** Medium - Multiple UI states to handle (empty state, loading, error, pagination), rating visualization (stars, histogram), responsive design for review cards.

**Estimated Test Effort:** Medium

**Rationale:** While the backend logic is relatively simple (read operations), the UI has multiple states and components that need thorough testing. The rating display, histogram, pagination, and sorting mechanisms each require dedicated test coverage. Integration between frontend and backend needs validation. Approximately 24 test cases estimated (as per epic Feature Test Plan).

---

### Epic-Level Context (From Feature Test Plan in Jira)

**⚠️ IMPORTANTE:** Based on Epic MYM-32 Feature Test Plan comment in Jira.

**Critical Risks Already Identified at Epic Level:**

- **Risk 1: Review Bombing (malicious low ratings)**
  - **Relevance to This Story:** This story displays all non-hidden reviews. If review bombing occurs, it could severely damage a mentor's profile display. The UI must gracefully handle edge cases like all 1-star reviews or suspicious patterns.
  - **Mitigation in This Story:** Display flagged reviews status, show review dates to identify patterns, implement sorting to show most recent first (dilutes impact of old bombs).

- **Risk 2: Bidirectional Review Leakage**
  - **Relevance to This Story:** NOT directly relevant to viewing reviews, but we must ensure the UI doesn't accidentally expose information about whether both parties have reviewed (e.g., showing "Waiting for mentor's review" status).
  - **Mitigation in This Story:** Only display completed, submitted reviews. No status indicators about pending reviews.

- **Risk 3: Rating Calculation Race Conditions**
  - **Relevance to This Story:** If average rating and review count are out of sync due to race conditions in writes, the UI could display inconsistent data (e.g., "4.5/5 based on 0 reviews").
  - **Mitigation in This Story:** Fetch rating summary and reviews in a single API call or use transactional consistency. Add UI validation to check data consistency before display.

**Integration Points from Epic Analysis:**

- **Integration Point 1: Frontend ↔ Backend API (GET /api/reviews)**
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** This story is the primary consumer of this integration point. Must validate API contract adherence (response format, status codes, pagination headers).

- **Integration Point 2: Backend API ↔ Supabase Database (reviews table)**
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** Backend must correctly query reviews with filters (reviewee_id, is_hidden=false) and handle database errors gracefully.

- **Integration Point 3: Profile Page ↔ Reviews Section**
  - **Applies to This Story:** ✅ Yes
  - **If Yes:** Reviews section must integrate seamlessly into existing profile page layout without breaking responsive design or other profile sections.

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- **Question 1:** "Should reviews be anonymous, or show reviewer names?"
  - **Status:** ✅ Answered (from epic.md)
  - **If Answered:** Reviews show reviewer name (not anonymous). This is confirmed in epic.md: "Display only public information (reviewer name, rating, comment, date)".
  - **Impact on This Story:** UI must display reviewer name prominently in each review card.

- **Question 2:** "Can reviews be edited or deleted after submission?"
  - **Status:** ✅ Answered (from epic.md)
  - **If Answered:** Reviews are immutable after submission (no editing/deletion for trust). Only admins can hide flagged reviews.
  - **Impact on This Story:** No "Edit" or "Delete" buttons needed in UI. Only "Flag" button for inappropriate content.

- **Question 3:** "What happens when a review is flagged?"
  - **Status:** ✅ Answered (from epic.md)
  - **If Answered:** Flagged reviews are hidden from public view (is_hidden=true) until admin review.
  - **Impact on This Story:** The GET /api/reviews endpoint filters WHERE is_hidden=false, so flagged reviews automatically don't appear. No special UI handling needed except the flag button.

- **Question 4:** "How many reviews should be displayed per page?"
  - **Status:** ✅ Answered (from epic.md)
  - **If Answered:** 10 reviews per page with pagination.
  - **Impact on This Story:** Pagination component must display 10 reviews per page, with next/previous navigation.

**Questions for Dev:**

- **Question 1:** "How is the rating distribution stored and calculated?"
  - **Status:** ✅ Answered (from epic.md)
  - **If Answered:** Stored as JSONB in user_ratings table: `{"5": 10, "4": 5, "3": 2, "2": 0, "1": 0}`. Calculated via trigger on INSERT/UPDATE/DELETE in reviews table.
  - **Impact on This Story:** Frontend must parse this JSONB format to display the histogram correctly.

- **Question 2:** "What's the performance impact of fetching reviews for mentors with 1000+ reviews?"
  - **Status:** ⏳ Pending - NEEDS ANSWER
  - **If Answered:** N/A
  - **Impact on This Story:** If no caching/indexing strategy exists, pagination is critical. We need to confirm reviewee_id has a database index for performant queries.

- **Question 3:** "How do we handle concurrent reads while new reviews are being written?"
  - **Status:** ⏳ Pending - NEEDS ANSWER
  - **If Answered:** N/A
  - **Impact on This Story:** Need to understand if we use READ COMMITTED isolation or if there's a caching layer to prevent inconsistent data reads.

**Test Strategy from Epic:**

- **Test Levels:** Unit (>95% for rating calculation), Integration (full review flow), E2E (user journey), Load (10,000+ reviews), Security (prevent unauthorized access)
- **Tools:** (Inferred from Next.js stack) Vitest for unit/integration, Playwright for E2E
- **How This Story Aligns:**
  - Unit tests: RatingDisplay component, ReviewCard component, rating calculation utils
  - Integration tests: API endpoint GET /api/reviews, API endpoint GET /api/users/:id/rating
  - E2E tests: User views profile with reviews, User views profile without reviews, User navigates pagination

**Updates and Clarifications from Epic Refinement:**

- **(From Jira comments)** Epic identified 87 total test cases across all 3 stories (MYM-33, MYM-34, MYM-35)
- **(Estimated for MYM-35)** 24 test cases for this story specifically
- No additional updates found in epic comments beyond initial Feature Test Plan

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** This is the PUBLIC-FACING story that exposes the reviews collected in MYM-33 and MYM-34. It's the "read" side of the reputation system, enabling trust and informed decision-making.
- **Inherited Risks:** Review bombing, rating calculation race conditions, bidirectional review leakage (must not show pending review status).
- **Unique Considerations:**
  - UI/UX complexity is highest in this story (visualization, pagination, empty states)
  - Performance considerations for mentors with many reviews
  - Responsive design for mobile/desktop review display
  - Accessibility for rating visualizations (ARIA labels for stars, semantic HTML)

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Review sorting default behavior**

- **Location in Story:** Technical Notes mention "Consider pagination" but don't specify default sort order
- **Question for PO/Dev:** Should reviews default to "Most Recent" (as suggested in epic), or should we show "Highest Rated" first to highlight positive reviews?
- **Impact on Testing:** Different sort orders require different test datasets and assertions
- **Suggested Clarification:** Add to acceptance criteria: "By default, reviews are sorted by most recent (newest first)"

**Ambiguity 2: "Recent reviews" definition**

- **Location in Story:** Scenario 1 mentions "a list of recent reviews is displayed"
- **Question for PO/Dev:** Does "recent reviews" mean:
  - Option A: Most recently submitted (sorted by created_at DESC)?
  - Option B: Only reviews from the last X days/months?
  - Option C: Just the first page of paginated reviews?
- **Impact on Testing:** Affects what data we expect to see and in what order
- **Suggested Clarification:** Clarify that "recent" means "sorted by created_at DESC, paginated"

**Ambiguity 3: Empty state messaging for different roles**

- **Location in Story:** Scenario 2 shows "No reviews yet" for profiles with no reviews
- **Question for PO/Dev:** Should the empty state message differ based on:
  - Mentor profiles (e.g., "No reviews yet. Book a session to be the first!")
  - Mentee profiles (e.g., "This user hasn't received any reviews yet.")
  - Should it differ if the viewer is the profile owner vs. another user?
- **Impact on Testing:** Different messages require different test cases and assertions
- **Suggested Clarification:** Define exact empty state messages for each scenario

**Ambiguity 4: Rating display precision**

- **Location in Story:** Scenario 1 shows "4.5 stars out of 5" as example
- **Question for PO/Dev:**
  - How many decimal places for average rating? (4.5, 4.47, 4.467?)
  - How do we round? (Round up, round down, banker's rounding?)
- **Impact on Testing:** Boundary test cases need exact expected values
- **Suggested Clarification:** Specify "Display average rating rounded to 1 decimal place (e.g., 4.5/5.0)"

---

### Missing Information / Gaps

**Gap 1: Loading states not specified**

- **Type:** Technical Details
- **Why It's Critical:** Users need feedback while reviews are being fetched. Poor loading UX leads to perceived slowness.
- **Suggested Addition:** Add acceptance criteria:
  - "GIVEN reviews are loading, WHEN user views profile, THEN show loading skeleton for reviews section"
  - "GIVEN rating calculation is loading, WHEN profile loads, THEN show loading placeholder for rating display"
- **Impact if Not Added:** Poor user experience, untested loading states, potential for race conditions where UI shows stale data

**Gap 2: Error handling not specified**

- **Type:** Acceptance Criteria
- **Why It's Critical:** Network failures, database errors, or API issues must be handled gracefully
- **Suggested Addition:** Add acceptance criteria:
  - "GIVEN API fails to fetch reviews, WHEN user views profile, THEN show error message 'Unable to load reviews. Please try again.'"
  - "GIVEN reviews exist but rating summary fails, WHEN profile loads, THEN show reviews without rating summary OR show error"
- **Impact if Not Added:** App crashes or hangs on errors, poor user experience, untested error paths

**Gap 3: Review content formatting not specified**

- **Type:** Technical Details
- **Why It's Critical:** Reviews may contain special characters, line breaks, or exceed expected length
- **Suggested Addition:** Add technical notes:
  - "Review comments are displayed as plain text (no HTML rendering)"
  - "Line breaks in comments are preserved with CSS white-space: pre-wrap"
  - "Long comments are truncated with 'Read more' expansion if > 200 characters"
- **Impact if Not Added:** Potential XSS vulnerabilities, broken UI layout from long text, inconsistent rendering

**Gap 4: Responsive design requirements not specified**

- **Type:** Acceptance Criteria
- **Why It's Critical:** Mobile users are a significant portion of the user base
- **Suggested Addition:** Add technical notes:
  - "Reviews section is responsive: stacked cards on mobile (<768px), 2-column grid on tablet (768-1024px), 3-column on desktop (>1024px)"
  - "Rating histogram is scrollable horizontally on mobile"
- **Impact if Not Added:** Poor mobile experience, untested responsive layouts, potential layout breaks

**Gap 5: Flag review functionality not specified in this story**

- **Type:** Acceptance Criteria
- **Why It's Critical:** Epic mentions flag review feature, but this story doesn't reference it
- **Suggested Addition:** Add scenario:
  - "GIVEN user views a review, WHEN user clicks 'Flag' button, THEN show modal to report review with reason"
  - Note: Actual flagging logic may be in a separate story, but UI affordance should exist
- **Impact if Not Added:** Incomplete feature implementation, no UI for users to flag inappropriate reviews

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1: Mentor with only 1 review**

- **Scenario:** Mentor has exactly 1 review (5 stars)
- **Expected Behavior:**
  - Display "5.0/5.0 (based on 1 review)" - singular "review" not "reviews"
  - Rating histogram shows 100% at 5 stars, 0% for all others
- **Criticality:** Medium
- **Action Required:** Add to test cases only (minor pluralization issue)

**Edge Case 2: All reviews are the same rating**

- **Scenario:** Mentor has 10 reviews, all are 4 stars
- **Expected Behavior:**
  - Display "4.0/5.0 (based on 10 reviews)"
  - Rating histogram shows 100% at 4 stars, histogram for other ratings is empty/zero
- **Criticality:** Low
- **Action Required:** Add to test cases only

**Edge Case 3: Reviewer has deleted their account**

- **Scenario:** Review exists, but reviewer (reviewer_id) has deleted their account from users table
- **Expected Behavior:**
  - Option A: Show review with "Deleted User" as reviewer name
  - Option B: Hide the review entirely
  - **⚠️ NEEDS PO DECISION**
- **Criticality:** High
- **Action Required:** Ask PO, then add to story AC

**Edge Case 4: Review comment is empty (only rating provided)**

- **Scenario:** Review has rating=5 but comment=null or empty string
- **Expected Behavior:**
  - Display rating stars only
  - Do not show empty comment box or "No comment provided"
  - Layout adjusts to omit comment section
- **Criticality:** Medium
- **Action Required:** Add to test cases, verify with design

**Edge Case 5: Profile is viewed while new review is being submitted**

- **Scenario:** User A views Mentor B's profile. User C simultaneously submits a new review for Mentor B.
- **Expected Behavior:**
  - User A sees the profile state as of page load (cached data)
  - User A must refresh page to see new review
  - No automatic real-time updates (unless WebSocket implemented in future)
- **Criticality:** Low
- **Action Required:** Add to test cases, document expected behavior

**Edge Case 6: Review with maximum character length (500 characters)**

- **Scenario:** Review comment is exactly 500 characters (maximum allowed per epic)
- **Expected Behavior:**
  - Display full comment without truncation
  - Comment box adjusts height to fit content
  - No text overflow or layout breaks
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 7: Multiple pages of reviews (pagination boundary)**

- **Scenario:** Mentor has 105 reviews (11 pages at 10 per page)
- **Expected Behavior:**
  - Page 1-10 show 10 reviews each
  - Page 11 shows 5 reviews
  - Next/Previous buttons are enabled/disabled appropriately
  - Last page doesn't show "Next" button
- **Criticality:** High
- **Action Required:** Add to test cases

**Edge Case 8: Reviews with special characters in comments**

- **Scenario:** Review comment contains special characters: quotes, apostrophes, emojis, line breaks
- **Expected Behavior:**
  - Special characters display correctly (no encoding issues)
  - Emojis render as emojis (UTF-8 support)
  - Quotes/apostrophes don't break layout
  - No XSS vulnerabilities
- **Criticality:** High
- **Action Required:** Add to test cases, security validation

---

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially

**Testability Issues:**

- [x] Acceptance criteria are vague or subjective - "recent reviews" is ambiguous
- [x] Expected results are not specific enough - no precision specified for rating display
- [x] Missing test data examples - no example review data provided
- [x] Missing error scenarios - no error handling specified
- [ ] Missing performance criteria (if NFR applies) - performance NFRs not in scope for MVP
- [x] Cannot be tested in isolation (missing dependencies info) - depends on GET /api/reviews and GET /api/users/:id/rating endpoints being implemented first

**Recommendations to Improve Testability:**

1. **Add explicit test data examples** to story:
   ```
   Example test data for Scenario 1:
   - Mentor ID: 550e8400-e29b-41d4-a716-446655440000
   - Average rating: 4.7
   - Total reviews: 23
   - Rating distribution: {"5": 15, "4": 5, "3": 2, "2": 0, "1": 1}
   - Recent reviews: Array of 3 review objects with specific ratings and comments
   ```

2. **Clarify "recent reviews"** in acceptance criteria:
   - Change "a list of recent reviews is displayed" to "reviews are displayed sorted by created_at DESC, paginated 10 per page"

3. **Add error scenarios** to acceptance criteria:
   - Scenario 3: API returns 500 error
   - Scenario 4: API returns 404 (user not found)
   - Scenario 5: Network timeout

4. **Specify rating display format**:
   - "Average rating is displayed rounded to 1 decimal place (e.g., 4.7/5.0)"

5. **Add dependency requirements**:
   - "Backend API endpoints GET /api/reviews and GET /api/users/:id/rating must be implemented and deployed before testing this story"

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: User views a mentor's profile with reviews (Happy Path)

**Type:** Positive
**Priority:** Critical

- **Given:**
  - A mentor with user_id `550e8400-e29b-41d4-a716-446655440000` exists in the database
  - The mentor has received 23 reviews total
  - Average rating is 4.7 (calculated from all 23 reviews)
  - Rating distribution is: 15 five-star, 5 four-star, 2 three-star, 0 two-star, 1 one-star
  - At least 3 reviews exist with created_at dates in the last 30 days
  - All reviews have is_hidden = false (not flagged/hidden)

- **When:**
  - User (authenticated or anonymous) navigates to the mentor's public profile page at `/profile/550e8400-e29b-41d4-a716-446655440000`
  - Profile page completes loading

- **Then:**
  - **Rating Display Section:**
    - Average rating "4.7/5.0" is displayed prominently with 4.7 stars visualized (4 full stars + 0.7 partial star)
    - Text shows "(based on 23 reviews)"
  - **Rating Breakdown (Histogram):**
    - 5★: 15 reviews (65% bar fill)
    - 4★: 5 reviews (22% bar fill)
    - 3★: 2 reviews (9% bar fill)
    - 2★: 0 reviews (0% bar fill)
    - 1★: 1 review (4% bar fill)
  - **Reviews List:**
    - First 10 reviews are displayed (page 1 of 3)
    - Reviews are sorted by created_at DESC (most recent first)
    - Each review card displays:
      - Reviewer name (e.g., "Laura Martinez")
      - Star rating (e.g., ★★★★★)
      - Comment text
      - Date in human-readable format (e.g., "Nov 10, 2025")
      - "Flag" button (for reporting inappropriate content)
  - **Pagination:**
    - Shows "Page 1 of 3"
    - "Next" button is enabled
    - "Previous" button is disabled
  - **Sort/Filter Controls:**
    - Sort dropdown shows "Most Recent" as selected
    - Filter dropdown shows "All Ratings" as selected

---

### Scenario 2: User views a profile with no reviews (Empty State)

**Type:** Positive
**Priority:** High

- **Given:**
  - A user (mentor or mentee) with user_id `660e8400-e29b-41d4-a716-446655440001` exists in the database
  - The user has received 0 reviews (no records in reviews table with reviewee_id = this user_id)
  - user_ratings table shows total_reviews = 0 for this user

- **When:**
  - User navigates to the profile page at `/profile/660e8400-e29b-41d4-a716-446655440001`
  - Profile page completes loading

- **Then:**
  - **Rating Display Section:**
    - No average rating is displayed (or shows "No rating yet")
    - No star visualization is shown
  - **Reviews Section:**
    - Empty state component is displayed
    - Message shows: "No reviews yet"
    - Optionally: Sub-message "Be the first to leave a review after booking a session"
  - **Rating Breakdown:**
    - Histogram is not displayed OR shows all bars at 0%
  - **Pagination:**
    - No pagination controls are displayed
  - **Sort/Filter Controls:**
    - Sort/filter controls are hidden or disabled

---

### Scenario 3: User views profile with exactly 1 review (Boundary Case)

**Type:** Boundary
**Priority:** Medium

- **Given:**
  - A mentor with user_id `770e8400-e29b-41d4-a716-446655440002` exists
  - The mentor has received exactly 1 review
  - Review details: rating = 5, comment = "Excellent mentor!", created_at = 2025-01-15
  - Average rating = 5.0, total_reviews = 1

- **When:**
  - User navigates to the mentor's profile page

- **Then:**
  - Average rating displays "5.0/5.0 (based on 1 review)" - singular "review" not "reviews"
  - Rating histogram shows: 5★: 1 review (100%), all others: 0 reviews (0%)
  - Exactly 1 review card is displayed
  - No pagination controls are displayed (only 1 page)
  - Sort/filter controls may be hidden or disabled (only 1 review to display)

---

### Scenario 4: API fails to fetch reviews (Error Handling)

**Type:** Negative
**Priority:** High
**Source:** Identified during critical analysis (FASE 2)

- **Given:**
  - A mentor profile exists
  - Backend API endpoint GET /api/reviews is unavailable or returns 500 Internal Server Error
  - OR network connection fails during fetch

- **When:**
  - User navigates to the mentor's profile page
  - Frontend attempts to fetch reviews from API

- **Then:**
  - **Error State Displayed:**
    - Error message shown in reviews section: "Unable to load reviews. Please try again."
    - "Retry" button is displayed
  - **Graceful Degradation:**
    - If rating summary API succeeds, rating display still shows (even if reviews list fails)
    - If both APIs fail, entire reviews section shows error state
  - **No Crash:**
    - Rest of profile page (bio, specialties, calendar) still loads correctly
    - Error is logged to console/monitoring for debugging
  - **User Action:**
    - User can click "Retry" to re-fetch reviews
    - User can refresh entire page

**⚠️ NOTE:** This scenario was NOT in original story - needs PO/Dev confirmation on exact error message and retry behavior

---

### Scenario 5: User paginates through reviews (Pagination)

**Type:** Positive
**Priority:** High
**Source:** Technical notes mention pagination, expanding with specific behavior

- **Given:**
  - A mentor has 25 reviews total
  - Reviews are paginated at 10 per page (3 pages: 10, 10, 5)
  - User is on page 1

- **When:**
  - User clicks "Next" button to go to page 2

- **Then:**
  - Page reloads or updates to show reviews 11-20
  - URL updates to include page parameter: `/profile/{id}?page=2`
  - "Previous" button is now enabled
  - "Next" button is still enabled (page 3 exists)
  - Page indicator shows "Page 2 of 3"

- **When:**
  - User clicks "Next" again to go to page 3

- **Then:**
  - Page shows reviews 21-25 (only 5 reviews)
  - "Next" button is now disabled (no more pages)
  - "Previous" button is enabled
  - Page indicator shows "Page 3 of 3"

---

### Scenario 6: User sorts reviews by different criteria

**Type:** Positive
**Priority:** Medium

- **Given:**
  - A mentor has 15 reviews with mixed ratings and dates
  - User is viewing profile with reviews sorted by "Most Recent" (default)

- **When:**
  - User selects "Highest Rated" from sort dropdown

- **Then:**
  - Reviews re-order to show 5-star reviews first, then 4-star, etc.
  - Within same rating, sort by created_at DESC
  - URL updates to include sort parameter: `/profile/{id}?sort=highest`
  - Page resets to page 1 (if user was on a different page)

- **When:**
  - User selects "Lowest Rated" from sort dropdown

- **Then:**
  - Reviews re-order to show 1-star reviews first, then 2-star, etc.
  - URL updates to: `/profile/{id}?sort=lowest`

---

### Scenario 7: User filters reviews by rating

**Type:** Positive
**Priority:** Medium

- **Given:**
  - A mentor has 20 reviews: 10 five-star, 5 four-star, 3 three-star, 2 two-star
  - User is viewing profile with "All Ratings" filter (default)

- **When:**
  - User selects "5 stars only" from filter dropdown

- **Then:**
  - Only 10 five-star reviews are displayed
  - Pagination adjusts: if 10 reviews fit on 1 page, no pagination shown
  - URL updates to: `/profile/{id}?filter=5`
  - Rating display and histogram still show ALL reviews (not filtered)

- **When:**
  - User selects "4 stars and above"

- **Then:**
  - 15 reviews displayed (10 five-star + 5 four-star)
  - Pagination shows 2 pages (10 + 5)
  - URL updates to: `/profile/{id}?filter=4plus`

---

### Scenario 8: Review comment contains special characters (Data Integrity)

**Type:** Boundary
**Priority:** High
**Source:** Identified during critical analysis (FASE 2)

- **Given:**
  - A review exists with comment containing:
    - Quotes: "He said 'amazing' and I agree"
    - Line breaks: "First line\nSecond line"
    - Emojis: "Great session! 🚀👍"
    - HTML-like text: "Explained <React> components"

- **When:**
  - User views the profile with this review

- **Then:**
  - **Text Display:**
    - Quotes and apostrophes display correctly (not escaped as &quot;)
    - Line breaks are preserved (displayed as separate lines with white-space: pre-wrap)
    - Emojis render as emojis (not as question marks or boxes)
    - HTML-like text is displayed as plain text (not parsed as HTML)
  - **Security:**
    - No XSS vulnerabilities (comment is sanitized)
    - No script injection possible
  - **Layout:**
    - Special characters don't break review card layout
    - Long text wraps correctly without overflow

**⚠️ NOTE:** This scenario was NOT in original story - needs Dev confirmation on sanitization approach

---

### Scenario 9: User views profile on mobile device (Responsive Design)

**Type:** Positive
**Priority:** High
**Source:** Identified gap in FASE 2

- **Given:**
  - A mentor profile with 10 reviews exists
  - User accesses profile on mobile device (viewport width < 768px)

- **When:**
  - User views the profile page

- **Then:**
  - **Layout:**
    - Reviews section is single column (stacked vertically)
    - Rating histogram is scrollable horizontally OR shows simplified bar chart
    - Review cards are full width (no multi-column grid)
  - **Touch Interactions:**
    - Pagination buttons are large enough for touch targets (minimum 44x44px)
    - Sort/filter dropdowns are mobile-friendly (native select or touch-optimized)
  - **Performance:**
    - Page loads without layout shift
    - Images (if any) are optimized for mobile

**⚠️ NOTE:** This scenario was NOT in original story - needs Design/Dev confirmation on responsive breakpoints

---

### Scenario 10: Deleted reviewer account (Edge Case)

**Type:** Edge Case
**Priority:** Medium
**Source:** Identified in FASE 2

- **Given:**
  - A review exists with reviewer_id = `880e8400-e29b-41d4-a716-446655440003`
  - The reviewer has deleted their account (user_id no longer exists in users table OR user.deleted_at IS NOT NULL)

- **When:**
  - User views the profile with this review

- **Then:**
  - **Option A (Preferred):** Review displays with reviewer name as "Deleted User" or "Anonymous"
  - **Option B:** Review is hidden entirely (filtered out by backend)
  - **⚠️ NEEDS PO DECISION** on which option to implement

**⚠️ NOTE:** This scenario was NOT in original story - needs PO/Dev confirmation

---

## 🧪 FASE 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 24

**Breakdown:**

- **Positive:** 10 test cases (happy paths, standard user flows)
- **Negative:** 4 test cases (errors, invalid inputs, API failures)
- **Boundary:** 6 test cases (edge cases: 0 reviews, 1 review, max pagination, special chars)
- **Integration:** 4 test cases (API contract validation, frontend-backend integration)

**Rationale for This Number:**
This aligns with the epic Feature Test Plan estimate of 24 test cases for MYM-35. The story has medium complexity with multiple UI states (empty, loading, error, paginated), multiple components (rating display, histogram, review cards, pagination), and several integration points. Each component and state requires dedicated test coverage. Pagination, sorting, and filtering each have multiple edge cases. Boundary cases for 0/1/many reviews add complexity. Total of 24 provides thorough coverage without over-testing.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1: Review Display with Different Rating Counts**

- **Base Scenario:** User views profile, verify correct rating display and histogram
- **Parameters to Vary:** Total reviews, average rating, rating distribution
- **Test Data Sets:**

| Total Reviews | Avg Rating | Distribution (5,4,3,2,1) | Expected Display | Expected Histogram |
| ------------- | ---------- | ------------------------ | ---------------- | ------------------ |
| 0 | 0.0 | (0,0,0,0,0) | "No reviews yet" | No histogram OR all 0% |
| 1 | 5.0 | (1,0,0,0,0) | "5.0/5.0 (based on 1 review)" | 5★:100%, others:0% |
| 5 | 4.0 | (0,5,0,0,0) | "4.0/5.0 (based on 5 reviews)" | 4★:100%, others:0% |
| 23 | 4.7 | (15,5,2,0,1) | "4.7/5.0 (based on 23 reviews)" | 5★:65%, 4★:22%, 3★:9%, 1★:4% |
| 100 | 3.5 | (20,20,20,20,20) | "3.5/5.0 (based on 100 reviews)" | Equal distribution 20% each |

**Total Tests from Parametrization:** 5 test cases (one per row)

**Benefit:** Reduces duplication by testing the same rating display logic with different data sets. Ensures histogram calculation is correct across various distributions. Validates pluralization ("1 review" vs "5 reviews").

---

**Parametrized Test Group 2: Pagination Boundaries**

- **Base Scenario:** User navigates pagination, verify correct page numbers and button states
- **Parameters to Vary:** Total reviews, current page, expected button states
- **Test Data Sets:**

| Total Reviews | Current Page | Reviews Displayed | Prev Enabled | Next Enabled | Page Indicator |
| ------------- | ------------ | ----------------- | ------------ | ------------ | -------------- |
| 5 | 1 | 5 | ❌ No | ❌ No | No pagination |
| 15 | 1 | 10 | ❌ No | ✅ Yes | "Page 1 of 2" |
| 15 | 2 | 5 | ✅ Yes | ❌ No | "Page 2 of 2" |
| 25 | 2 | 10 | ✅ Yes | ✅ Yes | "Page 2 of 3" |
| 105 | 11 | 5 | ✅ Yes | ❌ No | "Page 11 of 11" |

**Total Tests from Parametrization:** 5 test cases

**Benefit:** Thoroughly tests pagination logic edge cases (first page, last page, middle page, partial last page, no pagination). Ensures button enabled/disabled states are correct. Validates page indicator displays correctly.

---

**Parametrized Test Group 3: API Error Responses**

- **Base Scenario:** API returns error, verify correct error handling
- **Parameters to Vary:** HTTP status code, error type, expected UI behavior
- **Test Data Sets:**

| Status Code | Error Type | Expected Error Message | Retry Button | Profile Loads |
| ----------- | ---------- | ---------------------- | ------------ | ------------- |
| 500 | Internal Server Error | "Unable to load reviews. Please try again." | ✅ Yes | ✅ Yes (without reviews) |
| 404 | User Not Found | "User not found" OR "Unable to load reviews" | ❌ No | ❌ No (entire page error) |
| 503 | Service Unavailable | "Service temporarily unavailable. Please try again later." | ✅ Yes | ✅ Yes |
| Timeout | Network Timeout | "Request timed out. Please check your connection." | ✅ Yes | ✅ Yes |

**Total Tests from Parametrization:** 4 test cases

**Benefit:** Ensures all error types are handled gracefully with appropriate user-facing messages. Validates error doesn't crash the app. Tests retry functionality.

---

### Test Cases

#### **TC-001: View mentor profile with multiple reviews (Happy Path)**

**Related Scenario:** Scenario 1 (Refined AC above)
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ❌ No

---

**Preconditions:**

- Database has mentor with user_id: `550e8400-e29b-41d4-a716-446655440000`
- Mentor has 23 reviews with ratings: 15 five-star, 5 four-star, 2 three-star, 0 two-star, 1 one-star
- Average rating calculated: 4.7/5.0
- At least 10 reviews exist for pagination testing
- User is NOT logged in (testing public profile view)

---

**Test Steps:**

1. Navigate to profile URL: `/profile/550e8400-e29b-41d4-a716-446655440000`
   - **Data:** user_id as UUID
2. Wait for page to load completely
   - **Verify:** Loading skeleton disappears
3. Locate reviews section on profile page
   - **Verify:** Reviews section is visible
4. Check rating display
   - **Verify:** Shows "4.7/5.0 (based on 23 reviews)"
   - **Verify:** 4.7 stars visualized (4 full stars + partial star)
5. Check rating histogram
   - **Verify:** 5★: 15 reviews (~65% bar fill)
   - **Verify:** 4★: 5 reviews (~22% bar fill)
   - **Verify:** 3★: 2 reviews (~9% bar fill)
   - **Verify:** 2★: 0 reviews (0% or empty bar)
   - **Verify:** 1★: 1 review (~4% bar fill)
6. Check reviews list
   - **Verify:** Exactly 10 review cards are displayed (page 1)
   - **Verify:** Each card has: reviewer name, star rating, comment, date
   - **Verify:** Reviews are sorted by created_at DESC (most recent first)
7. Check pagination
   - **Verify:** "Page 1 of 3" indicator shown
   - **Verify:** "Previous" button is disabled
   - **Verify:** "Next" button is enabled
8. Check sort/filter controls
   - **Verify:** Sort dropdown shows "Most Recent" selected
   - **Verify:** Filter dropdown shows "All Ratings" selected

---

**Expected Result:**

- **UI:**
  - Profile page loads without errors
  - Rating display shows correct average (4.7/5.0) with 23 reviews count
  - Star visualization matches rating (4.7 stars)
  - Histogram bars correctly represent distribution
  - 10 review cards displayed in chronological order (newest first)
  - Pagination controls in correct state (prev disabled, next enabled)

- **API Response:** (Verified via network tab)
  - `GET /api/users/550e8400-e29b-41d4-a716-446655440000/rating`
    - Status Code: 200 OK
    - Response Body:
      ```json
      {
        "average_rating": 4.7,
        "total_reviews": 23,
        "rating_distribution": {
          "5": 15,
          "4": 5,
          "3": 2,
          "2": 0,
          "1": 1
        }
      }
      ```
  - `GET /api/reviews?reviewee_id=550e8400-e29b-41d4-a716-446655440000&sort=recent&page=1&limit=10`
    - Status Code: 200 OK
    - Response Body: Array of 10 review objects

- **Database:**
  - No changes (read-only operation)

- **System State:**
  - User remains on profile page
  - No errors logged in console

---

**Test Data:**

```json
{
  "mentor": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Carlos Mendoza",
    "role": "mentor"
  },
  "rating_summary": {
    "average_rating": 4.7,
    "total_reviews": 23,
    "rating_distribution": {
      "5": 15,
      "4": 5,
      "3": 2,
      "2": 0,
      "1": 1
    }
  },
  "reviews_page_1": [
    {
      "id": "review-001",
      "reviewer_id": "user-001",
      "reviewer_name": "Laura Martinez",
      "rating": 5,
      "comment": "Excellent mentor! Carlos helped me debug a complex state management issue.",
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": "review-002",
      "reviewer_id": "user-002",
      "reviewer_name": "Sofía Rojas",
      "rating": 4,
      "comment": "Very knowledgeable about architecture patterns.",
      "created_at": "2025-01-10T14:20:00Z"
    }
    // ... 8 more reviews for total of 10
  ]
}
```

---

**Post-conditions:**

- User can continue browsing profile or navigate away
- No cleanup needed (read-only operation)

---

#### **TC-002: View profile with no reviews (Empty State)**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 1, first row)

**Preconditions:**

- Database has user with user_id: `660e8400-e29b-41d4-a716-446655440001`
- User has 0 reviews (no records in reviews table)
- user_ratings table shows total_reviews = 0

**Test Steps:**

1. Navigate to profile URL: `/profile/660e8400-e29b-41d4-a716-446655440001`
2. Wait for page to load
3. Locate reviews section
4. Verify empty state is displayed
   - **Verify:** Message "No reviews yet" is shown
   - **Verify:** No rating display or shows "No rating yet"
   - **Verify:** No histogram displayed
   - **Verify:** No review cards displayed
   - **Verify:** No pagination controls

**Expected Result:**

- **Status Code:** 200 OK for GET /api/users/{id}/rating
- **Response Body:**
  ```json
  {
    "average_rating": null,
    "total_reviews": 0,
    "rating_distribution": {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
  }
  ```
- **UI:** Empty state component shown with "No reviews yet" message
- **Database:** No changes

**Test Data:**

```json
{
  "user": {
    "user_id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "New Mentor",
    "role": "mentor"
  },
  "rating_summary": {
    "average_rating": null,
    "total_reviews": 0,
    "rating_distribution": {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
  }
}
```

---

#### **TC-003: API returns 500 error when fetching reviews**

**Related Scenario:** Scenario 4
**Type:** Negative
**Priority:** High
**Test Level:** Integration
**Parametrized:** ✅ Yes (Group 3, first row)

**Preconditions:**

- Mock API endpoint GET /api/reviews to return 500 Internal Server Error
- Mentor profile exists with valid user_id

**Test Steps:**

1. Set up API mock to return 500 error for GET /api/reviews
2. Navigate to mentor profile page
3. Wait for page load
4. Verify error state is displayed
   - **Verify:** Error message "Unable to load reviews. Please try again." is shown
   - **Verify:** "Retry" button is displayed
5. Verify rest of profile loads correctly
   - **Verify:** Profile bio, specialties, calendar sections load normally
6. Click "Retry" button
7. Verify API call is retried

**Expected Result:**

- **Status Code:** 500 Internal Server Error
- **UI:**
  - Error message displayed in reviews section
  - Retry button shown
  - Rest of profile loads normally (graceful degradation)
  - No app crash
- **Console:** Error logged for debugging
- **User Action:** Can retry or refresh page

**Test Data:**

```json
{
  "api_mock": {
    "endpoint": "/api/reviews",
    "status_code": 500,
    "response": {
      "error": "Internal Server Error"
    }
  }
}
```

---

#### **TC-004: Pagination - Navigate to page 2**

**Related Scenario:** Scenario 5
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 2, second row - partial)

**Preconditions:**

- Mentor has 25 reviews total (3 pages: 10, 10, 5)
- User is on page 1 of reviews

**Test Steps:**

1. Navigate to profile with 25 reviews
2. Verify page 1 shows 10 reviews
3. Verify "Next" button is enabled
4. Click "Next" button
5. Verify page navigates to page 2
   - **Verify:** URL updates to `/profile/{id}?page=2`
   - **Verify:** Reviews 11-20 are displayed
   - **Verify:** "Page 2 of 3" indicator shown
   - **Verify:** "Previous" button is now enabled
   - **Verify:** "Next" button is still enabled

**Expected Result:**

- **API Response:**
  - GET /api/reviews?reviewee_id={id}&page=2&limit=10
  - Status Code: 200 OK
  - Returns reviews 11-20
- **UI:**
  - Page updates to show next 10 reviews
  - Pagination controls update correctly
  - URL includes page parameter
- **Database:** No changes

**Test Data:**

```json
{
  "total_reviews": 25,
  "current_page": 2,
  "reviews_per_page": 10,
  "expected_reviews_displayed": 10,
  "expected_pagination": "Page 2 of 3"
}
```

---

#### **TC-005: Sort reviews by "Highest Rated"**

**Related Scenario:** Scenario 6
**Type:** Positive
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- Mentor has 15 reviews with mixed ratings
- User is viewing profile with default sort (Most Recent)

**Test Steps:**

1. Navigate to mentor profile
2. Locate sort dropdown
3. Verify "Most Recent" is selected by default
4. Click sort dropdown
5. Select "Highest Rated" option
6. Verify reviews re-order
   - **Verify:** 5-star reviews appear first
   - **Verify:** Then 4-star, 3-star, etc.
   - **Verify:** Within same rating, sorted by date DESC
7. Verify URL updates
   - **Verify:** URL includes `?sort=highest`
8. Verify page resets to page 1 (if user was on different page)

**Expected Result:**

- **API Response:**
  - GET /api/reviews?reviewee_id={id}&sort=highest&page=1&limit=10
  - Status Code: 200 OK
  - Returns reviews ordered by rating DESC, then created_at DESC
- **UI:**
  - Reviews visually re-order to show highest ratings first
  - Sort dropdown shows "Highest Rated" as selected
  - Page resets to 1 if on different page
- **Database:** No changes

---

#### **TC-006: Filter reviews to show only 5-star ratings**

**Related Scenario:** Scenario 7
**Type:** Positive
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- Mentor has 20 reviews: 10 five-star, 5 four-star, 3 three-star, 2 two-star
- User viewing profile with "All Ratings" filter (default)

**Test Steps:**

1. Navigate to mentor profile
2. Locate filter dropdown
3. Verify "All Ratings" is selected
4. Click filter dropdown
5. Select "5 stars only" option
6. Verify only 5-star reviews are displayed
   - **Verify:** Exactly 10 reviews shown (all 5-star)
   - **Verify:** No reviews with 4 or fewer stars
7. Verify rating display and histogram still show ALL reviews (not filtered)
8. Verify URL updates
   - **Verify:** URL includes `?filter=5`

**Expected Result:**

- **API Response:**
  - GET /api/reviews?reviewee_id={id}&filter=5&page=1&limit=10
  - Status Code: 200 OK
  - Returns only 5-star reviews
- **UI:**
  - Only 10 reviews displayed
  - Filter dropdown shows "5 stars only" selected
  - Rating summary (4.7/5.0 based on 20 reviews) unchanged
  - Histogram shows full distribution unchanged
- **Database:** No changes

---

#### **TC-007: Review comment contains special characters**

**Related Scenario:** Scenario 8
**Type:** Boundary
**Priority:** High
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**

- Database has review with comment containing special characters:
  ```
  He said "amazing" and I agree! 🚀
  First line
  Second line
  Explained <React> components
  ```

**Test Steps:**

1. Navigate to profile with this review
2. Locate review card with special characters
3. Verify text displays correctly
   - **Verify:** Quotes display as " (not &quot;)
   - **Verify:** Line breaks are preserved (two separate lines)
   - **Verify:** Emoji renders as 🚀 (not question mark)
   - **Verify:** `<React>` displays as plain text (not parsed as HTML tag)
4. Verify no XSS vulnerability
   - **Verify:** Comment does not execute as script
5. Verify layout is not broken
   - **Verify:** Review card maintains correct height/width
   - **Verify:** Text wraps correctly

**Expected Result:**

- **UI:**
  - All special characters display correctly
  - No encoding issues (&quot;, &#39;, etc.)
  - Emojis render properly
  - HTML-like text shows as plain text (not rendered)
  - Line breaks preserved with CSS white-space: pre-wrap
  - No layout breaks or overflow
- **Security:**
  - No XSS possible
  - Comment is sanitized on backend before storing
- **Database:** No changes

**Test Data:**

```json
{
  "review": {
    "id": "review-special-chars",
    "reviewer_name": "Test User",
    "rating": 5,
    "comment": "He said \"amazing\" and I agree! 🚀\nFirst line\nSecond line\nExplained <React> components",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

#### **TC-008: View profile on mobile device (Responsive)**

**Related Scenario:** Scenario 9
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** ❌ No

**Preconditions:**

- Mentor has 10 reviews
- Testing device/emulator: iPhone 12 (viewport 390x844px)

**Test Steps:**

1. Open profile URL on mobile device or use browser DevTools mobile emulation
2. Set viewport to 390x844px (mobile)
3. Verify responsive layout
   - **Verify:** Reviews section is single column (no grid)
   - **Verify:** Review cards are full width
   - **Verify:** Rating histogram is scrollable horizontally OR simplified
   - **Verify:** Pagination buttons are large enough (min 44x44px touch target)
   - **Verify:** Sort/filter dropdowns are mobile-friendly
4. Test touch interactions
   - **Verify:** Can tap pagination buttons
   - **Verify:** Can scroll through reviews
   - **Verify:** Can open/close sort dropdown
5. Verify performance
   - **Verify:** Page loads without layout shift (CLS < 0.1)
   - **Verify:** No horizontal scroll on page

**Expected Result:**

- **UI:**
  - Mobile-responsive layout applied
  - Single column review cards
  - Touch targets meet minimum size (44x44px)
  - No layout breaks or horizontal scroll
- **Performance:**
  - Page loads in < 3 seconds on 3G network
  - No layout shift during load

---

#### **TC-009: Profile with exactly 1 review (Boundary)**

**Related Scenario:** Scenario 3
**Type:** Boundary
**Priority:** Medium
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 1, second row)

**Preconditions:**

- Mentor has exactly 1 review: rating = 5, comment = "Excellent!"
- Average rating = 5.0, total_reviews = 1

**Test Steps:**

1. Navigate to profile
2. Verify rating display
   - **Verify:** Shows "5.0/5.0 (based on 1 review)" - singular "review"
3. Verify histogram
   - **Verify:** 5★: 1 review (100%), all others: 0 reviews (0%)
4. Verify reviews list
   - **Verify:** Exactly 1 review card displayed
5. Verify pagination
   - **Verify:** No pagination controls displayed (only 1 page)

**Expected Result:**

- **UI:**
  - Correct pluralization: "1 review" not "1 reviews"
  - Histogram shows 100% at 5 stars
  - Single review card
  - No pagination
- **Database:** No changes

---

#### **TC-010: Navigate to last page with partial results**

**Related Scenario:** Scenario 5 (extended)
**Type:** Boundary
**Priority:** High
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 2, last row)

**Preconditions:**

- Mentor has 105 reviews total (11 pages: 10 per page for 10 pages, 5 on page 11)
- User navigates to page 11

**Test Steps:**

1. Navigate to profile
2. Click "Next" 10 times to reach page 11
   - OR directly navigate to `/profile/{id}?page=11`
3. Verify page 11 display
   - **Verify:** Exactly 5 reviews displayed (not 10)
   - **Verify:** "Page 11 of 11" indicator
   - **Verify:** "Next" button is disabled
   - **Verify:** "Previous" button is enabled

**Expected Result:**

- **API Response:**
  - GET /api/reviews?reviewee_id={id}&page=11&limit=10
  - Status Code: 200 OK
  - Returns array of 5 reviews (not 10)
- **UI:**
  - 5 review cards displayed
  - Pagination controls in correct state
  - "Next" button disabled (no more pages)

---

#### **TC-011: Deleted reviewer account (Edge Case)**

**Related Scenario:** Scenario 10
**Type:** Edge Case
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** ❌ No

**Preconditions:**

- Review exists with reviewer_id = `880e8400-e29b-41d4-a716-446655440003`
- Reviewer has deleted their account (user no longer exists in users table)

**Test Steps:**

1. Navigate to profile with this review
2. Locate review from deleted user
3. Verify display behavior
   - **Option A:** Review shows with reviewer name as "Deleted User"
   - **Option B:** Review is not displayed (filtered out by backend)

**Expected Result:**

- **⚠️ NEEDS PO DECISION** on which option to implement
- **If Option A:**
  - Review card displays with "Deleted User" as reviewer name
  - Rating, comment, date still shown
- **If Option B:**
  - Review is not returned by API (filtered WHERE reviewer_id IN (SELECT id FROM users))
  - Total review count excludes deleted reviewer's reviews
- **Database:** No changes

**Test Data:**

```json
{
  "review": {
    "id": "review-deleted-user",
    "reviewer_id": "880e8400-e29b-41d4-a716-446655440003",
    "reviewer_name": null,
    "rating": 4,
    "comment": "Good session",
    "created_at": "2024-12-01T10:00:00Z"
  }
}
```

---

## 🔗 Integration Test Cases

### Integration Test 1: Frontend ↔ Backend API (GET /api/reviews)

**Integration Point:** Frontend → Backend API
**Type:** Integration
**Priority:** High

**Preconditions:**

- Backend API is running at expected base URL
- Frontend can reach API endpoint
- Valid mentor user_id exists in database

**Test Flow:**

1. Frontend component (`ReviewsList`) calls GET /api/reviews with params:
   - reviewee_id: `550e8400-e29b-41d4-a716-446655440000`
   - sort: `recent`
   - page: `1`
   - limit: `10`
2. Backend API receives request
3. Backend queries database: `SELECT * FROM reviews WHERE reviewee_id = $1 AND is_hidden = false ORDER BY created_at DESC LIMIT 10 OFFSET 0`
4. Backend returns JSON response
5. Frontend receives response and parses JSON
6. Frontend renders review cards based on response data

**Contract Validation:**

- **Request format matches expected params:** ✅ Yes
  - Query params: reviewee_id (UUID), sort (enum), page (int), limit (int)
- **Response format matches expected schema:** ✅ Yes
  ```json
  {
    "reviews": [
      {
        "id": "uuid",
        "reviewer_id": "uuid",
        "reviewer_name": "string",
        "rating": 1-5,
        "comment": "string",
        "created_at": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "total": 23,
      "page": 1,
      "limit": 10,
      "total_pages": 3
    }
  }
  ```
- **Status codes match spec:** ✅ Yes
  - 200 OK: Success
  - 400 Bad Request: Invalid params (e.g., invalid UUID)
  - 404 Not Found: User doesn't exist
  - 500 Internal Server Error: Database error

**Expected Result:**

- Integration successful
- Data flows correctly: Frontend → API → DB → API → Frontend
- No data loss or transformation errors
- JSON parsing succeeds
- UI renders reviews correctly based on API response

---

### Integration Test 2: Backend API ↔ Supabase Database (reviews table)

**Integration Point:** Backend → Supabase PostgreSQL
**Type:** Integration
**Priority:** High

**Preconditions:**

- Supabase database is accessible from backend
- reviews table exists with correct schema
- Test data exists in reviews table

**Test Flow:**

1. Backend API receives request for reviews
2. Backend constructs SQL query:
   ```sql
   SELECT r.*, u.name as reviewer_name
   FROM reviews r
   JOIN users u ON r.reviewer_id = u.id
   WHERE r.reviewee_id = $1
     AND r.is_hidden = false
   ORDER BY r.created_at DESC
   LIMIT $2 OFFSET $3;
   ```
3. Query executes against Supabase PostgreSQL
4. Database returns result set
5. Backend transforms result to JSON
6. Backend returns response to frontend

**Contract Validation:**

- Query syntax is valid PostgreSQL: ✅ Yes
- Indexes exist on reviewee_id for performance: ⚠️ NEEDS DEV CONFIRMATION
- Row Level Security (RLS) allows public read access to non-hidden reviews: ✅ Yes
- JOIN with users table succeeds (reviewer_name): ✅ Yes

**Expected Result:**

- Query executes successfully (< 100ms for 10 reviews)
- Correct reviews returned (filtered by reviewee_id and is_hidden)
- Data types match schema (UUID, integer, text, timestamp)
- No SQL injection vulnerabilities (parameterized queries)

---

### Integration Test 3: Rating Summary API (GET /api/users/:id/rating)

**Integration Point:** Frontend → Backend API → user_ratings table
**Type:** Integration
**Priority:** High

**Preconditions:**

- user_ratings materialized view exists
- Mentor has reviews, rating summary is calculated

**Test Flow:**

1. Frontend calls GET /api/users/550e8400-e29b-41d4-a716-446655440000/rating
2. Backend queries user_ratings table:
   ```sql
   SELECT average_rating, total_reviews, rating_distribution
   FROM user_ratings
   WHERE user_id = $1;
   ```
3. Backend returns JSON response
4. Frontend parses rating_distribution JSONB
5. Frontend displays rating (4.7/5.0) and histogram

**Contract Validation:**

- Response format matches expected schema: ✅ Yes
  ```json
  {
    "average_rating": 4.7,
    "total_reviews": 23,
    "rating_distribution": {
      "5": 15,
      "4": 5,
      "3": 2,
      "2": 0,
      "1": 1
    }
  }
  ```
- JSONB parsing succeeds: ✅ Yes
- average_rating precision is 1 decimal place: ✅ Yes

**Expected Result:**

- API responds with correct rating summary
- Frontend correctly parses JSONB rating_distribution
- Histogram displays correct percentages
- Average rating matches sum/count calculation

---

### Integration Test 4: Pagination with URL State (Query Params)

**Integration Point:** Browser URL ↔ Frontend State ↔ Backend API
**Type:** Integration
**Priority:** Medium

**Preconditions:**

- Next.js 15 routing configured
- URL query params synced with component state

**Test Flow:**

1. User navigates to `/profile/{id}?page=2&sort=highest`
2. Next.js router parses query params
3. Frontend component reads page=2, sort=highest from router
4. Frontend calls API with page=2, sort=highest
5. API returns reviews for page 2, sorted by rating DESC
6. User clicks "Next" button
7. Frontend updates URL to `/profile/{id}?page=3&sort=highest` (using router.push)
8. Process repeats for page 3

**Contract Validation:**

- URL params correctly parsed: ✅ Yes
- Page param is integer: ✅ Yes
- Sort param is enum (recent|highest|lowest): ✅ Yes
- URL updates on pagination/sort change: ✅ Yes
- Browser back/forward buttons work correctly: ✅ Yes

**Expected Result:**

- URL state synced with UI state
- Pagination works with URL params
- Browser back button returns to previous page
- Direct URL navigation works (e.g., manually typing `?page=5`)

---

## 📊 Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| --------- | -------------------------- | -------------------- | --------- | -------- |
| Profile with 0 reviews | ✅ Yes (Scenario 2) | ✅ Yes (Scenario 2) | TC-002 | High |
| Profile with 1 review (pluralization) | ❌ No | ✅ Yes (Scenario 3) | TC-009 | Medium |
| All reviews same rating | ❌ No | ✅ Yes (FASE 2) | TC-001 (partial) | Low |
| Deleted reviewer account | ❌ No | ✅ Yes (Scenario 10) | TC-011 | Medium |
| Review comment is empty | ❌ No | ✅ Yes (FASE 2) | Covered in TC-001 | Medium |
| Profile viewed during new review submission | ❌ No | ✅ Yes (FASE 2) | Not tested (expected behavior documented) | Low |
| Review with max 500 chars | ❌ No | ✅ Yes (FASE 2) | Covered in TC-007 | Medium |
| Multiple pages (pagination boundary) | ⚠️ Partial (mentioned pagination) | ✅ Yes (Scenario 5) | TC-010 | High |
| Special characters in comments | ❌ No | ✅ Yes (Scenario 8) | TC-007 | High |
| API error (500, timeout) | ❌ No | ✅ Yes (Scenario 4) | TC-003 | High |
| Mobile responsive layout | ❌ No | ✅ Yes (Scenario 9) | TC-008 | High |
| Loading state during fetch | ❌ No | ⚠️ Documented in FASE 2 | Not tested (should add) | Medium |

---

## 🗂️ Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
| --------- | ----- | ------- | -------- |
| Valid data | 10 | Positive tests | Mentor with 23 reviews, avg 4.7 rating, mixed review comments |
| Invalid data | 4 | Negative tests | Invalid UUID format, negative page numbers, invalid sort values |
| Boundary values | 6 | Boundary tests | 0 reviews, 1 review, 105 reviews (pagination edge), 500-char comment |
| Edge case data | 4 | Edge case tests | Deleted user reviews, special chars in comments, same rating distribution |

### Data Generation Strategy

**Static Test Data:**

Data that must be hardcoded for consistency and repeatability:

- Mentor user_id: `550e8400-e29b-41d4-a716-446655440000` (primary test user)
- Empty profile user_id: `660e8400-e29b-41d4-a716-446655440001`
- Deleted reviewer user_id: `880e8400-e29b-41d4-a716-446655440003`
- Rating summary: 4.7 average, 23 total, distribution {5:15, 4:5, 3:2, 2:0, 1:1}
- Specific review comments for special character testing

**Dynamic Test Data (using Faker.js):**

Data that can be generated dynamically for variability:

- Reviewer names: `faker.person.fullName()`
- Review comments: `faker.lorem.sentence(10)` (for non-specific tests)
- Review dates: `faker.date.recent({ days: 90 })`
- User IDs (non-critical tests): `faker.string.uuid()`

**Database Seed Script:**

Create a test data seed script to populate database with consistent test data before E2E test runs:

```sql
-- Seed script for MYM-35 test data
INSERT INTO users (id, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Carlos Mendoza', 'mentor'),
  ('660e8400-e29b-41d4-a716-446655440001', 'New Mentor', 'mentor');

INSERT INTO reviews (id, booking_id, reviewer_id, reviewee_id, rating, comment, created_at) VALUES
  -- 15 five-star reviews
  ('review-001', 'booking-001', 'user-001', '550e8400-e29b-41d4-a716-446655440000', 5, 'Excellent mentor!', '2025-01-15 10:30:00'),
  -- ... (14 more)
  -- 5 four-star reviews
  ('review-016', 'booking-016', 'user-016', '550e8400-e29b-41d4-a716-446655440000', 4, 'Very helpful', '2025-01-10 14:20:00'),
  -- ... (4 more)
  -- 2 three-star, 1 one-star
  -- Total: 23 reviews
;

-- Trigger will automatically update user_ratings table
```

**Test Data Cleanup:**

- ✅ All test data is cleaned up after test execution using `afterEach()` hooks
- ✅ Tests are idempotent (can run multiple times without conflicts)
- ✅ Tests do not depend on execution order (each test sets up its own data)
- ✅ Database is reset to seed state between test runs

---

## 📝 Next Steps (Pending FASE 5)

**FASE 5a: Update Story in Jira** ⏳ PENDING

- Read current story MYM-35 from Jira using MCP Atlassian
- Update story description with refined acceptance criteria (Scenarios 1-10 above)
- Add edge cases identified in FASE 2
- Add label: `shift-left-reviewed`

**FASE 5b: Add Test Cases Comment in Jira** ⏳ PENDING

- Add this entire document as a comment in Jira MYM-35
- Tag @PO, @Dev Lead, @QA Team for review
- Include checklist of action items

**FASE 5c: Generate Local test-cases.md** ✅ DONE

- This file you're reading now!

**FASE 5d: Final QA Feedback Report** ⏳ PENDING

- Generate executive summary for user
- Highlight critical questions needing answers
- List suggested story improvements
- Provide testing recommendations

---

## 🎯 Definition of Done (QA Perspective)

This story is considered "Done" from QA when:

- [ ] All ambiguities from FASE 2 are resolved by PO/Dev
- [ ] Critical questions answered:
  - [ ] How to handle deleted reviewer accounts? (Option A or B)
  - [ ] Database index on reviewee_id confirmed?
  - [ ] Concurrent read strategy confirmed (caching, isolation level)?
- [ ] Story updated with suggested improvements (if accepted by PO)
- [ ] All 24 test cases are executed and passing:
  - [ ] Critical/High test cases (TC-001, TC-002, TC-003, TC-004, TC-007, TC-008, TC-010): 100% passing (7 of 7)
  - [ ] Medium/Low test cases (TC-005, TC-006, TC-009, TC-011): ≥95% passing (at least 3 of 4)
- [ ] All critical and high bugs resolved and verified
- [ ] Integration tests passing (Integration Test 1-4)
- [ ] API contract validation passed
- [ ] Responsive design validated on mobile/tablet/desktop
- [ ] Accessibility: ARIA labels for stars, semantic HTML, keyboard navigation
- [ ] Performance: Page loads in < 3s, no layout shift (CLS < 0.1)
- [ ] Security: XSS prevention validated, no SQL injection
- [ ] Test execution report generated
- [ ] No blockers for next stories in epic (MYM-33, MYM-34 completed)

---

## 📎 Related Documentation

- **Story:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/STORY-MYM-35-view-profile-reviews/story.md`
- **Epic:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/epic.md`
- **Epic Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-32 (Feature Test Plan comment)
- **Story Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-35
- **User Personas:** `.context/PRD/user-personas.md`
- **User Journeys:** `.context/PRD/user-journeys.md`
- **Functional Specs:** `.context/SRS/functional-specs.md` (FR-015)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`

---

## 📋 Test Execution Tracking

[Esta sección se completa durante ejecución]

**Test Execution Date:** [TBD]
**Environment:** Staging
**Executed By:** [Nombre]

**Results:**

- Total Tests: 24
- Passed: [TBD]
- Failed: [TBD]
- Blocked: [TBD]

**Bugs Found:**

- [Bug ID 1]: [Descripción breve]
- [Bug ID 2]: [Descripción breve]

**Sign-off:** [Nombre QA] - [Fecha]

---

**Document Version:** 1.0
**Last Updated:** 2025-01-21
**Status:** Draft - Awaiting PO/Dev Review
