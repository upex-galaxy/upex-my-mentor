
# Test Cases: STORY-MYM-30 - Join Video Call

**Fecha:** 2025-11-21
**QA Engineer:** AI-Generated
**Story Jira Key:** MYM-30
**Epic:** EPIC-MYM-28 - Session Management
**Status:** Draft - Pending PO/Dev Review

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Personas Affected:**

- **Primary: Laura (Desarrolladora Junior)** - As a mentee, she needs a frictionless way to join the session she paid for.
- **Primary: Carlos (Arquitecto Senior)** - As a mentor, he needs an easy and reliable way to connect with his mentee at the scheduled time.

**Business Value:**

- **Value Proposition:** This story directly delivers on the promise of connecting mentors and students. It is the final step that makes the core "session" tangible.
- **Business Impact:** A failure here leads to a 100% negative experience for a paid session, resulting in refund requests, loss of user trust, and potential churn for both mentees and mentors. A smooth experience reinforces the platform's value and encourages repeat bookings.
- **KPI Impact:** Directly impacts "Sesiones de Mentoría Completadas" and indirectly affects "Tasa de Retención de Mentores" and GMV.

**Related User Journey:**

- **Journey 1: Registro de Estudiante y Reserva de Primera Sesión**
  - **Step 7:** Laura clicks the link to join the video call. This story implements that exact step.

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- **Components:** `SessionDashboard`, `UpcomingSessionsTab`, `SessionCard`, `JoinCallButton`. The `JoinCallButton` will have conditional rendering logic based on the session's start time.
- **Pages/Routes:** `/dashboard/sessions` is the main page where this functionality will be visible.
- **State Management:** The `AuthContext` will provide the `userId` to fetch the correct bookings. Local state will be needed to handle the current time and determine button visibility.

**Backend:**

- **API Endpoints:**
  - `GET /api/bookings/{bookingId}/videocall-link`: As specified in the epic's technical details, this endpoint should return the video call URL but only if the session is about to start.
  - `POST /api/bookings` (from EPIC-MYM-18): This is where the `video_call_url` is initially generated and stored when a booking is confirmed.
- **Services:** `BookingService` will contain the logic to check for time-based access to the video link.
- **Database:** The `bookings` table will be extended to include `video_call_url` (string, nullable) and `video_call_room_id` (string, nullable) as per the epic's technical considerations.

**External Services:**

- **Video Conferencing Service (Daily.co):** As recommended in `EPIC-MYM-28-epic.md`, the platform integrates with Daily.co to create private, temporary video rooms.

**Integration Points:**

- **Frontend ↔ Backend API:** The "Join Call" button click will trigger a request to `GET /api/bookings/{bookingId}/videocall-link`.
- **Backend ↔ Daily.co API:** When a booking is confirmed, the backend needs to call the Daily.co API to create a room and store its URL.
- **Backend ↔ Database:** The `videocall-link` API will query the `bookings` table for the URL and session time.

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- **Business logic complexity:** Medium - The time-based logic (15 mins before, expires 1h after) and handling of different timezones are critical and prone to off-by-one errors.
- **Integration complexity:** Medium - Involves a critical real-time integration with an external service (Daily.co). Failures in the external API must be handled gracefully.
- **Data validation complexity:** Low - Primarily involves validating time windows and user permissions.
- **UI complexity:** Low - It's mostly a button with conditional visibility.

**Estimated Test Effort:** Medium - Requires careful setup of test data with specific session times and validation across different timezones.

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- **Risk 1: Manejo incorrecto de Zonas Horarias:** Directly relevant. If the 15-minute window calculation doesn't correctly handle UTC vs. local time, the "Join Call" button will appear at the wrong time for the user.
- **Risk 2: Falla en la Integración con la API de Reembolsos (Stripe):** Not directly relevant to this story, but related to the overall session lifecycle.

**Integration Points from Epic Analysis:**

- **Backend ↔ Servicio de Video:** This story is the primary implementation of this integration point.
- **Frontend ↔ Backend API:** The frontend will consume the new `videocall-link` endpoint.

**Critical Questions Already Asked at Epic Level:**

- **Question 2 (MYM-30): Acceso anticipado al enlace de la videollamada:** "La historia indica que el botón 'Join Call' se activa 15 minutos antes. ¿Qué sucede si un usuario tiene el enlace de alguna otra manera y trata de unirse antes?" - This is a key question I will design tests for. The API should be the gatekeeper.

**Test Strategy from Epic:**

- The epic's test plan mentions E2E tests for a user joining a video call and integration tests for the video service. My test cases will cover these requirements.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Video Link Security**

- **Location in Story:** Technical Notes mention a "pre-generated Google Meet or similar video call link."
- **Question for PO/Dev:** How secure is this link? Can anyone with the link join? The epic `MYM-28` mentions `privacy: 'private'` for Daily.co rooms. Does this mean only authenticated participants can join?
- **Impact on Testing:** Security testing scope changes. I need to test if a non-participant can access the call.
- **Suggested Clarification:** The `GET /api/bookings/{bookingId}/videocall-link` endpoint must validate that the requesting user is either the mentor or the mentee for that booking.

**Ambiguity 2: Button State After Session Start**

- **Location in Story:** Acceptance criteria.
- **Question for PO:** What happens to the "Join Call" button *during* the session and *after* it ends?
- **Impact on Testing:** The full lifecycle of the button's state is unclear.
- **Suggested Clarification:**
  - The button should remain active for the duration of the session.
  - After the session duration + 1 hour (as per epic spec for link expiration), the button should become disabled or be replaced with a "Session Ended" message.

### Missing Information / Gaps

**Gap 1: Error Handling for Link Generation Failure**

- **Why It's Critical:** The external API call to Daily.co could fail. If it does, the `video_call_url` in the database will be NULL. The user will be unable to join their paid session.
- **Suggested Addition:** Add a scenario for what the UI shows if the `video_call_url` is missing. It should display a clear error message and a link to contact support immediately. The backend should also have a retry mechanism for room creation.
- **Impact if Not Added:** A critical failure path is untested, leading to a terrible user experience with no recourse.

**Gap 2: Exact Wording for "Near the time"**

- **Why It's Critical:** The story AC is vague ("near the time"). The epic and technical notes are better ("10-15 minutes").
- **Suggested Addition:** The acceptance criteria must be updated to use a precise timeframe. Based on the epic, we will use **15 minutes**.
- **Impact if Not Added:** Test cases would be based on an assumption.

### Edge Cases NOT Covered in Original Story

**Edge Case 1: User's Clock is Incorrect**

- **Scenario:** The user's local system clock is 20 minutes fast. The button visibility is calculated on the client-side based on the local clock.
- **Expected Behavior:** The "Join Call" button appears 20 minutes early for the user. When they click it, the backend API should reject the request with a "Too early to join" error, as the server time is the source of truth.
- **Criticality:** Medium.

**Edge Case 2: Session Spanning a Daylight Saving Time Change**

- **Scenario:** A session is scheduled for 1:30 AM on a date when DST causes clocks to spring forward from 2:00 AM to 3:00 AM.
- **Expected Behavior:** All time calculations must be based on UTC timestamps to avoid errors. The 15-minute window should be calculated correctly regardless of local time shifts.
- **Criticality:** Low (but high impact if it occurs).

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: User joins a video call successfully (Happy Path)

- **Given:** A user is logged in and has an upcoming session scheduled for 3:00 PM UTC.
- **And:** The current time is 2:46 PM UTC (14 minutes before the session).
- **When:** The user navigates to their session dashboard.
- **Then:** The "Join Call" button for that session is visible and enabled.
- **And When:** The user clicks the "Join Call" button.
- **Then:** A new browser tab opens with the correct, pre-generated Daily.co URL for that session.
- **And:** The API `GET /api/bookings/{id}/video-link` returns a 200 OK status with the URL.

### Scenario 2: User attempts to join a video call too early

- **Given:** A user is logged in and has an upcoming session scheduled for 3:00 PM UTC.
- **And:** The current time is 2:44 PM UTC (16 minutes before the session).
- **When:** The user navigates to their session dashboard.
- **Then:** The "Join Call" button for that session is either not visible or is disabled.
- **And When:** The user attempts to access the video link directly via the API (`GET /api/bookings/{id}/video-link`).
- **Then:** The API returns a `403 Forbidden` error with the message "It is too early to join the session."

### Scenario 3: User attempts to join an expired session

- **Given:** A user is logged in and had a session scheduled from 3:00 PM to 4:00 PM UTC.
- **And:** The `video_call_url` link is set to expire at 5:00 PM UTC (1 hour after session end).
- **And:** The current time is 5:01 PM UTC.
- **When:** The user navigates to their session dashboard (in the "Past Sessions" tab).
- **Then:** The "Join Call" button is replaced with a "Session Ended" status.
- **And When:** The user attempts to access the video link directly via the API.
- **Then:** The API returns a `410 Gone` error with the message "This session link has expired."

### Scenario 4: Non-participant attempts to access the video call link

- **Given:** A session exists between "Mentor A" and "Mentee B".
- **And:** "User C" (who is not a participant) is logged in.
- **When:** "User C" attempts to access the video link via the API (`GET /api/bookings/{id}/video-link`).
- **Then:** The API returns a `403 Forbidden` error with the message "You are not authorized to access this session."

### Scenario 5: Video link generation failed

- **Given:** A user has a confirmed booking, but the external call to Daily.co failed, so `video_call_url` is NULL in the database.
- **And:** The session is 10 minutes away.
- **When:** The user navigates to their session dashboard.
- **Then:** The "Join Call" button is replaced with an error message: "Error generating video link. Please contact support."
- **And:** A "Contact Support" button is visible.

---

## 🧪 FASE 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 12

**Breakdown:**

- Positive: 3
- Negative: 6
- Boundary: 3

**Rationale:** The core logic is simple (time-based visibility), but the edge cases around timezones, permissions, and external service failures are critical to test thoroughly for a reliable user experience.

### Individual Test Cases

#### **TC-001: Join button is visible within the 15-minute window**

- **Type:** Positive, **Priority:** Critical, **Test Level:** E2E
- **Preconditions:** A booking exists for the logged-in user, scheduled to start in 10 minutes. `video_call_url` is populated.
- **Steps:**
    1. Log in as the user.
    2. Navigate to the `/dashboard/sessions` page.
    3. Find the upcoming session card.
- **Expected Result:** The "Join Call" button is visible and enabled.

#### **TC-002: Join button opens correct video link**

- **Type:** Positive, **Priority:** Critical, **Test Level:** E2E
- **Preconditions:** Same as TC-001. The booking record has `video_call_url` = '<https://mock.daily.co/test-room>'.
- **Steps:**
    1. Follow steps 1-3 from TC-001.
    2. Click the "Join Call" button.
- **Expected Result:** A new browser tab opens, and its URL is '<https://mock.daily.co/test-room>'. The original dashboard tab remains open.

#### **TC-003: Join button is hidden or disabled before the 15-minute window**

- **Type:** Negative, **Priority:** High, **Test Level:** E2E
- **Preconditions:** A booking exists for the logged-in user, scheduled to start in 20 minutes.
- **Steps:**
    1. Log in as the user.
    2. Navigate to the `/dashboard/sessions` page.
    3. Find the upcoming session card.
- **Expected Result:** The "Join Call" button is either not present or is present but in a disabled state with a tooltip saying "Available 15 minutes before the session".

#### **TC-004: Join button is not available after the session has expired**

- **Type:** Negative, **Priority:** High, **Test Level:** E2E
- **Preconditions:** A booking exists for the logged-in user that ended 2 hours ago.
- **Steps:**
    1. Log in as the user.
    2. Navigate to the `/dashboard/sessions` page and view the "Past" sessions tab.
    3. Find the completed session card.
- **Expected Result:** The card shows a "Session Ended" or "Completed" status. There is no "Join Call" button.

#### **TC-005: API rejects request to get link before the 15-minute window**

- **Type:** Negative (API), **Priority:** High, **Test Level:** API
- **Preconditions:** A booking `B1` exists for the authenticated user, scheduled to start in 20 minutes.
- **Steps:**
    1. Make a `GET` request to `/api/bookings/B1/video-link` with the user's auth token.
- **Expected Result:** API returns a `403 Forbidden` status with error code `TOO_EARLY_TO_JOIN`.

#### **TC-006: API rejects request to get link after expiration**

- **Type:** Negative (API), **Priority:** High, **Test Level:** API
- **Preconditions:** A booking `B1` existed for the authenticated user, which ended 2 hours ago.
- **Steps:**
    1. Make a `GET` request to `/api/bookings/B1/video-link` with the user's auth token.
- **Expected Result:** API returns a `410 Gone` status with error code `SESSION_LINK_EXPIRED`.

#### **TC-007: API rejects request from a non-participant**

- **Type:** Negative (Security), **Priority:** Critical, **Test Level:** API
- **Preconditions:** A booking `B1` exists between User A and User B. User C is authenticated.
- **Steps:**
    1. Make a `GET` request to `/api/bookings/B1/video-link` using User C's auth token.
- **Expected Result:** API returns a `403 Forbidden` status with error code `NOT_A_PARTICIPANT`.

#### **TC-008: UI handles missing video link gracefully**

- **Type:** Negative (Error Handling), **Priority:** High, **Test Level:** E2E
- **Preconditions:** A booking exists for the user, starting in 5 minutes, but its `video_call_url` is NULL in the database.
- **Steps:**
    1. Log in as the user.
    2. Navigate to the session dashboard.
- **Expected Result:** The session card displays an error message like "Could not generate session link. Please contact support." and a "Contact Support" button.

#### **TC-009: Join button visibility with client/server time difference (Boundary)**

- **Type:** Boundary, **Priority:** Medium, **Test Level:** E2E
- **Preconditions:** A booking starts at 3:00 PM UTC. Server time is 2:50 PM UTC. User's local machine time is set to 3:05 PM UTC (15 mins fast).
- **Steps:**
    1. Log in as the user.
    2. Navigate to the session dashboard. The button might appear visible due to client-side logic.
    3. Click the "Join Call" button.
- **Expected Result:** The backend API, which uses server time, rejects the request with a `403 Forbidden (TOO_EARLY_TO_JOIN)` error. The UI displays an error message like "It's not time to join yet."

#### **TC-010: Join button at exact 15-minute boundary**

- **Type:** Boundary, **Priority:** Medium, **Test Level:** E2E
- **Preconditions:** A booking starts at 3:00 PM UTC. The current server time is exactly 2:45:00 PM UTC.
- **Steps:**
    1. Navigate to the session dashboard.
- **Expected Result:** The "Join Call" button is visible and enabled. Clicking it successfully returns the link.

#### **TC-011: Join button at 14:59 minute boundary**

- **Type:** Boundary, **Priority:** Medium, **Test Level:** E2E
- **Preconditions:** A booking starts at 3:00 PM UTC. The current server time is exactly 2:45:01 PM UTC (14 minutes and 59 seconds before).
- **Steps:**
    1. Navigate to the session dashboard.
- **Expected Result:** The "Join Call" button is visible and enabled (assuming the logic is `time <= 15 mins`).

#### **TC-012: Join button works across timezones**

- **Type:** Positive, **Priority:** High, **Test Level:** E2E
- **Preconditions:** A booking is scheduled for 8:00 PM London time (GMT+1 in summer). The user is in New York (GMT-4). Session time in UTC is 7:00 PM.
- **Steps:**
    1. Set the test browser's timezone to 'America/New_York'.
    2. Wait until the user's local time is 2:45 PM (which is 6:45 PM UTC).
    3. Navigate to the dashboard.
- **Expected Result:** The session is displayed as starting at 3:00 PM for the user. The "Join Call" button is visible and works correctly.

---

## 📝 FASE 5: Jira Integration & Local Mirroring

### FASE 5c: Generate Local test-cases.md

This entire document serves as the content for the local `test-cases.md` file. I will now create it.
