# Test Cases: STORY-MYM-31 - Cancel Session

**Date:** 2025-11-20
**QA Engineer:** Gemini AI
**Story Jira Key:** MYM-31
**Epic:** EPIC-MYM-28 - Session Management
**Status:** Approved

---

## 📋 PHASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
*   **Primary:** Laura, the Junior Developer - She needs the flexibility to cancel a session if a work problem is resolved or her priorities change.
*   **Secondary:** Carlos, the Senior Architect - He needs his time to be respected, so the 24-hour cancellation policy protects his schedule.

**Business Value:**
*   **Value Proposition:** It provides **Flexibility and Choice** to the student, reducing anxiety when booking. It brings **Trust** to the mentor, ensuring last-minute cancellations do not affect their income.
*   **Business Impact:** Improves booking conversion rates by reducing friction. Increases mentor retention by protecting their time. Reduces the support workload for manually managing cancellations.

**Related User Journey:**
*   **Journey:** Student Registration and First Session Booking
*   **Step:** Post-booking. This is an event that can occur between "Step 6 (Payment completed)" and "Step 7 (Join the video call)".

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**
*   **Components:** `SessionDashboard`, `UpcomingSessionsTab`, `SessionCard`, `CancelSessionModal`.
*   **Pages/Routes:** `/dashboard/sessions`
*   **State Management:** Authentication context for `userId`, local state to manage the modal UI and the session list.

**Backend:**
*   **API Endpoints:** `POST /api/bookings/{bookingId}/cancel` (new), `GET /api/bookings` (to refresh the view).
*   **Services:** `BookingService` (cancellation logic), `PaymentService` (to initiate refund via Stripe), `NotificationService` (for emails).
*   **Database:** `BOOKINGS` table (update `status`, `cancelled_at`, `cancelled_by`), `TRANSACTIONS` table (log refund).

**External Services:**
*   **Stripe:** To process the refund.
*   **Email Service (Resend/SendGrid):** To send cancellation notifications.

**Integration Points:**
*   **Backend <> Stripe:** Call to the Stripe API to create a `refund`.
*   **Backend <> Email Service:** API call to send two emails (mentor and mentee).
*   **Backend <> DB:** Transaction to update the booking status and log the refund.

---

### Story Complexity Analysis

**Overall Complexity:** High

**Complexity Factors:**
*   **Business logic complexity:** High - The 24-hour rule must be precise and handle timezones correctly.
*   **Integration complexity:** High - Involves 3 external systems (Stripe, Email, DB) where transactional consistency is critical.
*   **Data validation complexity:** Medium - The session status and user permissions must be validated before any action.

**Estimated Test Effort:** High
**Rationale:** The combination of a critical business rule (24h), a financial transaction (refund), and multiple external integrations requires a robust test suite covering success, failure, and edge case scenarios.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**
*   **Risk 1:** Timezone Handling.
    *   **Relevance to This Story:** **Maximum**. This risk is at the core of MYM-31's business logic. An error here means the 24h rule can fail for users in different timezones.
*   **Risk 2:** Refund Failures (Stripe).
    *   **Relevance to This Story:** **Maximum**. This is the main technical failure point of the story. If the cancellation succeeds but the refund fails, it creates a financial and trust issue.

**Integration Points from Epic Analysis:**
*   **Integration Point 1:** Backend ↔ Stripe
    *   **Applies to This Story:** ✅ Yes
    *   **If Yes:** This story implements the **refund** flow through this integration point.
*   **Integration Point 2:** Backend ↔ Email Service
    *   **Applies to This Story:** ✅ Yes
    *   **If Yes:** This story uses this point to notify both parties about the cancellation.

**Critical Questions Already Asked at Epic Level:**
*   **Question:** Refund logic in case of failure.
    *   **Status:** ✅ Answered
    *   **Answer:** It has been decided to implement **Option B (Intermediate State with Manual Intervention)**. If the automatic refund fails, the session will move to the `pending_manual_refund` state and an administrator will be alerted.
    *   **Impact on This Story:** **Critical**. This decision defines a new "sad path" that must be designed and tested.

**Summary: How This Story Fits in Epic:**
*   **Story Role in Epic:** This story implements the "flexibility" feature of the epic, one of the key value propositions. It is the user's main interaction with a booking after it has been paid.
*   **Inherited Risks:** It directly inherits the risks of **Timezones** and **Refund Failure**.
*   **Unique Considerations:** Unlike other stories in the epic, this one involves a **reversible financial transaction**, which increases its criticality.

---

## 🚨 PHASE 2: Story Quality Analysis

### Ambiguities Identified
✅ Story is clear and well-defined. The previous analysis in comments has clarified most points.

---

### Missing Information / Gaps
✅ Story has complete information for testing, especially after incorporating the decisions from the epic's Feature Test Plan.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Concurrency
*   **Scenario:** What happens if the user double-clicks the "Cancel" button, sending two simultaneous requests?
*   **Expected Behavior:** The system must be idempotent. Only the first request should be processed. The second should fail with an error like "The session has already been cancelled."
*   **Criticality:** High
*   **Action Required:** Add to test cases.

**Edge Case 2:** Cancellation of an unpaid session
*   **Scenario:** What happens if a user tries to cancel a session that is in a `provisional` or `pending_payment` state?
*   **Expected Behavior:** The cancellation must fail. Only `confirmed` sessions can be cancelled.
*   **Criticality:** Medium
*   **Action Required:** Add to test cases.

---

### Testability Validation
✅ Yes. The acceptance criteria are specific and verifiable. The addition of the "Stripe refund failure" scenario makes the story fully testable.

---

## ✅ PHASE 3: Refined Acceptance Criteria

### Scenario 1: Successful Cancellation (> 24 hours)
**Type:** Positive, **Priority:** Critical
*   **Given:** An authenticated mentee has a 'confirmed' session scheduled more than 24 hours from now.
*   **When:** The mentee clicks "Cancel" and confirms in the modal.
*   **Then:** The backend validates the 24-hour rule successfully.
*   **And:** The session status in the DB is updated to 'cancelled'.
*   **And:** The Stripe API is called to issue a full refund.
*   **And:** A 'refund' transaction is logged in the `TRANSACTIONS` table.
*   **And:** An email is sent to the mentee confirming the cancellation and refund.
*   **And:** An email is sent to the mentor notifying them of the cancellation.
*   **And:** The mentor's calendar slot is freed up.
*   **And:** The UI shows the session in the "Past" tab with a 'cancelled' status.

### Scenario 2: Attempted Cancellation (≤ 24 hours)
**Type:** Negative, **Priority:** High
*   **Given:** An authenticated mentee has a 'confirmed' session scheduled 23 hours from now.
*   **When:** The mentee views their dashboard.
*   **Then:** The "Cancel" button for that session is disabled or hidden.
*   **And:** If the user attempts to call the API directly (`POST /api/bookings/{id}/cancel`), the API returns a `400 Bad Request` with error code `CANCELLATION_WINDOW_CLOSED`.
*   **And:** No changes are made to the database, no refund is issued, and no emails are sent.

### Scenario 3: Cancellation with Stripe Refund Failure
**Type:** Negative (Error Handling), **Priority:** Critical
*   **Given:** A mentee successfully initiates a valid cancellation (>24h).
*   **And:** The Stripe API integration is mocked to return a failure.
*   **When:** The backend attempts to process the refund.
*   **Then:** The system logs the Stripe API error.
*   **And:** The session status is updated to `pending_manual_refund`.
*   **And:** An alert is sent to an administrator.
*   **And:** The mentee receives a notification that the session is cancelled but the refund requires manual processing.
*   **And:** The API returns a `500` or `424` error to the client.
*   **And:** The UI displays an error message asking the user to contact support.

### Scenario 4: Idempotency Check
**Type:** Negative (Edge Case), **Priority:** High
*   **Given:** A session has already been successfully cancelled.
*   **When:** A second request to cancel the same session is sent to the API.
*   **Then:** The API returns a `400 Bad Request` with error code `SESSION_ALREADY_CANCELLED`.
*   **And:** No duplicate refund is issued.

---

## 🧪 PHASE 4: Test Design

### Test Cases

#### **TC-001: Successful Cancellation (>24h)**
*   **Type:** Positive, **Priority:** Critical, **Test Level:** E2E
*   **Steps:**
    1.  A mentee books and pays for a session 48 hours in the future.
    2.  Verify the session appears in "Upcoming" with status 'confirmed'.
    3.  The mentee clicks "Cancel" and confirms.
*   **Expected Result:**
    *   **UI:** Session moves to "Past" tab with 'cancelled' status. Success message is shown.
    *   **API:** `POST /cancel` returns 200 OK.
    *   **DB:** `bookings.status` is 'cancelled'. `transactions` table has a 'refund' entry.
    *   **External:** Stripe refund is initiated. Mentee and mentor receive correct emails.

#### **TC-002: Denied Cancellation (<24h)**
*   **Type:** Negative, **Priority:** High, **Test Level:** E2E
*   **Steps:**
    1.  A mentee has a session scheduled 12 hours from now.
    2.  The mentee navigates to the dashboard.
*   **Expected Result:**
    *   **UI:** The "Cancel" button is disabled or hidden. A tooltip explains why.

#### **TC-003: API Bypass Attempt (<24h)**
*   **Type:** Negative (Security), **Priority:** High, **Test Level:** API
*   **Steps:**
    1.  A mentee has a session scheduled 12 hours from now.
    2.  Using an API client, send a `POST` request to `/api/bookings/{id}/cancel`.
*   **Expected Result:**
    *   **API:** Returns `400 Bad Request` with code `CANCELLATION_WINDOW_CLOSED`.
    *   **DB:** `bookings.status` remains 'confirmed'.

#### **TC-004: Boundary Check (Just Over 24h)**
*   **Type:** Boundary, **Priority:** High, **Test Level:** API
*   **Steps:**
    1.  Create a session exactly 24 hours and 1 minute in the future.
    2.  Immediately send a `POST` request to `/api/bookings/{id}/cancel`.
*   **Expected Result:**
    *   **API:** Returns `200 OK`. Cancellation is successful.

#### **TC-005: Boundary Check (Just Under 24h)**
*   **Type:** Boundary, **Priority:** High, **Test Level:** API
*   **Steps:**
    1.  Create a session exactly 23 hours and 59 minutes in the future.
    2.  Immediately send a `POST` request to `/api/bookings/{id}/cancel`.
*   **Expected Result:**
    *   **API:** Returns `400 Bad Request`. Cancellation is denied.

#### **TC-006: Stripe Refund Failure Handling**
*   **Type:** Negative (Error Handling), **Priority:** Critical, **Test Level:** Integration
*   **Steps:**
    1.  Mock the Stripe API to return a `500` error on refund requests.
    2.  Initiate a valid cancellation (>24h).
*   **Expected Result:**
    *   **API:** Returns `500` or `424` error.
    *   **DB:** `bookings.status` is `pending_manual_refund`.
    *   **External:** Admin alert is triggered. Mentee receives a "manual refund" notification.

#### **TC-007: Idempotency Test**
*   **Type:** Negative (Edge Case), **Priority:** High, **Test Level:** API
*   **Steps:**
    1.  Successfully cancel a session.
    2.  Immediately send a second `POST` request to `/api/bookings/{id}/cancel` for the same session.
*   **Expected Result:**
    *   **API:** The second request returns `400 Bad Request` with code `SESSION_ALREADY_CANCELLED`.
    *   **External:** Only one refund is ever processed in Stripe.

---

## 📢 Action Required

**@[Product Owner]:**
*   [ ] Please review and approve the refined acceptance criteria, especially the new scenarios for Stripe failure and idempotency.

**@[Dev Lead]:**
*   [ ] Please validate the technical implementation plan for the `pending_manual_refund` state and the idempotency check.

**@[QA Team]:**
*   [ ] Prepare test data and mocks for the new scenarios.

---

**Jira Link:** https://upexgalaxy61.atlassian.net/browse/MYM-31
**Local Test Cases:** `.context/PBI/epics/EPIC-MYM-28-session-management/stories/STORY-MYM-31-cancel-session/test-cases.md`