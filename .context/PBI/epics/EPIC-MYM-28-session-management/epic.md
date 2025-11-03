# EPIC-006: Session Management

**Jira Key:** MYM-28
**Status:** ASSIGNED
**Priority:** HIGH
**Phase:** Enhanced UX (Sprint 7)

---

## Epic Description

This epic provides users with the tools necessary to manage their mentorship sessions throughout their entire lifecycle - from booking confirmation through session completion. It includes a dashboard for viewing upcoming and past sessions, video call integration for conducting sessions, and cancellation functionality with proper business rules.

**Business Value:**
Session management is critical for user experience and retention:
- **Reduces support overhead:** Self-service dashboard reduces "where's my session?" questions
- **Increases session completion:** Easy access to video calls reduces no-shows
- **Flexibility builds trust:** Clear cancellation policy reduces booking anxiety
- **Retention driver:** Good post-booking UX encourages repeat bookings

Without this epic, users would have bookings but no way to manage or access them effectively.

---

## User Stories

1. **MYM-29** - As a user, I want a simple dashboard where I can see my upcoming and past sessions so that I can manage my schedule
2. **MYM-30** - As a user, I want to be able to join a video call for my session (via a provided link) so that we can communicate
3. **MYM-31** - As a user, I want to be able to cancel a session up to 24 hours in advance so that I have flexibility

---

## Scope

### In Scope

**Session Dashboard:**
- Unified dashboard for both mentors and mentees
- Two tabs: "Upcoming" and "Past" sessions
- Upcoming sessions show:
  - Mentor/mentee name and photo
  - Date and time (user's timezone)
  - Session duration
  - "Join Call" button (visible 15 min before session)
  - "Cancel" button (if >24h before session)
  - "View Details" link
- Past sessions show:
  - Mentor/mentee name and photo
  - Date completed
  - Status (completed, cancelled, no-show)
  - "Leave Review" button (if not reviewed yet)
  - "View Details" link
- Empty states for no sessions
- Filter/search functionality (by mentor name, date range)

**Video Call Integration:**
- Generate unique video call link for each booking
- Use third-party service (e.g., Daily.co, Whereby, Jitsi)
- Video link available 15 minutes before session start
- Video link expires 1 hour after session end
- One-click join from dashboard
- Basic video features: video, audio, screen share, chat

**Session Cancellation:**
- Cancel button available >24 hours before session
- Cancellation confirmation modal with warning
- Automatic refund processing (triggers EPIC-005 refund)
- Cancellation email sent to both parties
- Cancelled sessions appear in "Past" with status
- Cancellation tracking for analytics

**Session Status Tracking:**
- Auto-update status based on time:
  - `confirmed` → session scheduled
  - `in_progress` → within session time window
  - `completed` → 1 hour after session end time
  - `no_show` → no video call join activity (future)
- Status visible on dashboard

### Out of Scope (Future)
- In-platform video calling (embedded player)
- Session recording
- Shared note-taking during session
- Post-session summary/action items
- Rescheduling (only cancellation supported in MVP)
- Waiting room for video calls
- Session duration tracking (actual time spent)
- No-show detection and penalties

---

## Acceptance Criteria (Epic Level)

1. ✅ Dashboard displays all user's bookings (upcoming and past)
2. ✅ Upcoming sessions are sorted by date (nearest first)
3. ✅ Past sessions are sorted by date (most recent first)
4. ✅ "Join Call" button appears 15 minutes before session start
5. ✅ Video call link opens in new tab and is valid
6. ✅ Users can cancel sessions >24 hours before start time
7. ✅ Cancellation within 24 hours shows error message (not allowed)
8. ✅ Cancelled sessions trigger automatic refund (EPIC-005)
9. ✅ Both parties receive cancellation email within 5 minutes
10. ✅ Session status updates automatically based on time
11. ✅ Dashboard loads in <2 seconds with 100+ sessions

---

## Related Functional Requirements

- **FR-012:** El sistema debe proporcionar un enlace de videollamada para las sesiones

**Note:** This epic introduces additional requirements:
- **FR-SM-001:** El sistema debe permitir a los usuarios visualizar sus sesiones programadas
- **FR-SM-002:** El sistema debe permitir a los usuarios cancelar sesiones con >24h de anticipación
- **FR-SM-003:** El sistema debe actualizar automáticamente el estado de las sesiones

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Video Call Integration

**Option 1: Daily.co (Recommended for MVP)**
- Pre-built video call rooms
- Simple API integration
- Free tier: 10,000 minutes/month
- No download required (browser-based)

**Option 2: Whereby**
- Pre-built rooms with custom branding
- Simple embed option
- Paid plans required for scale

**Option 3: Jitsi (Self-hosted)**
- Open source, fully customizable
- Requires hosting infrastructure
- More complex setup

**For MVP: Use Daily.co**

**Implementation:**
```javascript
// When booking is confirmed, create Daily room
const room = await daily.createRoom({
  name: `session-${bookingId}`,
  privacy: 'private',
  properties: {
    start_video_off: false,
    start_audio_off: false,
    enable_screenshare: true,
    enable_chat: true,
    exp: sessionEndTime + 3600 // Expire 1h after session
  }
});

// Store room URL in database
await updateBooking(bookingId, {
  video_call_url: room.url
});
```

### Database Schema Extensions

**Tables:**
- `bookings` (extend from EPIC-004)
  - video_call_url (string, nullable) - Daily.co room URL
  - video_call_room_id (string, nullable) - External room ID
  - cancelled_at (timestamptz, nullable)
  - cancelled_by (uuid, FK to users.id, nullable)
  - cancellation_reason (text, nullable)
  - refund_issued (boolean, default false)
  - refund_amount (numeric, nullable)

### Session Status State Machine

```
States:
  draft → confirmed → in_progress → completed
                 ↓
              cancelled

Rules:
  - draft: Booking created, payment pending
  - confirmed: Payment completed, session scheduled
  - in_progress: Current time within session window
  - completed: 1 hour after session_end_time
  - cancelled: User cancelled (only if >24h before)
```

### Cancellation Logic

```javascript
// Cancellation validation
function canCancel(booking) {
  const now = new Date();
  const sessionStart = new Date(booking.session_datetime);
  const hoursUntilSession = (sessionStart - now) / (1000 * 60 * 60);

  return hoursUntilSession > 24 && booking.status === 'confirmed';
}

// Cancellation flow
async function cancelBooking(bookingId, userId) {
  // 1. Validate cancellation eligibility
  // 2. Update booking status to 'cancelled'
  // 3. Record cancelled_by and cancelled_at
  // 4. Trigger refund via Stripe (EPIC-005)
  // 5. Send cancellation emails
  // 6. Release mentor's calendar slot
}
```

### API Endpoints

See: `.context/SRS/api-contracts.yaml`

- `GET /api/bookings` - List user's bookings
  - Query params: `?status=upcoming|past&limit=20`
  - Response: Array of bookings with mentor/mentee details

- `GET /api/bookings/:id` - Get booking details
  - Includes video_call_url (if session is within 15 min)

- `POST /api/bookings/:id/cancel` - Cancel a booking
  - Validates 24-hour rule
  - Returns: Updated booking with refund details

- `GET /api/bookings/:id/video-link` - Get video call link
  - Only returns URL if session starts in <15 minutes
  - Returns 403 if too early or session expired

---

## Dependencies

### External Dependencies
- Video call service (Daily.co, Whereby, or Jitsi)
- Email service for cancellation notifications

### Internal Dependencies
- **EPIC-004 (Scheduling & Booking):** Required
  - Bookings must exist before management
- **EPIC-005 (Payments):** Required
  - Refund functionality needed for cancellations

### Blocks
- **EPIC-007 (Reputation & Reviews):** Dashboard provides "Leave Review" CTA

---

## Success Metrics

### Functional Metrics
- >95% video call link availability (uptime)
- <1% cancelled sessions due to video call issues
- <5% cancellations (indicates booking confidence)
- 0 invalid refunds (proper validation)

### Business Metrics
- 85% session completion rate (booked → completed)
- <10% no-show rate
- 60% users access dashboard at least once per week
- 40% users leave review after session (indicates engagement)

### UX Metrics
- Average time to join video call from dashboard: <30 seconds
- <2% support tickets about "can't find video link"
- Dashboard engagement: 3+ page views per user per month

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Video call service outage during sessions | Critical | Low | SLA with provider, backup service configured, clear communication plan |
| Users don't see "Join Call" button | High | Medium | Clear UI, email reminder includes video link |
| Abuse of cancellation policy (repeated cancellations) | Medium | Medium | Track cancellation rate per user, flag frequent cancellers |
| Refund processing failures | High | Low | Robust error handling, manual refund dashboard for admins |
| Timezone confusion on dashboard | Medium | Medium | Always display user's local time, show timezone label |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-006-session-management/feature-test-plan.md`

### Test Coverage Requirements
- **Unit Tests:** Cancellation validation logic, status transitions (>90% coverage)
- **Integration Tests:** Video link generation, refund triggering
- **E2E Tests:** Full dashboard navigation, video call joining
- **Load Tests:** Dashboard performance with 1000+ bookings
- **Video Tests:** Daily.co API integration, link validity

### Critical Test Scenarios
1. **24-Hour Cancellation Rule:**
   - Attempt to cancel session 25 hours before → Success
   - Attempt to cancel session 23 hours before → Fail with error

2. **Video Link Visibility:**
   - Check 16 minutes before session → Link not visible
   - Check 14 minutes before session → "Join Call" button appears
   - Click "Join Call" → Opens Daily.co room in new tab

3. **Automatic Status Updates:**
   - Session datetime + 1 hour passes → Status changes to 'completed'
   - "Leave Review" button appears on past session

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-006-session-management/feature-implementation-plan.md`

### Recommended Story Order
1. MYM-29 (Session dashboard) - Foundation, booking list
2. MYM-30 (Video call link) - Core session delivery
3. MYM-31 (Cancellation) - Flexibility feature

### Estimated Effort
- **Development:** 2-3 sprints (4-6 weeks)
- **Testing:** 0.5 sprint (1 week)
- **Total:** 3-4 sprints

---

## Design Considerations

### Session Dashboard Layout
```
My Sessions

[Upcoming] [Past]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Upcoming Session - Friday, Nov 15

[Photo] Carlos Rodriguez
        Senior Full-Stack Architect

Friday, Nov 15, 2025 at 10:00 AM EST
Duration: 1 hour

[Join Call]  [Cancel Session]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Empty state (no sessions):
╔══════════════════════════════════╗
║  📅 No upcoming sessions         ║
║                                  ║
║  Ready to book your first        ║
║  mentorship session?             ║
║                                  ║
║  [Find a Mentor]                 ║
╚══════════════════════════════════╝
```

### Cancellation Modal
```
╔═══════════════════════════════════╗
║ Cancel Session?                   ║
║                                   ║
║ Session with Carlos Rodriguez     ║
║ Friday, Nov 15 at 10:00 AM        ║
║                                   ║
║ ⚠️ This action cannot be undone.  ║
║ You will receive a full refund.   ║
║                                   ║
║ [Go Back]  [Yes, Cancel Session]  ║
╚═══════════════════════════════════╝
```

### Video Call Button States
```
>24h before: [Cancel Session]
15min before: [Join Call] (green, prominent)
During session: [Join Call] (pulsing)
After session: [Completed] (disabled)
```

---

## Notes

- Daily.co free tier is sufficient for MVP (10,000 min/month = ~167 hours)
- Video call rooms should expire automatically to prevent abuse
- Consider adding "Test Video" feature for first-time users
- Monitor video call join rates to identify UX issues
- Future: Add calendar export (.ics download) from dashboard

---

## Related Documentation

- **PRD:** `.context/PRD/user-journeys.md` (Post-booking journey)
- **SRS:** `.context/SRS/functional-specs.md` (FR-012)
- **SRS:** `.context/SRS/non-functional-specs.md` (NFR-003: Performance)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API:** `.context/SRS/api-contracts.yaml`
