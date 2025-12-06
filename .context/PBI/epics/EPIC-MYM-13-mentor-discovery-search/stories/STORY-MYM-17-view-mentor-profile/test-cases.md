# Test Cases: STORY-MYM-17 - As a Mentee, I want to view a mentor's detailed public profile so that I can decide if they are a good fit for me

**Fecha:** 2025-12-05
**QA Engineer:** AI-Generated
**Story Jira Key:** MYM-17
**Epic:** MYM-13 - Mentor Discovery & Search
**Status:** Draft

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
- **Primary:** Laura, la Desarrolladora Junior - She needs to see detailed profiles to evaluate mentors and decide who can help her solve specific technical problems and accelerate her career growth. This page is her primary tool for making a purchase decision.

**Business Value:**
- **Value Proposition:** This feature directly delivers on the promise of "Access to Expertise Verificado" by providing the necessary details for a mentee to trust a mentor.
- **Business Impact:** This is a critical step in the conversion funnel. A good profile page increases the 25% conversion rate from profile view to booking attempt. It's essential for achieving the $5,000 GMV target in the first month.

**Related User Journey:**
- **Journey:** Registro de Estudiante y Reserva de Primera Sesión (Happy Path)
- **Step:** Step 4 - Laura revisa varios perfiles y se detiene en uno con buenas valoraciones. This story *is* that step.

---

### Technical Context of This Story

**Architecture Components:**
**Frontend:**
-   **Components:** `MentorProfile`, `RatingDisplay`, `ReviewCard`.
-   **Pages/Routes:** `/mentors/[mentor_id]` (dynamic route).
-   **State Management:** Minimal state needed for this page, mostly for potential UI interactions like review pagination.

**Backend:**
-   **API Endpoints:** `GET /api/mentors/:id`
-   **Services:** Data fetching logic to get mentor details.
-   **Database:** Primarily reads from `profiles`, `mentor_profiles`, and `reviews` tables.

**Integration Points:**
-   **Frontend ↔ Backend API:** The frontend calls `GET /api/mentors/:id` to fetch the data for the profile page.
-   **Backend ↔ Supabase Database:** The backend executes a SQL query with JOINs to collect all mentor information from multiple tables.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**
-   **Risk:** Slow page load with 50+ mentors.
    -   **Relevance to This Story:** The detail page must also be performant. NFR for LCP is < 2.5s.
-   **Risk:** Mentor photos missing or loading slowly.
    -   **Relevance to This Story:** The main profile photo is a key element; if it's missing or slow, it severely degrades the UX.

**Integration Points from Epic Analysis:**
-   **Integration Point:** Frontend ↔ Backend API
    -   **Applies to This Story:** ✅ Yes
    -   **If Yes:** This story implements the client for the `GET /api/mentors/:id` endpoint.
-   **Integration Point:** Backend ↔ Supabase Database
    -   **Applies to This Story:** ✅ Yes
    -   **If Yes:** The backend for this story performs the query to fetch detailed mentor data, including reviews.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** How should reviews be displayed and paginated?
- **Location in Story:** Not specified in the story or acceptance criteria.
- **Question for PO/Dev:** How many reviews should be shown per page? What is the default sort order (e.g., most recent first)?
- **Impact on Testing:** Cannot verify the correct pagination or sorting behavior without this information.
- **Suggested Clarification:** Add to AC: "Reviews are paginated with 5 reviews per page, sorted by most recent first."

**Ambiguity 2:** What is the specific content and format of the "availability calendar preview"?
- **Location in Story:** Mentioned in the epic scope but not detailed.
- **Question for PO/Dev:** Is this a weekly view? Does it show specific time slots? Or just a badge saying "Available this week"? This has a dependency on EPIC-MYM-18 (Scheduling).
- **Impact on Testing:** Cannot test a component whose design and functionality are undefined.
- **Suggested Clarification:** For MVP, this could be simplified to a text statement like "This mentor has upcoming availability." and the full calendar can be deferred to the booking flow.

### Missing Information / Gaps

**Gap 1:** Details on "Years of Experience".
- **Type:** Technical Detail.
- **Why It's Critical:** The AC mentions displaying "years of experience," but this field doesn't exist in the database schema (`MENTORS` table).
- **Suggested Addition:** Add a `years_of_experience` (integer) field to the `mentor_profiles` table or clarify how this should be calculated/derived.
- **Impact if Not Added:** The requirement to display this information cannot be met or tested.

---

## ✅ FASE 3: Refined Acceptance Criteria

(Appended to Jira issue description in the previous step)

---

## 🧪 FASE 4: Test Design

### Test Cases

#### **TC-001: View a complete and valid mentor profile**
**Type:** Positive, **Priority:** Critical, **Test Level:** E2E
**Preconditions:**
-   User is logged in as a mentee.
-   A verified mentor exists with a full profile (bio, skills, rate, photo, 10+ reviews).
**Test Steps:**
1.  Navigate to the `/mentors` gallery.
2.  Click on the card for the specified mentor.
3.  Verify the URL changes to `/mentors/<mentor_id>`.
4.  Verify the page displays the mentor's full name, photo, bio, skills, hourly rate, and average rating with review count.
5.  Verify a list of 5 reviews is displayed.
6.  Verify pagination controls for reviews are visible.
7.  Click the "next" page button for reviews.
8.  Verify a new set of reviews is displayed.
9.  Verify the "Book a Session" button is visible.
**Expected Result:**
-   All mentor information is displayed correctly. The review pagination works as expected.

#### **TC-002: View a mentor profile with no reviews**
**Type:** Negative, **Priority:** High, **Test Level:** UI
**Preconditions:**
-   User is logged in.
-   A verified mentor exists with 0 reviews.
**Test Steps:**
1.  Navigate directly to the mentor's profile page.
2.  Observe the reviews section.
**Expected Result:**
-   The reviews section displays a message like "This mentor doesn't have any reviews yet."
-   The average rating is not displayed, or shows "No rating".

#### **TC-003: View a mentor profile with no optional social links**
**Type:** Negative, **Priority:** Medium, **Test Level:** UI
**Preconditions:**
-   User is logged in.
-   A verified mentor exists with `linkedin_url` and `github_url` set to NULL.
**Test Steps:**
1.  Navigate to the mentor's profile page.
2.  Observe the area where social links would be.
**Expected Result:**
-   The icons/links for GitHub and LinkedIn are not rendered. The layout remains clean.

#### **TC-004: Attempt to view a non-existent mentor profile**
**Type:** Negative, **Priority:** High, **Test Level:** UI
**Test Steps:**
1.  Navigate to `/mentors/a-fake-id-that-does-not-exist`.
**Expected Result:**
-   A 404 Not Found page is displayed with a helpful message and a link back to the mentor gallery.

#### **TC-005: Attempt to view an unverified mentor's profile**
**Type:** Security, **Priority:** High, **Test Level:** API
**Preconditions:**
-   A mentor exists with `is_verified` = `false`.
**Test Steps:**
1.  Make a `GET` request to `/api/mentors/<unverified_mentor_id>`.
**Expected Result:**
-   The API returns a `404 Not Found` response. The profile of an unverified mentor should not be publicly accessible.

#### **TC-006: Mentor profile displays correctly on mobile devices**
**Type:** Positive, **Priority:** High, **Test Level:** E2E
**Preconditions:**
-   Using a mobile viewport (e.g., 375x812).
-   User is logged in.
**Test Steps:**
1.  Navigate to a valid mentor profile page.
**Expected Result:**
-   The layout is responsive and all information is readable without horizontal scrolling. The "Book a Session" button is easily clickable.
