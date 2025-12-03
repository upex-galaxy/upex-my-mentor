🧪 Shift-Left Test Cases - Generated 2025-11-11
QA Engineer: AI-Generated
Status: Draft - Pending PO/Dev Review

📋 FASE 1: Critical Analysis
Business Context of This Story
User Persona Affected:

Primary: Laura, la Desarrolladora Junior - Needs to see her upcoming sessions to prepare and manage her time.

Secondary: Carlos, el Arquitecto Senior - Needs to see his scheduled sessions to manage his availability.

Business Value:

Value Proposition: "Flexibility and Choice" - The dashboard is a key feature for post-booking management, reducing friction.

Business Impact: Improves user retention by providing a clear, self-service way to manage sessions, reducing support load.

Related User Journey:

Journey: Post-Booking Management

Step: The dashboard is the entry point for all post-booking actions, like joining a call or leaving a review.

Technical Context of This Story
Architecture Components:
Frontend:

Components: SessionDashboard, UpcomingSessionsTab, PastSessionsTab, SessionCard, EmptyState, LoadingSpinner.

Pages/Routes: /dashboard/sessions (authenticated route).

State Management: Auth context to get userId, SWR/React Query for data fetching.
Backend:

API Endpoints: GET /api/bookings?status=upcoming|past

Services: BookingService to fetch user's sessions.

Database: bookings table.

Integration Points:

Frontend ↔ Backend API (fetching sessions).

Backend API ↔ Database (querying bookings table).

Story Complexity Analysis
Overall Complexity: Medium
Complexity Factors:

Business logic complexity: Medium (correctly partitioning sessions, timezone handling).

Integration complexity: Low (single API endpoint).

UI complexity: Medium (handling two tabs, loading, and empty states).
Estimated Test Effort: Medium

🚨 FASE 2: Story Quality Analysis
Ambiguities Identified
Ambiguity 1: The story says "shows the other participant's name" but does not specify what to do if the name is null or empty.

Question for PO/Dev: What should be displayed if a user's name is null? "Anonymous User"? Their email?

Impact on Testing: Cannot test the scenario of a user with a null name.

Ambiguity 2: Pagination behavior is not defined.

Question for PO/Dev: How many items per page? Is it infinite scroll or classic pagination? What is the expected behavior?

Missing Information / Gaps
Gap 1: Loading and error states are not mentioned in the acceptance criteria.

Why It's Critical: The UI must handle these states gracefully to provide a good user experience.

Suggested Addition: Add acceptance criteria for when the API call is in progress or fails.

Edge Cases NOT Covered in Original Story
Edge Case 1: A user who has sessions only in the "Upcoming" tab or only in the "Past" tab.

Edge Case 2: A session that is happening exactly "now". Should it appear in upcoming or past?

Edge Case 3: A user (mentor or mentee) who has a null or empty name.

✅ FASE 3: Refined Acceptance Criteria
Scenario 1: User with upcoming and past sessions views the dashboard
Type: Positive

Priority: Critical

Given: A logged-in user has 2 upcoming and 3 past sessions.

When: The user navigates to the /dashboard/sessions page.

Then: The "Upcoming" tab is displayed by default, showing 2 session cards.

And: The "Past" tab shows 3 session cards.

And: Each card correctly displays the other participant's name and the session date/time in the user's local timezone.

Scenario 2: User with no sessions views the dashboard
Type: Negative

Priority: High

Given: A logged-in user has no sessions.

When: The user navigates to the /dashboard/sessions page.

Then: An empty state message "You have no sessions yet" is displayed.

And: A clear call-to-action button "Find a Mentor" is visible.

Scenario 3: API fails to load sessions
Type: Negative

Priority: Medium

Given: A logged-in user navigates to the /dashboard/sessions page.

When: The GET /api/bookings call returns a 500 server error.

Then: The dashboard displays an error message "Failed to load sessions. Please try again."

And: A "Retry" button is available.

🧪 FASE 4: Test Design
Test Cases
TC-MYM-29-01: Verify dashboard displays upcoming and past sessions correctly
Related Scenario: 1

Type: Positive

Priority: Critical

Test Level: UI

Preconditions:

User is logged in.

User has 2 upcoming and 3 past sessions in the database.

Test Steps:

Navigate to /dashboard/sessions.

Verify: The "Upcoming" tab is active.

Verify: Exactly 2 SessionCard components are rendered.

Click on the "Past" tab.

Verify: The "Past" tab is active.

Verify: Exactly 3 SessionCard components are rendered.

TC-MYM-29-02: Verify session card details
Related Scenario: 1

Type: Positive

Priority: Critical

Test Level: UI

Preconditions:

User is logged in and has an upcoming session with "Carlos, el Arquitecto Senior".

The session is on 2025-12-01T10:00:00Z.

The user's timezone is America/New_York (EST).

Test Steps:

Navigate to /dashboard/sessions.

Locate the session card for the upcoming session.

Verify: The card displays the name "Carlos, el Arquitecto Senior".

Verify: The card displays the date and time converted to the user's timezone (e.g., "December 1, 2025, 5:00 AM EST").

TC-MYM-29-03: Verify empty state for a new user
Related Scenario: 2

Type: Negative

Priority: High

Test Level: UI

Preconditions:

User is logged in for the first time and has no bookings.

Test Steps:

Navigate to /dashboard/sessions.

Verify: A message "You have no sessions yet" is displayed.

Verify: A button with the text "Find a Mentor" is visible and clickable.

TC-MYM-29-04: Verify error state when API fails
Related Scenario: 3

Type: Negative

Priority: Medium

Test Level: UI

Preconditions:

User is logged in.

The API endpoint /api/bookings is mocked to return a 500 error.

Test Steps:

Navigate to /dashboard/sessions.

Verify: An error message "Failed to load sessions. Please try again." is displayed.

Verify: A "Retry" button is visible.

TC-MYM-29-05: Verify loading state
Type: Positive

Priority: Medium

Test Level: UI

Preconditions:

User is logged in.

The API endpoint /api/bookings is mocked to have a 2-second delay.

Test Steps:

Navigate to /dashboard/sessions.

Verify: A loading spinner or skeleton loader is displayed while the data is being fetched.

Verify: The loader disappears after the data is loaded.

📢 Action Required
@[Product Owner]:

[ ] Review and answer Critical Questions.

[ ] Validate suggested story improvements.

[ ] Confirm expected behavior for identified edge cases.

@[Dev Lead]:

[ ] Review Technical Questions.

[ ] Validate integration points and test approach.

Next Steps:

Team discusses critical questions and ambiguities.

PO/Dev provide answers and clarifications.

QA updates test cases based on feedback.

Dev starts implementation with clear acceptance criteria.
