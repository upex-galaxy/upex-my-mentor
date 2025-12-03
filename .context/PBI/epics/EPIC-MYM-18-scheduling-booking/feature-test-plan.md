# Feature Test Plan: EPIC-MYM-18 - Scheduling & Booking

**Fecha:** 2025-01-07
**QA Lead:** AI-Generated (Shift-Left Analysis)
**Epic Jira Key:** MYM-18
**Status:** Draft - Pending Team Review

---

## 📋 Business Context Analysis

### Business Value

This epic enables the **core transaction of the marketplace** - the ability to book mentorship sessions. Without scheduling and booking functionality, the platform cannot generate revenue or deliver its primary value proposition.

**Key Value Proposition:**

- **For Mentees:** Enables easy discovery of mentor availability and seamless booking of sessions with transparent pricing
- **For Mentors:** Provides control over availability, prevents scheduling conflicts, and enables monetization of expertise
- **For Platform:** Activates the revenue engine (GMV generation) and creates the foundation for payment processing (EPIC-005)

**Success Metrics (KPIs):**

From Executive Summary, this epic directly impacts:
- **100 sessions booked in first month post-launch** - Scheduling is the gateway to this metric
- **$5,000 GMV in first month** - Average $50/session × 100 sessions
- **<5% booking abandonment rate** - UX and reliability of booking flow is critical
- **70% of bookings within 7 days** - Indicates urgency and platform stickiness

**User Impact:**

- **Laura (Junior Developer):** Needs to quickly find and book available time slots with mentors who can help with specific React problems. Timezone confusion or booking failures would cause frustration and abandonment.
- **Carlos (Senior Architect):** Requires flexible calendar management to monetize his time without administrative overhead. Double-bookings or missed notifications would damage his reputation and earnings.
- **Sofía (Career Changer):** Needs clarity on when sessions will occur (timezone conversions) and confidence that bookings are confirmed. Email confirmations and calendar invites are critical for trust.

**Critical User Journeys:**

From user-journeys.md:
1. **Booking Journey (Steps 4-6 of Laura's journey):**
   - Laura reviews mentor profile → Views calendar → Selects slot → Proceeds to payment → Receives confirmation email
   - **Pain Points:** Empty calendars, timezone confusion, payment security concerns, missing confirmation emails

2. **Mentor Availability Setup (Steps 4 of Carlos's journey):**
   - Carlos configures calendar availability → System shows slots to students
   - **Pain Points:** Tedious calendar management, slow verification process

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- **Calendar UI Components:**
  - Mentor availability management interface (weekly recurring slots, date blocking)
  - Mentee booking calendar (monthly view, slot selection)
  - Timezone selector and display components
- **Booking Flow Components:**
  - Slot selection modal
  - Booking confirmation page
  - Countdown timer for 15-minute slot reservation
- **Pages/Routes:**
  - `/mentors/[id]/book` - Booking page for specific mentor
  - `/dashboard/calendar` - Mentor calendar management (mentor-only)
  - `/bookings/[id]/confirm` - Booking confirmation page

**Backend:**

- **API Endpoints** (from api-contracts.yaml):
  - `POST /api/bookings` - Create provisional booking (FR-009)
  - `GET /api/mentors/{mentorId}/calendar` - Get mentor availability
  - `PUT /api/mentors/{mentorId}/calendar` - Update mentor availability (FR-010)
  - `PUT /api/bookings/{bookingId}/status` - Accept/reject booking
- **Services:**
  - Booking service (slot validation, conflict detection, reservation management)
  - Notification service (email confirmation, reminders) (FR-011)
  - Timezone conversion service (UTC ↔ user local time)
- **Scheduled Jobs:**
  - Cleanup expired draft bookings (>15 minutes old)
  - Send 24h reminder emails
  - Send 1h reminder emails
  - Auto-transition bookings to 'completed' status

**Database:**

Tables from epic.md:
- **`mentor_availability`** (recurring weekly slots):
  - Columns: id, mentor_id, day_of_week (0-6), start_time, end_time, timezone, is_active
  - Indexes needed: (mentor_id, day_of_week), (is_active)
- **`availability_exceptions`** (blocked dates):
  - Columns: id, mentor_id, blocked_date, reason
  - Indexes needed: (mentor_id, blocked_date)
- **`bookings`** (session reservations):
  - Columns: id, mentor_id, mentee_id, session_datetime (UTC), duration_minutes, status, total_amount, confirmation_sent_at, reminder_24h_sent_at, reminder_1h_sent_at
  - **UNIQUE CONSTRAINT:** (mentor_id, session_datetime) - Prevents double-booking
  - Indexes needed: (mentor_id, status), (mentee_id, status), (session_datetime), (status, created_at)

**Critical Queries:**
- Get available slots for mentor: JOIN mentor_availability + filter exceptions + exclude booked slots
- Check slot availability before booking: SELECT with mentor_id + session_datetime (must hit UNIQUE index)
- Find bookings needing reminders: WHERE status='confirmed' AND reminder_24h_sent_at IS NULL AND session_datetime < NOW() + INTERVAL '24 hours'

**External Services:**

- **Email Service** (Supabase Email or Resend):
  - Confirmation emails (immediate after booking)
  - 24h reminder emails (scheduled job)
  - 1h reminder emails (scheduled job)
  - .ics calendar invite generation
- **Date/Time Libraries:**
  - `date-fns-tz` for timezone conversions
  - `Intl.DateTimeFormat` for user timezone detection

### Integration Points (Critical for Testing)

**Internal Integration Points:**

1. **Frontend ↔ Backend API**
   - Calendar data fetching (availability, booked slots)
   - Booking creation and status updates
   - Timezone information exchange (mentee timezone → backend)

2. **Backend ↔ Supabase Database**
   - Availability CRUD operations
   - Booking transactions (with conflict detection)
   - Real-time slot availability checks

3. **Backend ↔ Supabase Auth**
   - JWT validation for booking operations
   - Role-based access (only mentors can manage calendars)
   - RLS enforcement (users only see their own bookings)

4. **Booking Flow → Payment Flow (EPIC-005)**
   - Draft booking creation
   - 15-minute reservation window
   - Status transition: draft → confirmed (after payment)

**External Integration Points:**

1. **Backend ↔ Email Service**
   - Confirmation email with .ics attachment
   - Reminder emails with session details
   - Cancellation emails (EPIC-006)

2. **Backend ↔ Date/Time Services**
   - Timezone conversion (user local ↔ UTC)
   - .ics calendar invite generation
   - Daylight Saving Time handling

**Data Flow (Booking Creation):**

```
Mentee (Browser)
  → Detects timezone (Intl.DateTimeFormat)
  → Selects slot in local time
  → POST /api/bookings {session_date: UTC, mentee_timezone}
    → Backend validates slot availability
    → Backend checks UNIQUE constraint (mentor_id, session_datetime)
    → Backend creates booking with status='draft', created_at=NOW()
    → Backend returns booking {id, total_cost, expiration_time}
  → Frontend shows 15-minute countdown
  → [User proceeds to payment EPIC-005]
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Timezone Conversion Errors Leading to Wrong Booking Times

- **Impact:** **CRITICAL** - Users book sessions at wrong times, causing no-shows, frustration, and platform reputation damage
- **Likelihood:** **HIGH** - Timezone handling is notoriously complex (DST transitions, IANA database updates, user input errors)
- **Area Affected:** Frontend (timezone detection), Backend (UTC conversion), Database (timestamp storage), Email (display in emails)
- **Mitigation Strategy:**
  - Use well-tested library (`date-fns-tz`) for all timezone operations
  - Store ALL datetimes in UTC (timestamptz in PostgreSQL)
  - Display timezone explicitly to user during booking ("Friday, Nov 15, 10:00 AM EST")
  - Show both mentor and mentee timezones during booking confirmation
  - Add timezone validation: reject bookings if mentee_timezone is invalid
  - E2E tests with multiple timezone scenarios (EST/PST, UTC/GMT+8, DST transitions)
- **Test Coverage Required:**
  - Unit tests: Timezone conversion functions (10+ test cases covering DST transitions, edge cases)
  - Integration tests: Full booking flow with different timezones (mentor NYC, mentee LA)
  - E2E tests: Cross-timezone booking (verify email shows correct local times)
  - Boundary tests: DST transition dates (Mar 10, Nov 3 in 2025)

#### Risk 2: Double-Booking Due to Race Conditions

- **Impact:** **HIGH** - Two mentees book same slot simultaneously, causing one session to be invalid and requiring refund/rebooking
- **Likelihood:** **MEDIUM** - Possible under concurrent load, especially for popular mentors
- **Area Affected:** Backend (booking creation), Database (concurrency control)
- **Mitigation Strategy:**
  - Database UNIQUE constraint on (mentor_id, session_datetime) - **MUST be implemented**
  - Pessimistic locking: SELECT FOR UPDATE when checking slot availability
  - Idempotent booking creation (check if booking already exists before INSERT)
  - Clear error message: "This slot is no longer available. Please select another time."
  - Automated retry on frontend (show alternative slots immediately)
- **Test Coverage Required:**
  - Concurrency tests: Simulate 2+ simultaneous POST /api/bookings for same slot (verify only 1 succeeds)
  - Database constraint tests: Attempt INSERT with duplicate (mentor_id, session_datetime)
  - Load tests: 10+ concurrent booking requests to same mentor
  - Error handling tests: Verify frontend handles 409 Conflict gracefully

#### Risk 3: Email Delivery Failures Cause Missed Sessions

- **Impact:** **HIGH** - Users miss sessions due to no confirmation/reminder, damaging trust and causing no-shows
- **Likelihood:** **MEDIUM** - Email delivery is not 100% reliable (spam filters, service outages, incorrect addresses)
- **Area Affected:** Backend (email sending), Email Service (delivery), Scheduled Jobs (reminders)
- **Mitigation Strategy:**
  - Use reliable email service (Resend or Supabase Email) with high deliverability
  - Implement retry logic (3 attempts with exponential backoff)
  - Log all email attempts (success/failure) in database
  - Track email status: confirmation_sent_at, reminder_24h_sent_at, reminder_1h_sent_at
  - Fallback: Show booking details in-app dashboard (don't rely solely on email)
  - Monitor email bounce rate and delivery metrics
- **Test Coverage Required:**
  - Integration tests: Verify email service API calls (mocked for tests)
  - E2E tests: Verify emails are sent and contain correct data (.ics attachment, links, datetimes)
  - Failure tests: Simulate email service outage (verify retry logic)
  - Template tests: Validate email templates render correctly (HTML/text versions)

#### Risk 4: 15-Minute Slot Reservation Expires During Payment

- **Impact:** **MEDIUM** - User completes payment form but slot expires, causing payment success but no booking (requires refund)
- **Likelihood:** **MEDIUM** - Users may take >15min if interrupted, confused by payment UI, or have slow connections
- **Area Affected:** Backend (booking expiration logic), Payment flow (EPIC-005 integration)
- **Mitigation Strategy:**
  - Clear countdown timer on frontend (shows remaining time)
  - Auto-extend reservation if user has initiated payment (detection via Stripe checkout session)
  - Grace period: 2-minute buffer before hard expiration
  - Scheduled job runs every 5 minutes (not every minute) to reduce load
  - Payment webhook handles edge case: if payment succeeds but booking expired, auto-rebook or refund
- **Test Coverage Required:**
  - Timer tests: Verify countdown displays accurately
  - Expiration tests: Verify bookings with created_at >15min ago are deleted
  - Edge case tests: Payment completes at 14:59 (should succeed), at 15:01 (should handle gracefully)
  - Integration tests: Payment flow preserves reservation

#### Risk 5: Calendar Performance Degrades with Many Bookings

- **Impact:** **MEDIUM** - Slow calendar loads frustrate users and reduce conversion
- **Likelihood:** **LOW** (MVP), **MEDIUM** (at scale) - Popular mentors may have 100+ bookings
- **Area Affected:** Backend (availability query), Frontend (calendar rendering)
- **Mitigation Strategy:**
  - Index on bookings (mentor_id, session_datetime, status)
  - Query optimization: Filter by date range (next 30 days only)
  - Frontend pagination/virtualization for long booking lists
  - Cache mentor availability (invalidate on update)
  - Performance budget: Calendar load <2s (per NFR-003)
- **Test Coverage Required:**
  - Performance tests: Query available slots with 100, 500, 1000 existing bookings
  - Load tests: 50 concurrent users loading same mentor calendar
  - Lighthouse audit: Page load time for mentor profile + calendar

### Business Risks

#### Risk 1: Mentors Don't Set Availability (Empty Calendars)

- **Impact on Business:** **CRITICAL** - No availability = no bookings = no revenue. This blocks the entire marketplace value proposition
- **Impact on Users:** Mentees see "No availability" and abandon platform; Mentors fail to monetize despite completing verification
- **Likelihood:** **HIGH** - Onboarding friction, unclear instructions, or tedious calendar management can cause this
- **Mitigation Strategy:**
  - Onboarding checklist: "Set your availability" as mandatory step before profile goes live
  - Email reminders: "You're verified! Set your availability to start receiving bookings"
  - Block profile visibility in search (EPIC-003) until availability is set (at least 1 slot)
  - Pre-filled template: Suggest "Mon-Fri 9am-5pm" as starting point (editable)
  - In-app notifications: "You haven't set availability in 7 days"
- **Acceptance Criteria Validation:**
  - **AC missing:** "Mentors are prompted to set availability after verification" - ADD to epic
  - **AC missing:** "Mentors with no availability are not visible in search" - ADD to EPIC-003

#### Risk 2: Booking Abandonment (Users Select Slot but Don't Pay)

- **Impact on Business:** **HIGH** - Reduces GMV, blocks slots from other mentees, skews metrics
- **Impact on Users:** Mentees may feel process is too complex; Mentors see "interest" but no bookings
- **Likelihood:** **MEDIUM** - Payment friction, unclear pricing, or security concerns can cause abandonment
- **Mitigation Strategy:**
  - Show total cost BEFORE slot selection (no surprises at payment)
  - Clear value communication: "Pay securely with Stripe" badge
  - Progress indicator: "Step 2 of 3: Payment" (sets expectations)
  - Abandoned booking email: "Complete your booking with Carlos" (24h after draft creation)
  - A/B test: 10min vs 15min reservation window (find optimal balance)
- **Acceptance Criteria Validation:**
  - **Existing AC:** "Selected slot is held for 15 minutes" ✓ Addresses this risk
  - **Suggested AC:** "Users see total cost before slot selection" - ADD to MYM-21

#### Risk 3: Timezone Confusion Reduces User Confidence

- **Impact on Business:** **MEDIUM** - Users hesitate to book due to fear of wrong time, reducing conversion
- **Impact on Users:** Laura may miss session due to timezone misunderstanding; Carlos gets no-shows
- **Likelihood:** **HIGH** - Timezone UX is consistently a pain point in booking systems
- **Mitigation Strategy:**
  - Explicit timezone display: "10:00 AM EST (Your timezone: PST, 7:00 AM)"
  - Confirmation page shows BOTH timezones: "Mentor timezone: EST, Your timezone: PST"
  - Email includes both timezones and UTC time
  - .ics calendar invite uses correct timezone (VTIMEZONE component)
  - FAQ: "How do timezones work?" with examples
- **Acceptance Criteria Validation:**
  - **Existing AC:** "Timezone conversion is accurate and clearly displayed" ✓ Good
  - **Suggested improvement:** Define EXACT format for timezone display (add to MYM-20)

### Integration Risks

#### Integration Risk 1: Frontend ↔ Backend API - Timezone Data Mismatch

- **Integration Point:** Frontend ↔ Backend API (POST /api/bookings)
- **What Could Go Wrong:**
  - Frontend sends session_date in local time instead of UTC → Backend stores wrong time
  - Frontend doesn't send mentee_timezone → Backend can't validate or send correct emails
  - API returns availability in UTC but frontend expects local time → Wrong slots displayed
- **Impact:** **CRITICAL** - Direct cause of wrong booking times
- **Mitigation:**
  - API contract validation: Enforce session_date must be ISO 8601 UTC format ("2025-11-15T15:00:00Z")
  - Required field: mentee_timezone (IANA format: "America/Los_Angeles")
  - Backend validation: Reject if session_date is not in future or timezone is invalid
  - Integration tests: Mock API calls with different timezone scenarios
  - TypeScript types: Enforce Date objects, not strings

#### Integration Risk 2: Backend ↔ Database - Unique Constraint Failure Handling

- **Integration Point:** Backend ↔ Supabase PostgreSQL (INSERT bookings)
- **What Could Go Wrong:**
  - UNIQUE constraint violation (double-booking) not caught → DB error bubbles up as 500 Internal Server Error
  - Error message not user-friendly → Users see "ERROR: duplicate key value violates unique constraint"
  - Frontend doesn't handle 409 Conflict → User sees generic error, not actionable feedback
- **Impact:** **HIGH** - Poor UX, user abandonment, support tickets
- **Mitigation:**
  - Catch PostgreSQL error code 23505 (unique_violation) in backend
  - Map to 409 Conflict with message: "This slot is no longer available. Please select another time."
  - Include alternative slots in error response
  - Frontend displays alternative slots immediately (no page reload)
  - Integration tests: Verify error handling for constraint violations

#### Integration Risk 3: Booking Flow → Payment Flow - Status Transition Failures

- **Integration Point:** Booking (EPIC-004) ↔ Payment (EPIC-005)
- **What Could Go Wrong:**
  - Payment succeeds but booking status not updated to 'confirmed' → Mentee paid but no session
  - Booking expires during payment → Payment succeeds but booking is deleted
  - Payment webhook arrives late (>15min after checkout) → Booking expired, webhook updates non-existent record
- **Impact:** **CRITICAL** - Money lost, user trust destroyed, legal issues
- **Mitigation:**
  - Idempotent webhook handler: Check if booking exists before updating
  - Payment webhook extends reservation (sets status='payment_processing')
  - Database transaction: Update booking status + create payment record atomically
  - Retry mechanism: If webhook fails, retry 3 times
  - Manual reconciliation: Daily job checks for paid-but-not-confirmed bookings
- **Test Coverage Required:**
  - Integration tests: Mock payment success → verify booking status='confirmed'
  - Edge case tests: Payment webhook arrives after booking expired (verify handling)
  - E2E tests: Full flow from booking → payment → confirmation email

#### Integration Risk 4: Backend ↔ Email Service - .ics Calendar Invite Generation

- **Integration Point:** Backend ↔ Email Service (Resend/Supabase)
- **What Could Go Wrong:**
  - .ics file format invalid → Email clients (Gmail, Outlook) don't recognize it as calendar invite
  - .ics timezone info wrong → Calendar adds event at wrong time (double timezone conversion)
  - .ics missing required fields (VTIMEZONE, ORGANIZER) → Email rejected as spam
- **Impact:** **MEDIUM** - Users manually add to calendar (friction) or miss session
- **Mitigation:**
  - Use library (ical-generator) for .ics generation (don't write manually)
  - Include VTIMEZONE component for both mentor and mentee timezones
  - Test .ics file with Gmail, Outlook, Apple Calendar before launch
  - Validate .ics against RFC 5545 standard
  - Include plaintext instructions: "Add to your calendar: [Date/Time]"
- **Test Coverage Required:**
  - Unit tests: .ics generation produces valid format (validate against RFC 5545 parser)
  - Manual tests: Import .ics into Gmail, Outlook, Apple Calendar (verify correct time)
  - Email tests: Verify .ics attachment is present and downloadable

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1: What happens if a mentor changes their availability AFTER a booking is confirmed?**

- **Found in:** Epic scope, MYM-19
- **Question for PO:** If a mentor removes a weekly slot that has an existing confirmed booking, what should happen?
  - Option A: Block the change (show error: "Cannot remove slot with confirmed booking")
  - Option B: Allow change but warn mentor and notify mentee
  - Option C: Allow change, automatically cancel booking and refund mentee
- **Impact if not clarified:** Dev may implement wrong behavior, causing user frustration or revenue loss. QA doesn't know what to test.

**Ambiguity 2: How are scheduling conflicts resolved when mentor availability overlaps with an existing booking?**

- **Found in:** MYM-19 (calendar management)
- **Question for Dev:** If a mentor tries to block a date (availability_exceptions) that already has a confirmed booking, what happens?
  - Option A: Block the action (return error: "Cannot block date with confirmed booking")
  - Option B: Allow blocking but preserve existing bookings (edge case: mentor blocks Nov 15, but existing booking on Nov 15 still shows)
  - Option C: Cancel existing booking and notify mentee
- **Impact if not clarified:** Unclear acceptance criteria, potential bugs, support tickets from confused users

**Ambiguity 3: What timezone validation is performed on user input?**

- **Found in:** MYM-20, FR-009
- **Question for Dev:**
  - Is the mentee_timezone validated against IANA timezone database? (e.g., reject "PST" but accept "America/Los_Angeles")
  - What happens if browser timezone detection fails or returns unknown timezone?
  - Should we allow manual timezone override or force browser-detected timezone?
- **Impact if not clarified:** Risk of invalid timezone data in database, causing email/calendar bugs. No test cases for validation.

**Ambiguity 4: How far in advance can mentees book sessions?**

- **Found in:** MYM-21, epic scope
- **Question for PO:**
  - Is there a minimum lead time? (e.g., "Cannot book session less than 2 hours in advance")
  - Is there a maximum lead time? (e.g., "Cannot book more than 90 days in advance")
  - If no limits, should there be? (Prevents spam bookings, mentor flexibility)
- **Impact if not clarified:** No business rules to test, potential for edge cases (booking 1 year in advance, booking 5 minutes from now)

**Ambiguity 5: What is the exact behavior of the 15-minute slot reservation?**

- **Found in:** Epic scope ("Slot Reservation Logic")
- **Question for Dev:**
  - If another mentee tries to book an expired draft booking, is there a grace period or instant availability?
  - Does the timer pause if user is detected as "active" in payment page?
  - What happens if user refreshes the page during reservation? (Timer resets? Preserved?)
- **Impact if not clarified:** Unclear test scenarios, potential for lost bookings or slot conflicts

**Ambiguity 6: How are reminders sent if session is cancelled AFTER reminder schedule?**

- **Found in:** MYM-22, FR-011
- **Question for Dev:**
  - If 24h reminder is already sent, then booking is cancelled, does 1h reminder still send?
  - How do we prevent reminder emails for cancelled bookings?
  - Should there be a "cancellation confirmed" email instead of reminder?
- **Impact if not clarified:** Risk of sending incorrect emails, user confusion, negative experience

### Missing Information

**Missing 1: Daylight Saving Time (DST) Transition Handling**

- **Needed for:** Accurate test case design for timezone edge cases
- **Suggestion:** Add specification: "When DST transition occurs during a booked session (e.g., 2:00 AM clock change), sessions are preserved in UTC. Display in emails should show post-transition local time with warning: 'Note: Daylight Saving Time begins/ends on this date.'"
- **Test Impact:** Need to add test cases for DST transitions (Mar 10, Nov 3 in 2025)

**Missing 2: Error Message Definitions for Booking Failures**

- **Needed for:** Frontend error handling and user messaging tests
- **Suggestion:** Create error message catalog for booking failures:
  - `SLOT_UNAVAILABLE`: "This slot is no longer available. Please select another time."
  - `MENTOR_UNAVAILABLE`: "This mentor is not available for bookings at this time."
  - `INVALID_TIMEZONE`: "Invalid timezone detected. Please refresh the page and try again."
  - `BOOKING_EXPIRED`: "Your reservation has expired. Please select a new slot."
  - `PAYMENT_REQUIRED`: "Payment is required to confirm this booking."
- **Test Impact:** Can't write negative test cases without knowing expected error messages

**Missing 3: Mentor Calendar Default/Initial State**

- **Needed for:** Testing mentor onboarding flow
- **Suggestion:** Specify initial state of mentor_availability table after mentor verification:
  - Option A: Empty (mentor must manually add all slots)
  - Option B: Pre-filled with suggested slots (Mon-Fri 9am-5pm in mentor's timezone, editable)
  - Option C: Wizard during onboarding: "Set your typical availability"
- **Test Impact:** Affects onboarding flow testing (MYM-19)

**Missing 4: Slot Duration Constraints**

- **Needed for:** Booking validation test cases
- **Suggestion:** Add to FR-009: "Session duration must be exactly 60 minutes for MVP. Mentors cannot set custom durations. Minimum time block in availability is 60 minutes."
- **Test Impact:** Need to test duration validation, availability slot granularity

**Missing 5: Concurrent Booking Limit**

- **Needed for:** Preventing spam and ensuring quality
- **Suggestion:** Add business rule: "Mentees can have maximum 3 confirmed bookings at any time. Additional bookings are blocked until at least one session is completed."
- **Test Impact:** Need to add test cases for booking limit enforcement

**Missing 6: Notification Retry and Failure Handling**

- **Needed for:** Email reliability testing
- **Suggestion:** Specify retry policy: "Email notifications retry 3 times with exponential backoff (1min, 5min, 15min). After 3 failures, mark notification_failed=true and alert admin."
- **Test Impact:** Can't test email failure scenarios without knowing retry behavior

### Suggested Improvements (Before Implementation)

**Improvement 1: Add Minimum Booking Lead Time**

- **Story Affected:** MYM-21
- **Current State:** No specification for minimum lead time between booking and session start
- **Suggested Change:** Add validation: "Bookings must be made at least 2 hours in advance"
- **Benefit:**
  - Prevents last-minute no-shows (mentors need preparation time)
  - Reduces risk of timezone-related confusion (users have time to realize mistakes)
  - Gives time for email delivery and calendar sync
  - Industry standard (similar to Calendly, Calendar.com)

**Improvement 2: Explicit Timezone Display Format**

- **Story Affected:** MYM-20
- **Current State:** AC says "clearly displayed" but no specific format defined
- **Suggested Change:** Define exact format: "Friday, November 15, 2025 at 10:00 AM EST (Your timezone: 7:00 AM PST)"
  - Include day of week (prevents date confusion)
  - Include year (prevents wrong year booking)
  - Show both mentor and mentee timezones
  - Use 12-hour format with AM/PM (more intuitive than 24h for US market)
- **Benefit:**
  - Removes ambiguity for dev and QA
  - Consistent UX across calendar, emails, confirmation pages
  - Reduces support tickets about timezone confusion

**Improvement 3: Add Visual Conflict Warning in Mentor Calendar UI**

- **Story Affected:** MYM-19
- **Current State:** Spec says mentors can "block dates" but doesn't mention conflict detection
- **Suggested Change:** When mentor attempts to block a date or remove availability slot that has existing bookings, show visual warning:
  - "⚠️ Warning: You have 2 confirmed bookings on this date. Blocking this date will require you to contact mentees directly to reschedule."
  - List affected bookings with mentee names and times
  - Require confirmation: "I understand and want to proceed"
- **Benefit:**
  - Prevents accidental conflicts
  - Sets clear expectations (mentor responsibility to reschedule)
  - Reduces support burden
  - Improves mentor experience

**Improvement 4: Slot Selection Confirmation Modal**

- **Story Affected:** MYM-21
- **Current State:** User selects slot and immediately proceeds to payment
- **Suggested Change:** Add confirmation modal before proceeding to payment:
  - "Confirm your session"
  - Mentor name and photo
  - Date/time in BOTH timezones
  - Duration and total cost
  - "Add to calendar" button (downloads .ics immediately)
  - "Confirm and Pay" button
- **Benefit:**
  - Gives user chance to double-check timezone
  - Reduces payment page abandonment (all info is confirmed upfront)
  - Provides early .ics download (backup if email fails)
  - Improves perceived professionalism

**Improvement 5: Add "Suggested Availability" Template for New Mentors**

- **Story Affected:** MYM-19
- **Current State:** Mentor calendar starts empty, requiring manual setup
- **Suggested Change:** During first-time calendar setup, offer template:
  - "Quick setup: Select a template"
  - Template 1: "Weekday Mornings (Mon-Fri 9am-12pm)"
  - Template 2: "Weekday Afternoons (Mon-Fri 1pm-5pm)"
  - Template 3: "Evenings & Weekends (Mon-Fri 6pm-9pm, Sat-Sun 10am-4pm)"
  - Template 4: "Custom (set manually)"
  - All templates are editable after selection
- **Benefit:**
  - Reduces onboarding friction (addresses Business Risk 1)
  - Faster time-to-first-booking
  - Mentors can adjust template instead of starting from scratch
  - Increases % of mentors with availability set

**Improvement 6: Add Backend Validation for Session Datetime in Future**

- **Story Affected:** MYM-21, FR-009
- **Current State:** Spec says "session_date must be a future date and time" but no explicit validation
- **Suggested Change:** Add server-side validation:
  - `session_datetime` must be > NOW() + 2 hours (minimum lead time)
  - `session_datetime` must be < NOW() + 90 days (maximum advance booking)
  - Return 400 Bad Request with clear message if validation fails
- **Benefit:**
  - Prevents edge case bugs (booking in the past, booking too far in future)
  - Explicit test cases for validation
  - Matches payment provider requirements (Stripe requires future dates)

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

- **Functional Testing:**
  - Calendar UI (mentor availability management, mentee slot selection)
  - Booking creation flow (slot selection → reservation → payment handoff)
  - Timezone conversion and display
  - Email notifications (confirmation, 24h reminder, 1h reminder)
  - .ics calendar invite generation and attachment
  - Booking state transitions (draft → confirmed → completed)
  - Double-booking prevention
  - Slot reservation expiration (15-minute window)

- **Integration Testing:**
  - Frontend ↔ Backend API (booking creation, calendar fetching)
  - Backend ↔ Supabase DB (CRUD operations, constraints, transactions)
  - Backend ↔ Email Service (email sending, attachment handling)
  - Booking → Payment flow handoff (EPIC-005 integration point)
  - Scheduled jobs (draft cleanup, reminder emails, status transitions)

- **Non-Functional Testing (per NFR specs):**
  - **Performance (NFR-003):**
    - Calendar page load time <2.5s (LCP)
    - API response time <500ms for GET /api/mentors/{id}/availability
    - Booking creation <500ms (p95)
    - Calendar queries with 100+ bookings <300ms
  - **Security (NFR-002):**
    - JWT authentication for all booking endpoints
    - RLS: Mentors can only edit their own availability
    - RLS: Users can only view their own bookings
    - Input validation for timezone, session_datetime, duration
    - SQL injection prevention (ORM usage)

- **Cross-Browser Testing:**
  - Desktop: Chrome, Firefox, Safari, Edge (latest 2 versions)
  - Mobile: iOS Safari, Android Chrome (latest 2 versions)
  - Timezone detection works across all browsers

- **API Contract Validation (per api-contracts.yaml):**
  - POST /api/bookings matches schema (BookingCreateRequest → BookingProvisionalResponse)
  - GET /api/mentors/{mentorId}/calendar returns correct structure
  - PUT /api/mentors/{mentorId}/calendar accepts MentorCalendarUpdateRequest
  - Error responses match ErrorResponse schema (400, 401, 403, 404, 409)

**Out of Scope (For This Epic):**

- Social calendar sync (Google Calendar, Outlook) - Future feature
- Variable session durations (30min, 90min) - MVP is 60min only
- Recurring bookings (weekly mentorship) - Future feature
- Mentor booking approval flow (auto-accept for MVP per epic.md)
- Video call integration - EPIC-006 (Session Management)
- Cancellation flow - EPIC-006 (Session Management)
- Refund processing - EPIC-005 (Payments)
- Load testing beyond 100 concurrent users - Post-MVP
- Penetration testing - External contractor, post-launch
- Accessibility audit (WCAG compliance) - Separate epic

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** >90% for business logic (timezone, booking validation, availability calculation)
- **Focus Areas:**
  - **Timezone conversion functions:**
    - UTC ↔ Local time (multiple IANA timezones)
    - DST transition handling (March/November)
    - Invalid timezone handling
  - **Booking validation logic:**
    - Slot availability check (considering existing bookings and exceptions)
    - Double-booking detection
    - Minimum lead time validation (2 hours)
    - Maximum advance booking validation (90 days)
  - **Availability calculation:**
    - Weekly recurring slots → specific date slots
    - Exclusion of blocked dates
    - Exclusion of booked slots
  - **.ics generation:**
    - Valid RFC 5545 format
    - Correct VTIMEZONE component
    - ORGANIZER and ATTENDEE fields
- **Responsibility:** Dev team (TDD approach)
- **Tools:** Vitest (frontend), Jest (backend)

#### Integration Testing

- **Coverage Goal:** All integration points identified in Architecture Analysis
- **Focus Areas:**
  - **Frontend ↔ Backend API:**
    - POST /api/bookings with valid data → 200 OK + booking object
    - POST /api/bookings with invalid timezone → 400 Bad Request
    - POST /api/bookings for unavailable slot → 400 Bad Request + alternative slots
    - GET /api/mentors/{id}/calendar → availability + booked slots
    - PUT /api/mentors/{id}/calendar (add/remove slots) → 200 OK
  - **Backend ↔ Database:**
    - INSERT booking with duplicate (mentor_id, session_datetime) → UNIQUE constraint violation → 409 Conflict
    - SELECT available slots filters bookings with status='confirmed'
    - UPDATE booking status='confirmed' after payment webhook
    - Transaction: Create booking + send email (rollback if email fails)
  - **Backend ↔ Email Service:**
    - Confirmation email sent immediately after booking
    - .ics attachment is present and valid
    - Email contains correct session details (datetime, mentor, mentee, cost)
    - Reminder emails sent by scheduled job
  - **Booking → Payment Integration:**
    - Draft booking created with 15-minute expiration
    - Payment success updates booking status to 'confirmed'
    - Payment failure keeps booking in 'draft' state
    - Booking expires during payment (edge case handling)
- **Responsibility:** QA + Dev (pair programming for critical flows)
- **Tools:** Playwright API testing, Supertest, Supabase test instance

#### End-to-End (E2E) Testing

- **Coverage Goal:** Critical user journeys (from user-journeys.md) + booking happy path
- **Tool:** Playwright
- **Focus Areas:**
  - **Mentor Calendar Setup (Carlos's journey):**
    1. Mentor logs in → navigates to calendar management
    2. Adds weekly availability (Mon-Fri 10am-5pm EST)
    3. Blocks specific date (vacation)
    4. Verifies calendar shows correctly in preview
    5. Logs out and verifies profile shows "Available for booking"

  - **Mentee Booking (Laura's journey - Steps 4-6):**
    1. Mentee logs in → searches for React mentor
    2. Clicks mentor profile → views calendar
    3. Selects available slot (Friday 10am EST)
    4. Confirms slot (sees timezone conversion: 7am PST)
    5. Proceeds to payment (15-minute countdown visible)
    6. Completes payment (mocked for E2E)
    7. Sees confirmation page with session details
    8. Receives confirmation email (verify in test inbox)
    9. Downloads .ics from email → verifies it opens correctly

  - **Cross-Timezone Booking:**
    1. Mentor (NYC, EST) sets availability
    2. Mentee (LA, PST) browses calendar
    3. Mentee sees slots in PST (3hr behind)
    4. Mentee books slot
    5. Confirmation email shows BOTH timezones correctly
    6. Database stores session_datetime in UTC

  - **Double-Booking Prevention:**
    1. Two mentees (different browsers) select same slot simultaneously
    2. Both proceed to payment
    3. First to complete payment gets booking
    4. Second sees error: "Slot no longer available"
    5. Second is shown alternative slots

  - **Booking Expiration:**
    1. Mentee selects slot → 15-minute countdown starts
    2. Wait 16 minutes (or fast-forward test clock)
    3. Scheduled job runs → deletes draft booking
    4. Slot becomes available again for other mentees

- **Responsibility:** QA team
- **Test Data:** Faker.js for realistic user data, factories for mentor/mentee accounts

#### API Testing

- **Coverage Goal:** 100% of booking-related endpoints (per api-contracts.yaml)
- **Tool:** Postman/Newman or Playwright API
- **Focus Areas:**
  - **Contract Validation:**
    - POST /api/bookings request/response matches OpenAPI schema
    - GET /api/mentors/{id}/calendar response matches schema
    - PUT /api/mentors/{id}/calendar request matches schema
    - Error responses (400, 401, 403, 404, 409) match ErrorResponse schema

  - **Status Codes:**
    - 200 OK: Successful booking creation, calendar fetch
    - 201 Created: (if applicable)
    - 400 Bad Request: Invalid input (wrong timezone, past date, invalid duration)
    - 401 Unauthorized: Missing or invalid JWT token
    - 403 Forbidden: Mentee trying to edit mentor calendar
    - 404 Not Found: Mentor ID doesn't exist
    - 409 Conflict: Double-booking attempt

  - **Authentication/Authorization:**
    - All endpoints require valid JWT (except public calendar view)
    - Only mentor can PUT /api/mentors/{mentorId}/calendar (their own)
    - Only mentee can POST /api/bookings (as authenticated user)
    - Admin cannot access unless explicitly permitted

  - **Error Handling:**
    - Invalid JSON → 400 + descriptive error
    - Missing required fields → 400 + field list
    - Database errors → 500 (internal, logged, not exposed to user)

- **Responsibility:** QA team
- **Test Environment:** Staging with dedicated test database

---

### Test Types per Story

For EACH user story, the following test types will be covered:

**Positive Test Cases (Happy Paths):**
- Successful execution with valid data
- Multiple valid data variations (different timezones, dates, mentors)
- Expected behavior for standard user flows

**Negative Test Cases (Error Scenarios):**
- Invalid input data (wrong format, out of range)
- Missing required fields
- Unauthorized access attempts (wrong user role, no JWT)
- Business rule violations (booking in past, double-booking)

**Boundary Test Cases (Edge Cases):**
- Min/max values (earliest/latest booking time, timezone boundaries)
- Empty/null values (no availability set, no bookings)
- Timezone edge cases (DST transitions, UTC±12 boundaries)
- Concurrent operations (race conditions)

**Exploratory Testing:**
- Real-world usage patterns (mentors with complex schedules)
- UI/UX issues (confusing labels, unclear errors)
- Cross-browser inconsistencies (timezone detection differences)
- Performance under realistic load (popular mentor with full calendar)

---

## 📊 Test Cases Summary by Story

### MYM-19: Mentor Availability Management

**Complexity:** **HIGH**
- Recurring weekly slots logic
- Timezone handling for mentor's location
- Conflict detection with existing bookings
- Multiple CRUD operations (add, remove, block dates)

**Estimated Test Cases:** **45**

**Breakdown:**
- **Positive:** 12 test cases
  - Add weekly recurring slot (Mon-Fri variations)
  - Add multiple non-overlapping slots
  - Block specific dates (future dates)
  - Edit existing slot (change time, change day)
  - Remove slot with no bookings
  - View calendar with various slot configurations

- **Negative:** 15 test cases
  - Add overlapping slots (same day, same time)
  - Block date in the past
  - Remove slot with existing confirmed booking (should block or warn)
  - Add slot with invalid time (e.g., end_time before start_time)
  - Add slot with invalid day_of_week (not 0-6)
  - Unauthorized user (mentee) tries to edit mentor calendar
  - Mentor tries to edit another mentor's calendar
  - Invalid timezone format
  - Missing required fields (start_time, end_time)

- **Boundary:** 8 test cases
  - Add slot at midnight (00:00)
  - Add slot spanning two days (23:00 - 01:00) - should split or reject
  - Maximum slots per day (e.g., 10 slots)
  - Block 365 future dates (performance test)
  - DST transition dates (Mar 10, Nov 3)

- **Integration:** 7 test cases
  - Add slot → Verify appears in GET /api/mentors/{id}/calendar
  - Remove slot → Verify removed from calendar API
  - Block date → Verify excluded from availability calculation
  - Add slot with existing booking on same time → Conflict detection
  - Calendar update triggers cache invalidation (if caching implemented)

- **API:** 3 test cases
  - PUT /api/mentors/{id}/calendar matches schema
  - Error responses (400, 403) match ErrorResponse schema
  - Rate limiting (if implemented)

**Rationale for Estimate:**
MYM-19 has high complexity due to recurring slots logic, timezone handling, and conflict detection. The 45 test cases cover:
- 6 different slot operations (add, remove, edit, block, view, conflicts)
- 3 different user roles (mentor editing own, mentee unauthorized, other mentor unauthorized)
- 5+ timezone scenarios (EST, PST, UTC, UTC+12, DST transitions)
- Multiple edge cases (midnight, multi-day, max slots, performance)

**Parametrized Tests Recommended:** **YES**
- Parametrize timezone tests (run same test with EST, PST, UTC, UTC+12, etc.)
- Parametrize day_of_week tests (run same slot add test for Mon-Sun)
- Parametrize slot duration tests (1hr, 2hr, 4hr variations)

---

### MYM-20: Timezone Display and Conversion

**Complexity:** **HIGH**
- Critical for user trust and correctness
- Complex DST handling
- Multiple timezone display points (calendar, confirmation, email)
- Cross-browser compatibility (timezone detection)

**Estimated Test Cases:** **38**

**Breakdown:**
- **Positive:** 10 test cases
  - Display mentor availability in mentee's timezone (EST → PST)
  - Display confirmation page with both timezones
  - Email shows correct timezone conversion
  - .ics calendar invite has correct timezone
  - Browser auto-detects mentee timezone (Chrome, Firefox, Safari)
  - Manual timezone override works
  - Timezone displayed in human-readable format ("Friday, Nov 15, 10:00 AM EST")

- **Negative:** 12 test cases
  - Invalid timezone sent from frontend → Backend rejects
  - Timezone detection fails (browser doesn't support Intl API) → Fallback to UTC
  - Mentee timezone is null → Backend uses default (e.g., UTC)
  - Timezone abbreviation used instead of IANA (e.g., "PST" vs "America/Los_Angeles") → Rejected
  - Timezone not in IANA database → Error

- **Boundary:** 10 test cases
  - Timezone offset at +14:00 (Kiribati)
  - Timezone offset at -12:00 (Baker Island)
  - DST transition "spring forward" (2:00 AM doesn't exist on Mar 10)
  - DST transition "fall back" (2:00 AM happens twice on Nov 3)
  - Booking slot during DST transition hour (ambiguous time)
  - Mentor in non-DST timezone (e.g., Arizona, Hawaii)
  - Mentee in different hemisphere (opposite DST schedule)
  - Same timezone but different cities (America/New_York vs America/Toronto)

- **Integration:** 4 test cases
  - Frontend sends mentee_timezone → Backend stores and uses for emails
  - Frontend displays UTC datetime from API in local time
  - .ics generation uses mentee and mentor timezones correctly
  - Email template renders timezone info correctly

- **API:** 2 test cases
  - mentee_timezone field validation (IANA format required)
  - API response includes timezone info for debugging

**Rationale for Estimate:**
Timezone handling is notoriously complex and critical for this epic's success (Technical Risk 1). The 38 test cases cover:
- 10+ different timezones (covering all UTC offsets, DST variations)
- 2 DST transition dates with 4 edge cases each
- 3 display contexts (calendar UI, confirmation page, email)
- 3 browser engines (Chromium, Firefox, WebKit)
- Multiple validation scenarios (IANA format, invalid timezone, null handling)

This is NOT over-testing - timezone bugs are CRITICAL (Technical Risk 1: HIGH impact, HIGH likelihood).

**Parametrized Tests Recommended:** **YES**
- Parametrize timezone pairs (mentor timezone × mentee timezone = 25+ combinations)
  - Example: EST → PST, EST → UTC, EST → UTC+12, PST → EST, etc.
- Parametrize DST transition tests (spring forward, fall back for multiple timezones)
- Parametrize browser timezone detection (Chrome, Firefox, Safari)

---

### MYM-21: Slot Selection and Booking Creation

**Complexity:** **MEDIUM-HIGH**
- Slot availability calculation (complex query)
- 15-minute reservation window
- Double-booking prevention
- Integration with payment flow (EPIC-005)

**Estimated Test Cases:** **42**

**Breakdown:**
- **Positive:** 10 test cases
  - Select available slot → Create draft booking
  - Booking shows 15-minute countdown timer
  - Booking shows correct total cost (mentor hourly_rate)
  - Booking details match selected slot (date, time, mentor)
  - Multiple mentees can view same available slot (before booking)
  - Booking stored in database with status='draft'
  - Booking includes mentee_timezone

- **Negative:** 18 test cases
  - Select slot that is already booked (by another user) → Error
  - Select slot in the past → Error (400 Bad Request)
  - Select slot <2 hours from now → Error (minimum lead time)
  - Select slot >90 days in future → Error (maximum advance booking)
  - Select slot during mentor blocked date → Error
  - Select slot outside mentor availability → Error
  - Invalid duration (not 60 minutes) → Error
  - Invalid mentor ID → Error (404 Not Found)
  - Unauthenticated user tries to book → Error (401 Unauthorized)
  - Mentee has 3 confirmed bookings → Cannot book 4th (concurrent booking limit)
  - Booking without payment → Expires after 15 minutes
  - Slot becomes unavailable between selection and confirmation → Error (409 Conflict)

- **Boundary:** 8 test cases
  - Book slot exactly 2 hours from now (minimum lead time boundary)
  - Book slot exactly 90 days from now (maximum boundary)
  - Booking expires at exactly 15:00 minute mark
  - Booking created at 14:59 minute mark (still valid)
  - Mentor has 0 available slots → Empty state
  - Mentor has 100+ available slots → Performance test
  - First booking for new mentor
  - Last available slot for popular mentor

- **Integration:** 4 test cases
  - Draft booking created → Slot no longer appears in availability API
  - Draft booking expires → Slot reappears in availability
  - Booking creation triggers payment flow (EPIC-005 handoff)
  - Booking cost calculated from mentor hourly_rate at booking time (snapshot)

- **API:** 2 test cases
  - POST /api/bookings matches BookingCreateRequest schema
  - Response matches BookingProvisionalResponse schema

**Rationale for Estimate:**
MYM-21 is the core booking flow with multiple validation rules and integration points. The 42 test cases cover:
- 7 different validation scenarios (availability, timing, user permissions, limits)
- 2 critical timing boundaries (15-minute expiration, 2-hour lead time)
- 4 integration points (availability API, payment flow, slot locking, expiration)
- 3 concurrency scenarios (double-booking, expired slots, simultaneous bookings)
- Performance considerations (100+ slots)

**Parametrized Tests Recommended:** **YES**
- Parametrize timing tests (lead time: 1hr [fail], 2hr [pass], 3hr [pass], 90 days [pass], 91 days [fail])
- Parametrize mentor variations (different hourly_rates, availability patterns)
- Parametrize error scenarios (different 400 error codes with different messages)

---

### MYM-22: Email Notifications and Calendar Invites

**Complexity:** **MEDIUM**
- Email delivery is external dependency
- .ics generation has strict RFC requirements
- Scheduled jobs for reminders
- Template rendering and variable substitution

**Estimated Test Cases:** **35**

**Breakdown:**
- **Positive:** 12 test cases
  - Confirmation email sent immediately after booking
  - Confirmation email contains .ics attachment
  - Confirmation email shows session details (mentor, date/time, cost)
  - Confirmation email displays timezone correctly (mentee's local time)
  - 24-hour reminder email sent (scheduled job)
  - 1-hour reminder email sent (scheduled job)
  - .ics file opens in Gmail (manual test)
  - .ics file opens in Outlook (manual test)
  - .ics file opens in Apple Calendar (manual test)
  - .ics file has correct VTIMEZONE component
  - Email templates render correctly (HTML and plain text versions)

- **Negative:** 12 test cases
  - Email service unavailable → Retry logic triggers
  - Email delivery fails after 3 retries → Marked as failed, admin alerted
  - Invalid email address in user profile → Bounces, logged
  - .ics generation fails → Email sent without attachment (fallback)
  - Reminder email sent for cancelled booking → Should NOT send (filter by status)
  - Duplicate reminder emails (job runs twice) → Idempotency check prevents
  - Email template variables missing → Template renders with fallback values
  - Email exceeds size limit → Truncated or attachment removed

- **Boundary:** 6 test cases
  - Email sent exactly at booking confirmation time (immediate)
  - Reminder sent exactly 24h before session
  - Reminder sent exactly 1h before session
  - Session cancelled after 24h reminder sent → 1h reminder suppressed
  - Session rescheduled after reminder sent → New reminder scheduled
  - Very long mentor bio (500 chars) → Email template handles overflow

- **Integration:** 3 test cases
  - Booking confirmation triggers email send via API
  - Scheduled job queries bookings needing reminders
  - Email status tracked in database (confirmation_sent_at, reminder_24h_sent_at, reminder_1h_sent_at)

- **API:** 2 test cases
  - Email service API called with correct payload
  - .ics attachment base64-encoded correctly

**Rationale for Estimate:**
Email notifications are critical for user experience but have external dependencies and scheduled job complexity. The 35 test cases cover:
- 3 email types (confirmation, 24h reminder, 1h reminder)
- 3 email clients (.ics compatibility: Gmail, Outlook, Apple)
- 4 failure scenarios (service outage, invalid address, generation failure, cancellation)
- 3 timing boundaries (immediate, 24h, 1h)
- Idempotency and retry logic
- Template rendering variations

**Parametrized Tests Recommended:** **YES**
- Parametrize .ics tests (different timezones, durations, mentors)
- Parametrize email template tests (different mentor names, session types, costs)
- Parametrize retry tests (failure after 1, 2, 3 retries)

---

### Total Estimated Test Cases for Epic

**Total:** **160 test cases**

**Breakdown:**
- **Positive:** 44 (28%)
- **Negative:** 57 (36%)
- **Boundary:** 32 (20%)
- **Integration:** 18 (11%)
- **API:** 9 (5%)

**Story Distribution:**
- MYM-19 (Availability): 45 test cases (28%)
- MYM-20 (Timezone): 38 test cases (24%)
- MYM-21 (Booking): 42 test cases (26%)
- MYM-22 (Notifications): 35 test cases (22%)

**Rationale:**
160 test cases is realistic for a CRITICAL epic with HIGH technical complexity:
- Timezone handling (Technical Risk 1: CRITICAL impact, HIGH likelihood) requires extensive testing
- Double-booking prevention (Technical Risk 2: HIGH impact) requires concurrency tests
- Email reliability (Technical Risk 3: HIGH impact) requires failure scenario coverage
- Integration with Payment flow (Integration Risk 3: CRITICAL) requires handoff testing
- This epic blocks EPIC-005 (Payments) and EPIC-006 (Session Management), so quality cannot be compromised

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

From user personas and realistic usage:
- **Mentors:**
  - Carlos (Senior Architect): EST timezone, specialties ["AWS", "Microservices", "Go"], hourly_rate $100
  - Tech Lead in PST: specialties ["React", "TypeScript", "Next.js"], hourly_rate $75
  - Junior Mentor in UTC: specialties ["Python", "Django"], hourly_rate $40
  - International Mentor (UTC+8): specialties ["Machine Learning", "TensorFlow"], hourly_rate $60

- **Mentees:**
  - Laura (Junior Dev): PST timezone, skills ["React", "JavaScript"]
  - Sofía (Career Changer): UTC-3 (Buenos Aires), skills ["Python", "Data Science"]
  - International mentee (UTC+12): skills ["Web Development"]

- **Availability Patterns:**
  - Full-time mentor: Mon-Fri 9am-5pm (40 slots/week)
  - Part-time mentor: Mon, Wed, Fri 6pm-9pm (9 slots/week)
  - Weekend mentor: Sat-Sun 10am-4pm (12 slots/week)
  - Flexible mentor: Various times, blocked dates (vacations)

- **Booking Scenarios:**
  - Same timezone booking (EST mentor, EST mentee)
  - Cross-timezone booking (EST mentor, PST mentee)
  - International booking (EST mentor, UTC+8 mentee)
  - DST transition booking (session on Mar 10 or Nov 3)
  - Rapid booking (book 2 hours in advance)
  - Advance booking (book 60 days in advance)

**Invalid Data Sets:**

- **Timezone Invalids:**
  - Abbreviations: "PST", "EST", "CST" (not IANA format)
  - Non-existent: "America/FakeCity", "Invalid/Timezone"
  - Null/empty: null, "", undefined
  - Wrong format: "UTC+5" (should be "Etc/GMT+5")

- **Session Datetime Invalids:**
  - Past dates: "2024-01-01T10:00:00Z"
  - Too soon: NOW() + 1 hour (less than 2hr minimum)
  - Too far: NOW() + 400 days (more than 90 days)
  - Invalid ISO format: "2025/11/15 10:00 AM"
  - Missing timezone info: "2025-11-15T10:00:00" (no Z)

- **Booking Constraint Violations:**
  - Slot already booked (double-booking attempt)
  - Slot outside mentor availability
  - Slot during blocked date
  - Duration not 60 minutes (e.g., 30, 90, 120)

**Boundary Data Sets:**

- **Timing Boundaries:**
  - session_datetime = NOW() + 2 hours (minimum lead time)
  - session_datetime = NOW() + 90 days (maximum advance booking)
  - created_at + 15:00 minutes (reservation expiration)
  - session_datetime - 24 hours (reminder trigger)
  - session_datetime - 1 hour (reminder trigger)

- **Timezone Boundaries:**
  - UTC+14:00 (Kiribati, easternmost)
  - UTC-12:00 (Baker Island, westernmost)
  - DST transition: Mar 10 02:00 (spring forward, missing hour)
  - DST transition: Nov 3 02:00 (fall back, duplicate hour)

- **Calendar Boundaries:**
  - Mentor with 0 availability slots (empty calendar)
  - Mentor with 100+ availability slots (full calendar)
  - Mentor with 50+ confirmed bookings (popular mentor)
  - Slot at midnight (00:00)
  - Slot at 23:00 (last hour of day)

**Test Data Management:**

- ✅ **Use Faker.js** for generating realistic names, emails, bios
- ✅ **Create data factories** for users, mentors, availability, bookings
  - Factory: createMentor({ timezone, specialties, hourly_rate })
  - Factory: createAvailability({ mentor, day_of_week, start_time, end_time })
  - Factory: createBooking({ mentor, mentee, session_datetime, status })
- ❌ **NO hardcoded data** in tests (use factories for consistency)
- ✅ **Clean up after tests** (delete test bookings, availability, users)
  - Use database transactions (rollback after each test)
  - Or use dedicated test schema (drop and recreate)
- ✅ **Seed consistent data** for E2E tests (same mentor/mentee for reproducibility)

**Test Data Volume:**

For load/performance tests:
- 10 mentors with varied availability patterns
- 50 mentees with different timezones
- 100+ bookings in various states (draft, confirmed, completed)
- 500+ availability slots across mentors

---

### Test Environments

**Staging Environment:**

- **URL:** `https://staging.upexmymentor.com`
- **Database:** Supabase staging instance (separate from production)
- **External Services:**
  - Email: Test email service (Mailtrap, Mailhog) or Resend sandbox mode
  - Timezone data: IANA timezone database (same as production)
- **Purpose:** Primary testing environment for all test levels
- **Test Data:** Dedicated test accounts (mentor@test.com, mentee@test.com)
- **Restrictions:**
  - No real payments (Stripe test mode)
  - No real emails sent (test inbox only)

**Production Environment:**

- **URL:** `https://upexmymentor.com`
- **Purpose:** ONLY smoke tests post-deployment
- **Restrictions:**
  - ❌ NO destructive tests
  - ❌ NO test data creation (use monitoring/observability)
  - ✅ Read-only verification (check public pages load)
  - ✅ Synthetic monitoring (booking flow up to payment, then abort)

**Local Development Environment:**

- **URL:** `http://localhost:3000`
- **Database:** Supabase local instance or Docker PostgreSQL
- **Purpose:** Developer testing, unit tests, integration tests
- **Test Data:** Factories + Faker.js for on-demand generation

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)

Testing can start when:

- [ ] Story is **fully implemented** and deployed to staging
- [ ] Code review is **approved by 2+ reviewers**
- [ ] Unit tests exist and are **passing** (>90% coverage for business logic)
- [ ] Dev has done **smoke testing** and confirms basic functionality works
- [ ] **No blocker bugs** exist in dependent stories (MYM-2, MYM-8, MYM-13)
- [ ] **Test data is prepared** in staging (mentor accounts, availability slots)
- [ ] **API documentation is updated** in api-contracts.yaml (if endpoints changed)
- [ ] **Database migrations** are applied to staging (mentor_availability, bookings tables)
- [ ] **Environment variables** are configured (email service, timezone database)

### Exit Criteria (Per Story)

Story is considered "Done" from QA perspective when:

- [ ] **All test cases are executed** (100% of designed test cases)
- [ ] **Critical/High priority test cases:** 100% passing
- [ ] **Medium/Low priority test cases:** ≥95% passing (known issues documented)
- [ ] **All critical and high bugs are resolved and verified**
- [ ] **Medium bugs** have mitigation plan or are scheduled for future sprints
- [ ] **Regression testing passed** (booking flow doesn't break existing features)
- [ ] **Non-functional requirements validated:**
  - [ ] Performance: Calendar load <2.5s, API response <500ms
  - [ ] Security: JWT auth works, RLS enforced, input validation
- [ ] **Test execution report generated and shared** with team
- [ ] **Known issues documented** in release notes (if any)

### Epic Exit Criteria

Epic is considered "Done" from QA perspective when:

- [ ] **ALL stories (MYM-19, MYM-20, MYM-21, MYM-22) meet individual exit criteria**
- [ ] **Integration testing across all stories is complete:**
  - [ ] Mentor sets availability → Mentee books → Confirmation email sent (end-to-end)
  - [ ] Booking expires → Slot becomes available again
  - [ ] Double-booking prevention works across concurrent requests
- [ ] **E2E testing of critical user journeys is complete and passing:**
  - [ ] Carlos's journey (mentor calendar setup)
  - [ ] Laura's journey (mentee booking flow)
  - [ ] Cross-timezone booking scenario
- [ ] **API contract testing is complete** (all endpoints validated against api-contracts.yaml)
- [ ] **Non-functional testing is complete:**
  - [ ] Performance: All endpoints <500ms (p95), calendar page <2.5s LCP
  - [ ] Security: Penetration test (if applicable), OWASP Top 10 checks
  - [ ] Scalability: 100 concurrent users supported without degradation
- [ ] **Exploratory testing session completed** (findings documented, bugs filed)
- [ ] **No critical or high bugs open** (all resolved or have workarounds)
- [ ] **QA sign-off document created and approved** by QA Lead
- [ ] **Handoff to EPIC-005 (Payments) is validated:**
  - [ ] Draft booking creation works
  - [ ] Payment flow can receive booking details
  - [ ] Status transition from draft → confirmed is ready

---

## 📝 Non-Functional Requirements Validation

From `.context/SRS/non-functional-specs.md`:

### Performance Requirements

**NFR-P-001: Page Load Time (LCP)**
- **Target:** <2.5 seconds on 3G slow connections for mentor profile + calendar page
- **Test Approach:**
  - Lighthouse audit on staging (throttled to 3G)
  - Measure LCP for mentor profile page with 50+ availability slots
  - Test with different mentor availability patterns (empty calendar, full calendar)
- **Tools:** Lighthouse, WebPageTest, Chrome DevTools Network throttling
- **Pass Criteria:** LCP ≤2.5s for 90% of page loads

**NFR-P-002: API Response Time**
- **Target:** <500ms (p95 percentile) for critical booking endpoints
- **Endpoints to test:**
  - GET /api/mentors/{id}/calendar (availability calculation)
  - POST /api/bookings (booking creation)
  - PUT /api/mentors/{id}/calendar (availability update)
- **Test Approach:**
  - Load test with JMeter or Artillery (100 concurrent users)
  - Measure p50, p95, p99 response times
  - Test with realistic data volume (100+ bookings per mentor)
- **Tools:** Artillery, JMeter, Datadog APM
- **Pass Criteria:** p95 ≤500ms for all critical endpoints

**NFR-P-003: Database Query Performance**
- **Target:** <300ms for complex queries (availability calculation with filters)
- **Test Approach:**
  - EXPLAIN ANALYZE on availability query
  - Test with 100, 500, 1000 bookings for same mentor
  - Verify indexes are used (mentor_id, session_datetime, status)
- **Tools:** PostgreSQL EXPLAIN, pgAdmin, Supabase Dashboard
- **Pass Criteria:** Query execution time <300ms with 1000 bookings

### Security Requirements

**NFR-S-001: JWT Authentication**
- **Requirement:** All booking endpoints require valid JWT token
- **Test Approach:**
  - Attempt POST /api/bookings without Authorization header → 401 Unauthorized
  - Attempt with expired JWT → 401 Unauthorized
  - Attempt with invalid JWT signature → 401 Unauthorized
  - Valid JWT → 200 OK
- **Tools:** Postman, Playwright API
- **Pass Criteria:** Unauthenticated requests are blocked (100% coverage)

**NFR-S-002: Row Level Security (RLS)**
- **Requirement:**
  - Mentors can only edit their own availability
  - Users can only view their own bookings
- **Test Approach:**
  - Mentor A tries to PUT /api/mentors/{mentorB}/calendar → 403 Forbidden
  - Mentee A tries to GET /api/bookings (queries return only their bookings, not others')
  - SQL injection attempts blocked by Supabase ORM
- **Tools:** Manual testing, SQL injection test suite
- **Pass Criteria:** Unauthorized access attempts are blocked (100%)

**NFR-S-003: Input Validation**
- **Requirement:** All user inputs are validated (timezone, session_datetime, duration)
- **Test Approach:**
  - Send invalid timezone → 400 Bad Request with error message
  - Send session_datetime in past → 400 Bad Request
  - Send SQL injection payload in timezone field → Rejected or sanitized
  - Send XSS payload in mentor bio → Sanitized before storage
- **Tools:** OWASP ZAP, Burp Suite, manual testing
- **Pass Criteria:** All invalid inputs are rejected with descriptive errors

**NFR-S-004: Data Encryption**
- **Requirement:** All data in transit encrypted via HTTPS/TLS 1.3
- **Test Approach:**
  - Verify SSL/TLS certificate on staging and production
  - Attempt HTTP connection → Redirect to HTTPS
  - Verify TLS version ≥1.2 (preferably 1.3)
- **Tools:** SSL Labs, Qualys SSL Test
- **Pass Criteria:** A+ rating on SSL Labs test

### Usability Requirements

**NFR-U-001: Timezone Display Clarity**
- **Requirement:** Timezone conversions must be clearly displayed to prevent confusion
- **Test Approach:**
  - User testing with 5+ users (different timezones)
  - Measure: % of users who correctly understand session time in their timezone
  - Measure: Time to select and confirm booking (should be <3 minutes)
- **Tools:** User testing sessions, surveys
- **Pass Criteria:** >90% of users correctly understand timezone conversion

**NFR-U-002: Error Message Clarity**
- **Requirement:** Error messages must be actionable and user-friendly
- **Test Approach:**
  - Review all error messages with UX team
  - User testing: Show error → Ask "What would you do next?"
  - Measure: % of users who can recover from error without support
- **Tools:** User testing, A/B testing
- **Pass Criteria:** >80% of users can recover from errors independently

### Reliability Requirements

**NFR-R-001: Email Delivery Rate**
- **Requirement:** >95% email delivery rate for confirmation and reminders
- **Test Approach:**
  - Send 100 test emails to various providers (Gmail, Outlook, Yahoo)
  - Measure: Delivery rate, bounce rate, spam rate
  - Monitor production email metrics (using email service dashboard)
- **Tools:** Resend dashboard, Mailtrap, email deliverability testing
- **Pass Criteria:** ≥95% delivery rate, <2% spam rate

**NFR-R-002: Booking Success Rate**
- **Requirement:** >99% of valid booking attempts succeed (excluding user errors)
- **Test Approach:**
  - Load test: 1000 booking attempts (valid data)
  - Measure: Success rate (200 OK responses)
  - Exclude: User errors (400), double-booking conflicts (409)
- **Tools:** Load testing (Artillery), monitoring (Datadog)
- **Pass Criteria:** ≥99% success rate for valid bookings

---

## 🔄 Regression Testing Strategy

**Regression Scope:**

This epic introduces booking functionality, which could affect:
- **EPIC-001 (Auth):** Login → Book session flow (session state maintained)
- **EPIC-002 (Vetting):** Only verified mentors appear in booking calendars
- **EPIC-003 (Discovery):** Mentor profile → Book button triggers calendar modal

**Regression Test Execution:**

- **Before starting epic testing:**
  1. Run automated regression suite for EPIC-001, EPIC-002, EPIC-003
  2. Verify baseline: All existing features pass (no degradation)

- **After all stories are complete:**
  1. Re-run regression suite
  2. Verify: Booking feature doesn't break existing features
  3. Focus areas:
     - User authentication still works
     - Mentor profiles still display correctly
     - Search/filter functionality intact

**Regression Test Cases:**

- **Auth Regression:**
  - [ ] Login → Navigate to mentor profile → Book session (session persists)
  - [ ] Logout → Attempt to book → Redirect to login (protected route)
  - [ ] JWT expiration during booking → Refresh token works

- **Vetting Regression:**
  - [ ] Unverified mentors do NOT show "Book" button
  - [ ] Verified mentors show "Book" button
  - [ ] Mentor verification status change → Calendar visibility updates

- **Discovery Regression:**
  - [ ] Mentor search still works
  - [ ] Mentor filter (skills, price, rating) still works
  - [ ] Mentor profile page loads correctly
  - [ ] Mentor profile → Book button opens calendar modal (integration)

**Tools:** Playwright E2E suite (automated), manual smoke testing

---

## 📅 Testing Timeline Estimate

**Estimated Duration:** **2.5 sprints (5 weeks)**

**Breakdown:**

- **Test Case Design:** **4 days**
  - Story breakdown and test scenario identification
  - Test data requirements analysis
  - Edge case and boundary condition identification
  - Review and approval by QA Lead

- **Test Data Preparation:** **2 days**
  - Create data factories (mentors, availability, bookings)
  - Seed staging database with test data
  - Set up test email inbox (Mailtrap)
  - Configure test timezone scenarios

- **Test Execution (per story):**
  - **MYM-19 (Availability):** 5 days (45 test cases, high complexity)
  - **MYM-20 (Timezone):** 5 days (38 test cases, high complexity, DST testing)
  - **MYM-21 (Booking):** 5 days (42 test cases, concurrency testing)
  - **MYM-22 (Notifications):** 4 days (35 test cases, email testing)
  - **Total:** 19 days (3.8 weeks)

- **Regression Testing:** **2 days**
  - Run automated regression suite (EPIC-001, EPIC-002, EPIC-003)
  - Manual smoke testing of integration points

- **Bug Fixing Cycles:** **5 days (buffer)**
  - Time for dev to fix bugs found during testing
  - QA re-verification of fixes
  - Typically 2-3 fix cycles expected

- **Exploratory Testing:** **2 days**
  - Ad-hoc testing with realistic scenarios
  - UX evaluation (timezone clarity, error messages)
  - Cross-browser compatibility testing

- **Performance & Security Testing:** **2 days**
  - Load testing (100 concurrent users)
  - API response time validation
  - Security testing (auth, RLS, input validation)

**Total:** **36 days ≈ 7.2 weeks ≈ 2.5 sprints**

**Critical Path:**
1. Test case design (must complete before execution)
2. Story testing (sequential: MYM-19 → MYM-20 → MYM-21 → MYM-22)
3. Bug fixing (may extend timeline if major bugs found)

**Dependencies:**

- **Depends on:**
  - EPIC-001 (Auth) completed and stable
  - EPIC-002 (Vetting) completed and stable
  - EPIC-003 (Discovery) completed and stable
  - Staging environment configured and stable
  - Email service configured (test mode)

- **Blocks:**
  - EPIC-005 (Payments) - Cannot start until booking creation works
  - EPIC-006 (Session Management) - Requires booking state transitions

**Risk Buffer:**
- **5 days buffer** included for unexpected issues (timezone edge cases, email deliverability, concurrency bugs)
- If timeline slips, prioritize: MYM-21 (booking creation) > MYM-19 (availability) > MYM-22 (notifications) > MYM-20 (timezone)

---

## 🛠️ Tools & Infrastructure

**Testing Tools:**

- **E2E Testing:** Playwright
  - Browser automation for user journeys
  - Cross-browser testing (Chromium, Firefox, WebKit)
  - Visual regression testing (screenshots)
  - Video recording of test failures

- **API Testing:** Postman + Newman (or Playwright API)
  - API contract validation
  - Request/response schema validation
  - Authentication/authorization testing
  - Performance testing (response times)

- **Unit Testing:** Vitest (frontend), Jest (backend)
  - Timezone conversion functions
  - Availability calculation logic
  - Booking validation rules
  - .ics generation functions

- **Performance Testing:** Lighthouse, Artillery, WebPageTest
  - Page load time (LCP, TTI)
  - API response time (load testing)
  - Database query performance

- **Security Testing:** OWASP ZAP (if applicable), manual testing
  - SQL injection prevention
  - XSS prevention
  - JWT validation
  - RLS enforcement

- **Test Data:** Faker.js
  - Realistic names, emails, bios
  - Data factories for entities
  - Parameterized test data

- **Email Testing:** Mailtrap, Mailhog, or email service test mode
  - Email delivery verification
  - .ics attachment validation
  - Template rendering

**CI/CD Integration:**

- [ ] **Tests run automatically on PR creation**
  - Unit tests (Vitest, Jest)
  - Linting and type checking (ESLint, TypeScript)
  - API contract validation

- [ ] **Tests run on merge to main branch**
  - Unit tests
  - Integration tests (API)
  - E2E tests (critical paths only, to save time)

- [ ] **Tests run on deployment to staging**
  - Full E2E test suite (all user journeys)
  - Performance tests (Lighthouse, load testing)
  - Smoke tests (verify deployment successful)

- [ ] **Smoke tests run on deployment to production**
  - Read-only verification (public pages load)
  - API health checks
  - Email notification system health

**Test Management:**

- **Jira Xray** (or similar):
  - Test cases linked to user stories (MYM-19, MYM-20, MYM-21, MYM-22)
  - Test execution tracking (pass/fail status)
  - Bug tracking linked to test cases
  - Test execution reports per sprint

- **Test Coverage Dashboard:**
  - Code coverage from unit tests (>90% goal)
  - API endpoint coverage (100% goal for booking endpoints)
  - E2E scenario coverage (critical user journeys)

---

## 📊 Metrics & Reporting

**Test Metrics to Track:**

- **Test Execution Metrics:**
  - Test cases executed vs. total (target: 100%)
  - Test pass rate (target: >95% before story completion)
  - Test execution time (track to optimize CI/CD pipeline)

- **Bug Metrics:**
  - Bugs found per story (track quality of implementation)
  - Bug severity distribution (Critical, High, Medium, Low)
  - Bug fix rate (target: Critical/High bugs fixed within 1 day)
  - Bug escape rate (bugs found in production after release)

- **Test Coverage Metrics:**
  - Unit test code coverage (target: >90% for business logic)
  - API endpoint coverage (target: 100% for booking endpoints)
  - User journey coverage (target: 100% of critical paths)

- **Performance Metrics:**
  - Calendar page LCP (target: <2.5s)
  - API response times (p50, p95, p99) (target: p95 <500ms)
  - Database query times (target: <300ms)

- **Quality Metrics:**
  - Regression test pass rate (target: 100% before epic completion)
  - Customer-reported bugs (target: <5 in first month post-launch)
  - User satisfaction with booking flow (survey: target >4/5 stars)

**Reporting Cadence:**

- **Daily:**
  - Test execution status (test cases run, passed, failed, blocked)
  - Bugs found and fixed today
  - Blockers or risks identified

- **Per Story:**
  - Story test completion report (all test cases executed, pass rate)
  - Story bug summary (total found, severity, status)
  - Story exit criteria checklist (ready to close or not)

- **Per Epic:**
  - Comprehensive QA sign-off report:
    - Total test cases executed: 160
    - Pass rate: >95%
    - Bug summary: X critical, Y high, Z medium (all critical/high resolved)
    - Performance validation results
    - Security testing results
    - Regression test results
    - Risk mitigation summary
    - Known issues (if any)
    - Recommendation: Approved for production / Needs more work

**Report Recipients:**
- PO: Epic-level report (business risks, user impact)
- Dev Lead: Daily + story-level reports (technical issues, blockers)
- QA Team: Daily standups (test execution progress)
- Stakeholders: Epic-level report (go/no-go decision)

---

## 🎓 Notes & Assumptions

**Assumptions:**

1. **Mentor availability is set BEFORE mentees can book:** Mentors must complete MYM-19 before their profile shows "available for booking"
2. **MVP uses 60-minute sessions only:** No variable durations (30min, 90min) in this epic
3. **Auto-accept bookings (no manual approval):** Mentors do NOT need to approve bookings (they control availability via calendar)
4. **15-minute reservation window is sufficient:** Users can complete payment within 15 minutes; edge cases are handled by extension logic
5. **Email service is reliable:** Using a trusted provider (Resend or Supabase) with >95% delivery rate
6. **IANA timezone database is up-to-date:** System uses latest timezone data (including recent DST rule changes)
7. **Payment integration (EPIC-005) is ready:** Booking flow hands off to payment correctly

**Constraints:**

- **Time:** 2.5 sprints (5 weeks) is tight for 160 test cases; may need to prioritize critical paths if timeline slips
- **Resources:** QA team size (assume 2 QA engineers); may need additional support for load/performance testing
- **Tools:** Limited to tools already in stack (Playwright, Vitest, Postman); no budget for additional tools
- **Environment:** Staging environment must be stable; downtime will delay testing
- **Timezone testing:** Difficult to manually test all timezone combinations; must rely on automated tests

**Known Limitations:**

- **Cannot fully test email deliverability across all email providers:** Limited to Gmail, Outlook, Apple (most common); edge cases (corporate email servers, spam filters) may cause issues in production
- **Cannot simulate real-world calendar integration:** .ics files tested manually in major clients, but edge cases (old Outlook versions, mobile calendar apps) may have compatibility issues
- **Concurrency testing limited by staging environment:** Cannot simulate 1000+ concurrent users on staging; production monitoring required
- **Timezone edge cases are infinite:** Cannot test every possible timezone pair + DST transition; rely on parametrized tests for coverage

**Exploratory Testing Sessions:**

Recommended: **2 exploratory testing sessions** BEFORE implementation

**Session 1: Timezone UX Exploration (2 hours)**
- **Objective:** Identify confusing timezone displays or conversion errors
- **Approach:**
  - Use mockups/prototypes of booking calendar
  - Test with users in different timezones (recruit 3 users: EST, PST, UTC+8)
  - Ask: "When is this session happening in your local time?"
  - Measure: Comprehension rate, time to understand
- **Output:** UX improvements for timezone display (feed into Improvement 2)

**Session 2: Booking Flow Edge Cases (2 hours)**
- **Objective:** Discover unexpected user behaviors or edge cases
- **Approach:**
  - Real mentor + mentee (internal team members)
  - Attempt various booking scenarios (rapid booking, slot changes, payment abandonment)
  - Try to "break" the system (concurrent bookings, expired slots, invalid inputs)
- **Output:** New test cases, bug reports, UX improvements

---

## 📎 Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/epic.md`
- **User Stories:** (within epic.md)
  - MYM-19: Mentor Availability Management
  - MYM-20: Timezone Display and Conversion
  - MYM-21: Slot Selection and Booking Creation
  - MYM-22: Email Notifications and Calendar Invites
- **Business Model:** `.context/idea/business-model.md`
- **PRD:**
  - `.context/PRD/executive-summary.md`
  - `.context/PRD/user-personas.md`
  - `.context/PRD/user-journeys.md`
- **SRS:**
  - `.context/SRS/functional-specs.md` (FR-009, FR-010, FR-011)
  - `.context/SRS/non-functional-specs.md` (Performance, Security, Reliability)
  - `.context/SRS/architecture-specs.md` (Database schema, API design)
  - `.context/SRS/api-contracts.yaml` (Booking endpoints)

---

**End of Feature Test Plan**

---

**Next Steps:**
1. **QA Lead:** Review this test plan and refine test case estimates
2. **PO:** Answer critical questions in "Critical Analysis" section
3. **Dev Lead:** Validate technical risks and integration points
4. **Team:** Schedule refinement session to discuss ambiguities and improvements
5. **QA:** Begin test case design for MYM-19 (first story in recommended order)
