# Test Cases: STORY-MYM-22 - Email Confirmation and Calendar Invite

**Fecha:** 2025-11-26
**QA Engineer:** Gemini AI
**Story Jira Key:** MYM-22
**Epic:** EPIC-MYM-18 - Scheduling & Booking
**Status:** Draft

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

*   **Primary:** Laura, la Desarrolladora Junior - She needs immediate confirmation and an easy way to calendar the session to feel secure about her purchase and not miss the appointment.
*   **Primary:** Carlos, el Arquitecto Senior - He needs reliable notifications to manage his schedule effectively and appear professional to his mentees.
*   **Secondary:** Sofía, la Cambiadora de Carrera - Like Laura, she relies on these confirmations for trust and organization, especially when managing a new learning schedule.

**Business Value:**

This story is crucial for post-transaction user experience and retention. It directly impacts user trust and operational efficiency.

*   **Value Proposition:**
    *   **For Users (Mentors & Mentees):** Provides immediate assurance that the booking was successful and automates the process of adding the session to their personal calendars, reducing the risk of no-shows. This builds trust and professionalism.
    *   **For the Platform:** Reduces customer support inquiries (e.g., "Did my booking go through?"), minimizes no-shows which can lead to disputes, and reinforces the platform's reliability.
*   **Business Impact:**
    *   Directly contributes to the **`<5% booking abandonment rate`** KPI by providing a smooth post-payment experience.
    *   Indirectly supports the **`100 sessions booked`** and **`$5,000 GMV`** goals by ensuring users have a positive, reliable experience worth repeating and recommending.

**Related User Journey:**

*   **Journey:** Registro de Estudiante y Reserva de Primera Sesión (Happy Path)
*   **Step:** Step 6 - "Laura completa el pago." This story is the immediate system response to a successful payment, delivering the confirmation and calendar invite that solidifies the booking.

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

*   No direct frontend components are built in this story, but the frontend will initiate the process that eventually triggers the notifications (i.e., the payment confirmation).

**Backend:**

*   **API Endpoints:** While not a public endpoint, this functionality is triggered internally after the payment confirmation webhook is received and processed, likely related to an internal call after `PATCH /api/bookings/:id/confirm`.
*   **Services:**
    *   **Notification Service:** A dedicated service, possibly running in a Supabase Edge Function, responsible for composing and sending emails.
    *   **Calendar Service:** A service or library (e.g., `ics`) responsible for generating the `.ics` calendar invite file.
*   **Database:**
    *   `bookings` table: The function will read session details from this table (mentor_id, mentee_id, session_datetime). It will also update fields like `confirmation_sent_at` upon successful email dispatch.
    *   `users`, `mentors`, `students` tables: Read to get the email addresses and names of the mentor and mentee.

**External Services:**

*   **Email Service (e.g., Resend):** The service used to actually send the emails. Reliability and deliverability are key.
*   **Date/Time Libraries (e.g., `date-fns-tz`):** Critical for ensuring the times in the email body and the `.ics` file are correct and handle timezones properly.

**Integration Points:**

*   **Payment Webhook → Booking Confirmation Logic:** The start of the process. The system must correctly identify a successful payment to trigger this story's logic.
*   **Backend → Email Service:** The backend must correctly format the API call to the email service, including recipient, subject, body, and the `.ics` attachment.
*   **Backend → .ics Library:** The backend needs to pass the correct session data (start time, end time, summary, description, attendees) to the library to generate a valid calendar file.

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

*   **Business logic complexity:** Low - The core logic is straightforward: "after booking, send email".
*   **Integration complexity:** High - This story is almost entirely about integrations: with the payment system's events, a date/time library for `.ics` generation, and an external email service. A failure in any of these integrations causes the entire story to fail.
*   **Data validation complexity:** Medium - Ensuring the `.ics` file is RFC 5545 compliant and works across major calendar clients (Google Calendar, Outlook, Apple Calendar) is non-trivial. Timezone handling is a major risk.
*   **UI complexity:** Low - Not applicable.

**Estimated Test Effort:** Medium
**Rationale:** While the business logic is simple, the number of external dependencies and the high risk associated with getting timezone and file format details wrong requires a significant number of integration and validation test cases.

### Epic-Level Context (From Feature Test Plan in Jira)

**⚠️ IMPORTANTE:** This section is based on the local `feature-test-plan.md`. It needs to be cross-referenced with Jira comments once access is available.

**Critical Risks Already Identified at Epic Level:**

*   **Risk:** Timezone Conversion Errors Leading to Wrong Booking Times
    *   **Relevance to This Story:** CRITICAL. An error here means the calendar invite adds the session at the wrong time, directly causing the problem this risk highlights. The `.ics` file and email body must be perfect.
*   **Risk:** Email Delivery Failures Cause Missed Sessions
    *   **Relevance to This Story:** CRITICAL. This is the primary risk this story's functionality is subject to. The test plan must cover retry logic, monitoring, and failure handling.

**Integration Points from Epic Analysis:**

*   **Integration Point:** Backend ↔ Email Service
    *   **Applies to This Story:** ✅ Yes
    *   **If Yes:** This story *is* the implementation of this integration point for the booking confirmation event.
*   **Integration Point:** Booking Flow → Payment Flow
    *   **Applies to This Story:** ✅ Yes
    *   **If Yes:** This story is the direct successor to the payment flow. The successful completion of the payment flow is the trigger for this story.

**Critical Questions Already Asked at Epic Level:**

*There were no specific questions in the epic test plan directly related to the content of the confirmation email itself, but the risks imply the need for clarity.*

**Test Strategy from Epic:**

*   **Test Levels:** The epic test plan calls for Unit, Integration, and E2E tests.
*   **Tools:** Vitest, Playwright API testing.
*   **How This Story Aligns:**
    *   **Unit Testing:** Essential for the `.ics` file generation logic to ensure the output is valid.
    *   **Integration Testing:** Critical for testing the connection to the email service and the trigger from the payment webhook.
    *   **E2E Testing:** The final step of the booking E2E test is to verify that the confirmation email is received and is correct.

**Summary: How This Story Fits in Epic:**

*   **Story Role in Epic:** This story provides the crucial feedback loop to the user after the core transaction of the epic (booking a session) is completed. It finalizes the "happy path" of the booking journey.
*   **Inherited Risks:** Inherits all risks related to timezones and email reliability.
*   **Unique Considerations:** The main unique challenge is the generation of a universally compatible `.ics` file, which is a technical detail specific to this story.

---
## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** What is the sender's name and email address?
- **Location in Story:** Not specified.
- **Question for PO/Dev:** Who is the email from? Should it be a generic "no-reply@upexmymentor.com" with the name "Upex My Mentor"? Or something more personal?
- **Impact on Testing:** Cannot verify the `From:` header in email tests. This also impacts user trust and email deliverability (spam filters).
- **Suggested Clarification:** Specify `From: "Upex My Mentor" <confirmations@upexmymentor.com>`.

**Ambiguity 2:** What is the precise content and structure of the email body?
- **Location in Story:** Description is high-level ("session details (date, time, participants)").
- **Question for PO/Dev:** What is the exact template? Does it include mentor/mentee profile pictures? Should the time be displayed in both the user's local timezone and UTC?
- **Impact on Testing:** Test cases for email content will be generic. Cannot write specific assertions for the email body.
- **Suggested Clarification:** Provide a simple markdown or HTML template for the email. Example:
    > Subject: Your session with [Mentor Name] is confirmed!
    >
    > Hi [User Name],
    >
    > Great news! Your 60-minute session with **[Mentor Name]** is confirmed.
    >
    > **When:** [Day], [Date] at [Time] ([User's Timezone])
    > **Link:** [Link to Video Call]
    >
    > We've attached a calendar invite to this email.

**Ambiguity 3:** What information is included in the calendar invite (`.ics` file)?
- **Location in Story:** Technical Notes mention a link to the video call.
- **Question for PO/Dev:** What about other fields?
    - `SUMMARY` (event title): "Mentorship Session with [Mentor Name]"?
    - `DESCRIPTION`: Session details, link to platform?
    - `ORGANIZER`: The platform email?
    - `ATTENDEE`: Both mentor and mentee emails?
- **Impact on Testing:** Cannot write specific unit tests to validate the content of the `.ics` file.
- **Suggested Clarification:** Define the content for the key fields of the `.ics` file.

✅ **If NO other ambiguities found:** The rest of the story is reasonably clear.

### Missing Information / Gaps

**Gap 1:** Handling of email failures.
- **Type:** Technical Details / Business Rule
- **Why It's Critical:** Email is a dependency that can fail. The Feature Test Plan for the epic identifies this as a major risk. The story needs to define what happens if the confirmation email cannot be sent.
- **Suggested Addition:** Add a technical note: "If the email service provider returns an error, the system will retry sending the email 3 times with exponential backoff (1 min, 5 min, 15 min). If it still fails, the `confirmation_sent_at` field in the `bookings` table will remain null and the failure will be logged for administrative review. The user can still see the booking confirmation in their dashboard."
- **Impact if Not Added:** High risk of users not being notified without any system-level awareness of the failure, leading to a poor user experience and potential missed sessions.

**Gap 2:** No mention of reminder emails.
- **Type:** Acceptance Criteria.
- **Why It's Critical:** The parent epic (`MYM-18`) explicitly lists "Reminder email 24 hours before session" and "Reminder email 1 hour before session" in its scope and acceptance criteria. This story is the logical place to consider them, even if implemented separately.
- **Suggested Addition:** Clarify if reminders are part of this story or a new one. If separate, create a new story `STORY-MYM-XX: Session Reminder Emails`. If part of this story, add acceptance criteria for the scheduled jobs that will send reminders. (Assuming this should be a separate story for now).
- **Impact if Not Added:** A key requirement from the epic might be missed.

✅ **If NO other gaps found:** The story is otherwise reasonably self-contained.

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** User has a weak or intermittent internet connection.
- **Scenario:** The payment webhook is received and the booking is confirmed, but the user closes their browser before being redirected to the confirmation page.
- **Expected Behavior:** The email confirmation is their primary proof that the booking succeeded. The system must send the email reliably regardless of the user's frontend state.
- **Criticality:** High.
- **Action Required:** This is not a change to the story, but a critical scenario to validate during E2E testing.

**Edge Case 2:** A user's email address is invalid or their inbox is full.
- **Scenario:** The email service attempts to send the confirmation but receives a bounce-back.
- **Expected Behavior:** The system should log the bounce-back. The user's booking is still valid in their dashboard. Future enhancements could flag the user's profile with an "invalid email" warning.
- **Criticality:** Medium.
- **Action Required:** Add to test cases. Requires integration with email service webhooks if we want to handle this automatically. For MVP, logging is sufficient.

**Edge Case 3:** The session is booked across a Daylight Saving Time (DST) boundary.
- **Scenario:** A user books a session that will occur after the DST clock change.
- **Expected Behavior:** The `.ics` file must correctly handle the DST change to ensure the calendar event is at the correct local time for both users. The email body should also reflect the correct local time.
- **Criticality:** High.
- **Action Required:** Add specific DST scenarios to the test cases. This is a major technical risk.

### Testability Validation

**Is this story testable as written?** ⚠️ Partially

**Testability Issues (if any):**

-   [x] Expected results are not specific enough (exact email content and `.ics` file structure are missing).
-   [x] Missing error scenarios (what happens if email fails?).
-   [ ] Cannot be tested in isolation (has a hard dependency on the payment confirmation event).

**Recommendations to Improve Testability:**

1.  **Define Email/ICS Content:** Provide at least a basic template for the email body and the key-value pairs for the `.ics` file.
2.  **Specify Error Handling:** Add acceptance criteria for the email retry logic.
3.  **Decouple Trigger:** For testing purposes, create an internal test endpoint (e.g., `POST /api/testing/trigger-confirmation-email/{bookingId}`) that allows QA to trigger this functionality on demand without needing to complete a full payment flow every time. This is crucial for efficient testing.

---
## ✅ FASE 3: Refined Acceptance Criteria

Here are the refined acceptance criteria, incorporating the findings from the quality analysis.

### Scenario 1: Happy Path - Session Confirmed for Mentee

**Type:** Positive
**Priority:** Critical

-   **Given:** A mentee named "Laura" has successfully paid for a 60-minute session with a mentor named "Carlos".
-   **And:** Laura's local timezone is "America/Los_Angeles" (PST) and Carlos's is "America/New_York" (EST).
-   **And:** The session is scheduled for November 15, 2025, at 10:00 AM EST (which is 7:00 AM PST).
-   **When:** The system confirms the payment and updates the session status to 'confirmed'.
-   **Then:** The system sends a confirmation email to Laura's registered email address from `"Upex My Mentor" <confirmations@upexmymentor.com>`.
-   **And:** The email subject is "Your session with Carlos is confirmed!".
-   **And:** The email body correctly displays the session time in Laura's local timezone: "November 15, 2025, at 7:00 AM PST".
-   **And:** The email contains a valid `.ics` file attachment named `session.ics`.
-   **And:** The `.ics` file, when opened, creates a calendar event titled "Mentorship Session with Carlos".
-   **And:** The calendar event's start time is correctly set to November 15, 2025, at 7:00 AM PST.
-   **And:** The calendar event's description includes a link to the external video call.
-   **And:** The `bookings` table for this session has its `confirmation_sent_at` column updated with the current timestamp.

### Scenario 2: Happy Path - Session Confirmed for Mentor

**Type:** Positive
**Priority:** Critical

-   **Given:** The same confirmed session from Scenario 1.
-   **When:** The system confirms the payment.
-   **Then:** The system sends a confirmation email to Carlos's registered email address.
-   **And:** The email subject is "Your session with Laura is confirmed!".
-   **And:** The email body correctly displays the session time in Carlos's local timezone: "November 15, 2025, at 10:00 AM EST".
-   **And:** The email contains a valid `.ics` file attachment.
-   **And:** The `.ics` file, when opened, creates a calendar event titled "Mentorship Session with Laura".
-   **And:** The calendar event's start time is correctly set to November 15, 2025, at 10:00 AM EST.

### Scenario 3: Negative Scenario - Email Service Fails Temporarily

**Type:** Negative
**Priority:** High
**Source:** Identified during quality analysis (Gap 1)

-   **Given:** A session has been confirmed.
-   **And:** The external email service is temporarily unavailable and returns a `503 Service Unavailable` error.
-   **When:** The system attempts to send the confirmation email.
-   **Then:** The system logs the initial failure.
-   **And:** The system retries sending the email after 1 minute.
-   **And:** If the second attempt fails, it retries again after 5 minutes.
-   **And:** If the third attempt fails, it retries a final time after 15 minutes.
-   **And:** The `bookings.confirmation_sent_at` field remains `NULL` until an email is successfully sent.
-   **And:** After 3 failed retries, the system logs a critical error for administrative review and stops retrying for this booking.

### Scenario 4: Edge Case - Booking Across Daylight Saving Time Change

**Type:** Boundary
**Priority:** High
**Source:** Identified during quality analysis (Edge Case 3)

-   **Given:** A mentee in "America/Los_Angeles" books a session for November 5, 2025, at 10:00 AM PST.
-   **And:** The Daylight Saving Time change (fallback) occurs on November 3, 2025.
-   **When:** The system generates the confirmation email and `.ics` file.
-   **Then:** The `.ics` file contains the correct VTIMEZONE information to account for the DST change.
-   **And:** The calendar event created from the `.ics` file shows the correct local time for the user, regardless of the DST shift.
-   **And:** The time displayed in the email body is the correct, post-DST-change local time.

---
## 🧪 FASE 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 35 (Aligned with Epic's Feature Test Plan)

**Breakdown:**

*   **Positive:** 12 test cases
*   **Negative:** 12 test cases
*   **Boundary:** 6 test cases
*   **Integration:** 5 test cases

**Rationale for This Number:**
The number is justified by the high number of dependencies and risks.
*   **Email Content/Format (5+ cases):** Validating the content, headers, and attachment for both mentor and mentee.
*   **Calendar Invite (`.ics`) Validation (10+ cases):** This is the most complex part. Testing the `.ics` file's structure (RFC 5545), content, and compatibility across major clients (Gmail, Outlook, Apple Calendar) for various timezones and DST scenarios.
*   **Email Delivery Failure (5+ cases):** Testing the complete retry logic and logging for email service failures.
*   **Timezones & DST (5+ cases):** Covering various timezone combinations and DST edge cases identified as a critical risk.
*   **Integration Points (5+ cases):** Validating the trigger from payment, interaction with the user database, and calls to the email service.

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** Timezone Combinations
*   **Base Scenario:** A mentee books a session with a mentor.
*   **Parameters to Vary:** `mentor_timezone`, `mentee_timezone`, `session_utc_time`
*   **Test Data Sets:**
| Mentor Timezone | Mentee Timezone | Expected Mentor Local Time | Expected Mentee Local Time |
| :--- | :--- | :--- | :--- |
| America/New\_York (EST) | America/Los\_Angeles (PST) | 10:00 AM | 7:00 AM |
| Europe/London (GMT) | Asia/Tokyo (JST) | 9:00 AM | 6:00 PM |
| Australia/Sydney (AEST) | Europe/Paris (CEST) | 6:00 PM | 10:00 AM |
| America/Phoenix (No DST) | America/Denver (DST) | 10:00 AM | 11:00 AM |
*   **Benefit:** Efficiently covers dozens of timezone scenarios to mitigate the highest risk of the epic (Timezone Conversion Errors).

**Parametrized Test Group 2:** Email Client Compatibility
*   **Base Scenario:** An `.ics` file is generated for a confirmed session.
*   **Parameters to Vary:** `calendar_client`
*   **Test Data Sets:**
| Calendar Client | Expected Result |
| :--- | :--- |
| Google Calendar (Web) | Event created at correct local time, all details present. |
| Microsoft Outlook (Desktop) | Event created at correct local time, all details present. |
| Apple Calendar (macOS/iOS) | Event created at correct local time, all details present. |
*   **Benefit:** Ensures the primary artifact of this story (`.ics` file) works for the vast majority of users, preventing a common point of failure. This is a manual test checklist that can be executed once per release.

### Test Cases

---

#### **TC-001: Mentee receives correct confirmation email and calendar invite in a different timezone**

**Related Scenario:** Scenario 1 (Refined AC)
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** ✅ Yes (Group 1)

**Preconditions:**
*   A mentor "Carlos" exists with email `carlos@mentor.test` and timezone "America/New_York".
*   A mentee "Laura" exists with email `laura@mentee.test` and timezone "America/Los_Angeles".
*   A booking has been created for a session on `2025-11-15T15:00:00Z` (10:00 AM EST / 7:00 AM PST) and its status is 'confirmed'.

**Test Steps:**
1.  Trigger the confirmation notification process for the booking.
2.  Check the test email inbox for `laura@mentee.test`.
3.  Verify that an email has been received from `"Upex My Mentor" <confirmations@upexmymentor.com>`.
4.  Verify the email subject is "Your session with Carlos is confirmed!".
5.  Verify the email body contains the text "November 15, 2025, at 7:00 AM PST".
6.  Download the attached `session.ics` file.
7.  Import the `.ics` file into a calendar application (e.g., Google Calendar).

**Expected Result:**
*   **Email:** The email is received within 2 minutes of the trigger. All content is correct as per the verification steps.
*   **Calendar Invite:** The imported event in the calendar application displays:
    *   **Title:** "Mentorship Session with Carlos"
    *   **Date & Time:** November 15, 2025, 7:00 AM - 8:00 AM (PST)
    *   **Attendees:** `laura@mentee.test`, `carlos@mentor.test`
    *   **Description:** Contains the link to the video call.
*   **Database:** The `bookings` table row for the session has a non-null `confirmation_sent_at` timestamp.

---

#### **TC-002: Mentor receives correct confirmation email and calendar invite**

**Related Scenario:** Scenario 2 (Refined AC)
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**
*   Same as TC-001.

**Test Steps:**
1.  Trigger the confirmation notification process for the booking.
2.  Check the test email inbox for `carlos@mentor.test`.
3.  Verify the email subject is "Your session with Laura is confirmed!".
4.  Verify the email body contains the text "November 15, 2025, at 10:00 AM EST".
5.  Download and import the attached `session.ics` file.

**Expected Result:**
*   **Email:** The email is received and its content is correct.
*   **Calendar Invite:** The imported event displays correctly for the mentor's timezone: "November 15, 2025, 10:00 AM - 11:00 AM (EST)".
*   **Database:** `confirmation_sent_at` is updated (verified in TC-001).

---

#### **TC-003: System retries sending email upon temporary service failure**

**Related Scenario:** Scenario 3 (Refined AC)
**Type:** Negative
**Priority:** High
**Test Level:** Integration

**Preconditions:**
*   A confirmed booking exists.
*   The email service is mocked to return a `503 Service Unavailable` error for the first 2 calls, and a `200 OK` on the 3rd call.

**Test Steps:**
1.  Trigger the confirmation notification process.
2.  Monitor the system logs or a mock of the email service API.
3.  Verify that the first attempt to send the email is made immediately and fails.
4.  Verify that the system waits for approximately 1 minute and makes a second attempt, which also fails.
5.  Verify that the system waits for approximately 5 minutes and makes a third attempt.
6.  Verify the third attempt is successful.
7.  Check the mentee's and mentor's inboxes.

**Expected Result:**
*   **System Behavior:** Three calls are made to the email service API according to the retry schedule (0min, 1min, 5min).
*   **Database:** The `bookings.confirmation_sent_at` timestamp is only set after the third, successful attempt.
*   **Email:** The confirmation emails are eventually received by both users.

---

#### **TC-004: System stops retrying after 3 failures**

**Related Scenario:** Scenario 3 (Refined AC)
**Type:** Negative
**Priority:** High
**Test Level:** Integration

**Preconditions:**
*   A confirmed booking exists.
*   The email service is mocked to consistently return a `503 Service Unavailable` error.

**Test Steps:**
1.  Trigger the confirmation notification process.
2.  Monitor the system logs for 20 minutes.

**Expected Result:**
*   **System Behavior:** The system attempts to send the email a total of 4 times (1 initial + 3 retries) at intervals of ~0min, 1min, 5min, 15min.
*   After the final attempt, a critical error is logged (e.g., "Failed to send confirmation for booking ID [booking-id] after 3 retries.").
*   No further attempts are made for this booking.
*   **Database:** The `bookings.confirmation_sent_at` field remains `NULL`.

---

#### **TC-005: `.ics` file is valid across DST boundary**

**Related Scenario:** Scenario 4 (Refined AC)
**Type:** Boundary
**Priority:** High
**Test Level:** Unit

**Preconditions:**
*   A function/service exists to generate `.ics` files.

**Test Steps:**
1.  Call the function to generate an `.ics` file for a session scheduled on `2025-11-05T18:00:00Z` (10:00 AM PST, after the DST change on Nov 3).
2.  The user's timezone is "America/Los_Angeles".
3.  Inspect the content of the generated `.ics` file.

**Expected Result:**
*   The `.ics` file is a valid text file conforming to RFC 5545.
*   It contains a `VTIMEZONE` component for "America/Los_Angeles" that correctly defines both the `STANDARD` (PST) and `DAYLIGHT` (PDT) rules.
*   The `DTSTART` and `DTEND` properties include the `TZID` parameter (e.g., `DTSTART;TZID=America/Los_Angeles:20251105T100000`).
*   When imported into a calendar, the event is correctly placed at 10:00 AM PST.

---
### 🔗 Integration Test Cases (If Applicable)

---

#### **INT-TC-001: Payment webhook successfully triggers confirmation email**

**Integration Point:** Payment Service (e.g., Stripe) → Backend → Notification Service
**Type:** Integration
**Priority:** Critical

**Preconditions:**
*   A `bookings` record exists with `status = 'draft'`.
*   A mock payment webhook endpoint is set up.

**Test Flow:**
1.  Send a mock webhook payload to the backend endpoint, simulating a successful payment for the booking ID.
2.  The backend should process the webhook, update the `bookings.status` to `'confirmed'`.
3.  Verify that the Notification Service is called with the correct booking details (mentor email, mentee email, session time).
4.  Verify that the email service API is called to send emails to both participants.

**Expected Result:**
*   The booking status is updated to `'confirmed'` in the database.
*   The Notification Service is invoked.
*   The `confirmation_sent_at` timestamp is updated.
*   Emails are dispatched (as verified in E2E tests).

---

#### **INT-TC-002: Backend correctly fetches user details to populate email**

**Integration Point:** Notification Service ↔ User Database
**Type:** Integration
**Priority:** High

**Preconditions:**
*   A confirmed booking exists for mentor "Carlos" and mentee "Laura".
*   The `users` table contains the full names and correct email addresses for both.

**Test Flow:**
1.  Trigger the confirmation notification process for the booking.
2.  The Notification Service receives the trigger with the `booking_id`.
3.  The service queries the `bookings` table to get `mentor_id` and `mentee_id`.
4.  The service then queries the `users` table to get the names and emails for both IDs.
5.  The service uses this retrieved data to populate the email templates.

**Expected Result:**
*   The emails sent contain the correct names (e.g., "session with Carlos", "Hi Laura").
*   The emails are sent to the correct email addresses stored in the `users` table.

---

### 📊 Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Test Case | Priority |
| :--- | :--- | :--- | :--- | :--- |
| Payment succeeds, but user closes browser | ❌ No | ✅ Yes (implicitly) | TC-001 | High |
| User email is invalid / bounces | ❌ No | ❌ No | *New Negative TC needed* | Medium |
| Session booked across DST boundary | ❌ No | ✅ Yes (Scenario 4) | TC-005 | High |
| `.ics` file opened in an old/unsupported client | ❌ No | ❌ No | *Manual exploratory test* | Low |
| Email service marks email as spam | ❌ No | ❌ No | *Monitoring/Observability* | Medium |

---

### 🗂️ Test Data Summary

### Data Categories

| Data Type | Count | Purpose | Examples |
| :--- | :--- | :--- | :--- |
| Valid User Data | 4+ | Positive tests, timezone tests | `carlos@mentor.test` (EST), `laura@mentee.test` (PST), `sofia@mentee.test` (UTC-3), `kenji@mentor.test` (JST) |
| Invalid Email Data | 2+ | Negative tests for bounce handling | `invalid-email.test`, `full-inbox@mentee.test` (mocked) |
| Boundary Dates | 4+ | DST and lead-time boundary tests | `2025-03-09` (Spring Forward), `2025-11-02` (Fall Back), `NOW() + 2 hours`, `NOW() + 90 days` |
| Edge Case Data | 2+ | Race conditions, specific failures | Mock data for concurrent webhook triggers, specific 503 error responses from email service. |

### Data Generation Strategy

**Static Test Data:**
*   A core set of 4-6 user accounts (2-3 mentors, 2-3 mentees) with fixed names, emails, and diverse timezones will be created in the staging database to ensure consistency for manual and E2E tests.

**Dynamic Test Data (using Faker.js):**
*   For automated integration and unit tests, user data will be generated on the fly to ensure tests are isolated and independent.
    *   User data: `faker.internet.email()`, `faker.person.fullName()`
    *   Booking times: `faker.date.future()`

**Test Data Cleanup:**
*   ✅ All dynamically generated data will be created within a database transaction that is rolled back at the end of each test.
*   ✅ The static user accounts in the staging database will be reset to a clean state before each full test suite run.
