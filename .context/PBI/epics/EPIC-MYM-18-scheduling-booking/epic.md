# EPIC-004: Scheduling & Booking

**Jira Key:** MYM-18
**Status:** ASSIGNED
**Priority:** CRITICAL
**Phase:** Core Marketplace (Sprint 3-4)

---

## Epic Description

This epic enables the core transaction of the marketplace: booking a mentorship session. It allows mentors to define their availability through a calendar interface and enables mentees to select an available time slot and book it. This is where the value exchange begins - mentees get access to expertise, and mentors monetize their time.

**Business Value:**
This epic directly enables revenue generation. Without booking functionality:
- Mentees cannot purchase sessions (no revenue)
- Mentors cannot monetize their expertise
- The marketplace value proposition breaks down

Key business outcomes:
- Enable GMV (Gross Merchandise Value) target of $5,000 in first month
- Facilitate 100+ session bookings in first month post-launch
- Provide clear path from discovery (EPIC-003) to payment (EPIC-005)

---

## User Stories

1. **MYM-19** - As a Mentor, I want to set my weekly availability on a calendar so that mentees know when I am available to book
2. **MYM-20** - As a Mentee, I want to see a mentor's availability in my own timezone so that I can avoid confusion
3. **MYM-21** - As a Mentee, I want to select an open time slot and book a one-hour session so that I can schedule my mentorship
4. **MYM-22** - As a user, I want to receive an email confirmation and a calendar invite for my booked session so that I don't miss it

---

## Scope

### In Scope

**Mentor Availability Management:**
- Calendar interface for mentors to set weekly recurring availability
- Ability to set specific time slots (e.g., Mon 10-11am, Wed 2-4pm)
- Ability to block off individual dates (vacations, conflicts)
- Minimum session duration: 1 hour (60 minutes)
- Timezone support for mentor's local timezone

**Mentee Booking:**
- Visual calendar showing mentor's available slots
- Timezone conversion (display in mentee's local timezone)
- Click to select a time slot
- Booking summary page showing:
  - Selected date/time (in both timezones)
  - Session duration
  - Mentor name and rate
  - Total cost
- "Confirm and Pay" button (links to EPIC-005)

**Notifications:**
- Email confirmation to both mentor and mentee on booking
- Calendar invite (.ics file) attached to email
- Reminder email 24 hours before session
- Reminder email 1 hour before session

**Booking States:**
- `draft` - Slot selected but payment not completed
- `confirmed` - Payment completed, session booked
- `cancelled` - Cancelled by user (see EPIC-006)
- `completed` - Session has occurred
- `no_show` - Scheduled time passed without attendance

### Out of Scope (Future)
- Calendar sync with Google Calendar, Outlook
- Buffer time between sessions
- Variable session durations (30 min, 90 min, 2 hrs)
- Recurring sessions (weekly mentorship)
- Waitlist for fully booked mentors
- "Instant booking" without confirmation
- Group sessions (1 mentor, multiple mentees)

---

## Acceptance Criteria (Epic Level)

1. ✅ Mentors can set weekly recurring availability slots
2. ✅ Mentors can block specific dates
3. ✅ Mentees see only open slots (already booked slots are hidden)
4. ✅ Timezone conversion is accurate and clearly displayed
5. ✅ Selected slot is held for 15 minutes during checkout
6. ✅ Double-booking is prevented (database-level constraint)
7. ✅ Booking confirmation emails are sent to both parties within 5 minutes
8. ✅ Calendar invites are valid .ics format and work in major email clients
9. ✅ Reminder emails are sent at the correct time (24h and 1h before)
10. ✅ All booking actions are idempotent (prevent duplicate bookings)

---

## Related Functional Requirements

- **FR-009:** El sistema debe permitir a los estudiantes ver la disponibilidad de un mentor y reservar una sesión
- **FR-010:** El sistema debe permitir a los mentores gestionar su calendario y aceptar/rechazar solicitudes
- **FR-011:** El sistema debe enviar notificaciones de confirmación y recordatorios de sesiones

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Database Schema

**Tables:**
- `mentor_availability` (recurring weekly slots)
  - id (uuid, PK)
  - mentor_id (uuid, FK to mentor_profiles.id)
  - day_of_week (integer, 0-6 for Sun-Sat)
  - start_time (time, e.g., '10:00:00')
  - end_time (time, e.g., '11:00:00')
  - timezone (string, e.g., 'America/New_York')
  - is_active (boolean)
  - created_at, updated_at

- `availability_exceptions` (blocked dates)
  - id (uuid, PK)
  - mentor_id (uuid, FK)
  - blocked_date (date)
  - reason (text, nullable)
  - created_at

- `bookings`
  - id (uuid, PK)
  - mentor_id (uuid, FK)
  - mentee_id (uuid, FK)
  - session_datetime (timestamptz) - Stored in UTC
  - duration_minutes (integer, default 60)
  - status (enum: 'draft' | 'confirmed' | 'cancelled' | 'completed' | 'no_show')
  - total_amount (numeric) - Snapshot of hourly_rate at booking time
  - confirmation_sent_at (timestamptz)
  - reminder_24h_sent_at (timestamptz)
  - reminder_1h_sent_at (timestamptz)
  - created_at, updated_at
  - **UNIQUE CONSTRAINT** on (mentor_id, session_datetime) - Prevent double-booking

### Timezone Handling
- **Storage:** All datetimes stored in UTC in PostgreSQL (timestamptz)
- **Display:** Convert to user's local timezone on frontend
- **User Timezone Detection:** Use `Intl.DateTimeFormat().resolvedOptions().timeZone` in browser
- **Libraries:** Use `date-fns-tz` for timezone conversions

### Slot Reservation Logic
- When mentee selects a slot:
  1. Create booking with status `draft`
  2. Set expiration time: `created_at + 15 minutes`
  3. Frontend shows 15-minute countdown timer
  4. If payment not completed, cron job deletes `draft` bookings older than 15 minutes
  5. On payment success, update status to `confirmed`

### Email Notifications
**Confirmation Email (sent immediately after booking):**
- Subject: "Session Confirmed with [Mentor Name]"
- Content:
  - Mentor name and photo
  - Date/time in both timezones
  - Session duration
  - Total amount paid
  - Link to session dashboard
  - Attached .ics calendar invite

**Reminder Emails (sent via scheduled job):**
- 24h reminder: "Your session with [Mentor Name] is tomorrow"
- 1h reminder: "Your session with [Mentor Name] starts in 1 hour"
- Include session link (from EPIC-006)

**Implementation:**
- Use Supabase Edge Functions for scheduled reminders
- Use Resend or similar for email delivery
- Store email job status in `bookings` table

### API Endpoints

See: `.context/SRS/api-contracts.yaml`

- `GET /api/mentors/:id/availability` - Get mentor's available slots
  - Returns: Array of available datetime slots for next 30 days
  - Filters out: booked slots, blocked dates, past dates

- `POST /api/bookings` - Create a booking (draft)
  ```json
  {
    "mentor_id": "uuid",
    "session_datetime": "2025-11-15T10:00:00Z",
    "mentee_timezone": "America/Los_Angeles"
  }
  ```

- `PATCH /api/bookings/:id/confirm` - Confirm booking after payment
  - Updates status to `confirmed`
  - Triggers confirmation email

- `GET /api/bookings` - List user's bookings
  - Query params: `?status=confirmed&upcoming=true`

---

## Dependencies

### External Dependencies
- Email service (Resend, Supabase Email)
- Scheduled jobs runner (Supabase Edge Functions + cron)

### Internal Dependencies
- **EPIC-001 (User Authentication):** Required
  - Need mentee and mentor user IDs
- **EPIC-002 (Mentor Vetting):** Required
  - Only verified mentors can receive bookings
- **EPIC-003 (Mentor Discovery):** Required
  - Booking flow starts from mentor profile page

### Blocks
- **EPIC-005 (Payments):** Booking triggers payment flow
- **EPIC-006 (Session Management):** Manages lifecycle of bookings

---

## Success Metrics

### Functional Metrics
- 0 double-bookings (database constraint prevents)
- >95% email delivery rate for confirmations
- >90% email delivery rate for reminders
- <2 second load time for availability calendar

### Business Metrics (from Executive Summary)
- 100 sessions booked in first month post-launch
- $5,000 GMV in first month (avg $50/session × 100 sessions)
- <5% booking abandonment rate (select slot but don't pay)
- 70% of bookings are within 7 days of booking (urgency indicator)

### UX Metrics
- Average time to complete booking (select slot → payment): <3 minutes
- <10% users have timezone confusion (support tickets)
- 60% of users interact with calendar within 30 seconds

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Timezone conversion errors lead to wrong booking times | Critical | Medium | Extensive testing, clear timezone display, user confirmation |
| Double-booking due to race conditions | High | Low | Database unique constraint, pessimistic locking on slot selection |
| Email delivery failures cause missed sessions | High | Medium | Use reliable email service, implement retry logic, log all email attempts |
| Mentors don't set availability | High | Medium | Onboarding checklist, email reminders, block profile visibility until availability set |
| 15-minute slot reservation expires during payment | Medium | Medium | Clear countdown timer, auto-extend if in payment flow |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-004-scheduling-booking/feature-test-plan.md`

### Test Coverage Requirements
- **Unit Tests:** Timezone conversion logic, slot conflict detection (>95% coverage)
- **Integration Tests:** Full booking flow end-to-end
- **E2E Tests:** User journey from slot selection to confirmation email
- **Performance Tests:** Availability query with 1000+ bookings
- **Race Condition Tests:** Concurrent bookings of same slot
- **Email Tests:** .ics file validity, email template rendering

### Critical Test Scenarios
1. **Timezone Test:** Mentor in New York (EST), Mentee in Los Angeles (PST)
   - Mentor sets availability: Mon 10-11am EST
   - Mentee should see: Mon 7-8am PST
   - Booking should be stored as correct UTC time

2. **Double-Booking Prevention:**
   - Two mentees try to book same slot simultaneously
   - Only one booking should succeed
   - Second mentee should see "slot no longer available" error

3. **Email Delivery:**
   - Booking confirmed → both parties receive email within 5 minutes
   - .ics file opens correctly in Gmail, Outlook, Apple Calendar
   - Reminder emails sent at exact scheduled time

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-004-scheduling-booking/feature-implementation-plan.md`

### Recommended Story Order
1. MYM-19 (Mentor availability) - Foundation, calendar management
2. MYM-20 (Timezone display) - Critical for booking accuracy
3. MYM-21 (Booking flow) - Core transaction
4. MYM-22 (Email notifications) - Feedback loop

### Estimated Effort
- **Development:** 3-4 sprints (6-8 weeks)
- **Testing:** 1 sprint (2 weeks) - High complexity
- **Total:** 4-5 sprints

---

## Design Considerations

### Mentor Availability Calendar (Admin View)
```
Set Your Availability

Timezone: [America/New_York ▼]

Weekly Schedule:
  Monday    [10:00 AM] - [11:00 AM] [+ Add Slot]
  Tuesday   No slots set            [+ Add Slot]
  Wednesday [02:00 PM] - [04:00 PM] [+ Add Slot]
  ...

Block Specific Dates:
  [Calendar picker]
  Blocked: Dec 25, 2025 (Holiday)
```

### Mentee Booking Calendar (Public View)
```
Book a Session with Carlos

Your timezone: America/Los_Angeles
Mentor timezone: America/New_York (3 hrs ahead)

November 2025
Su Mo Tu We Th Fr Sa
                1  2
 3  4  5  6  7  8  9
10 11 12 13 14 15 16  ← Click on 15th
...

Available Times (Friday, Nov 15):
○ 7:00 AM (10:00 AM EST)
○ 8:00 AM (11:00 AM EST)
○ 2:00 PM (5:00 PM EST)

[Continue to Payment]
```

---

## Notes

- Calendar UI can use libraries like `react-big-calendar` or `fullcalendar`
- Consider showing mentor's busy times as grayed-out (not just hiding them)
- Slot reservation timeout of 15 minutes may need adjustment based on user behavior
- Future enhancement: Allow mentors to require approval before booking is confirmed

---

## Related Documentation

- **PRD:** `.context/PRD/user-journeys.md` (Booking journey)
- **SRS:** `.context/SRS/functional-specs.md` (FR-009, FR-010, FR-011)
- **SRS:** `.context/SRS/non-functional-specs.md` (NFR-003: Performance)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API:** `.context/SRS/api-contracts.yaml`
