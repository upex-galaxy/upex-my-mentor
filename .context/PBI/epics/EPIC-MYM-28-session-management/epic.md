# EPIC-006: Session Management

**Jira Key:** MYM-28
**Status:** ASSIGNED
**Priority:** HIGH
**Phase:** Enhanced UX (Sprint 7)
**Last Updated:** 2025-12-13

---

## Epic Description

This epic provides users with the tools necessary to manage their mentorship sessions throughout their entire lifecycle - from booking confirmation through session completion. It includes a dashboard for viewing upcoming and past sessions, communication channel coordination for conducting sessions, and cancellation functionality with proper business rules.

**Business Value:**
Session management is critical for user experience and retention:
- **Reduces support overhead:** Self-service dashboard reduces "where's my session?" questions
- **Flexibility in communication:** Users choose their preferred tools (Zoom, Google Meet, WhatsApp, etc.)
- **Increases session completion:** Clear communication details reduce no-shows
- **Flexibility builds trust:** Clear cancellation policy reduces booking anxiety
- **Retention driver:** Good post-booking UX encourages repeat bookings

Without this epic, users would have bookings but no way to manage or access them effectively.

---

## User Stories

1. **MYM-29** - As a user, I want a simple dashboard where I can see my upcoming and past sessions so that I can manage my schedule
2. **MYM-30** - As a user, I want to agree on communication channels for my session so that we can coordinate how we'll meet without the platform enforcing a specific video tool
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
  - Communication channel(s) agreed for the session
  - Meeting link button (if mentor has provided one)
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

**Communication Channel Agreement:**
- Mentors configure their preferred communication channels in profile settings
- Supported channels: WhatsApp, Slack, Email, Google Meet, Zoom, Discord, Microsoft Teams, Skype, Telegram
- Mentors can optionally provide handles/links for each channel
- During booking, mentees see mentor's available channels and select preference
- Session stores the agreed communication method(s)
- Mentors can add session-specific meeting links (e.g., unique Google Meet link)
- Dashboard displays communication details clearly

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
  - `no_show` → no activity confirmation (future)
- Status visible on dashboard

### Out of Scope (Future)

- **In-platform video calling:** We do NOT integrate Daily.co, Whereby, Jitsi, or any embedded video solution
- **Automatic link generation:** Users provide their own meeting links
- **Verification of communication handles:** Trust-based system
- Session recording
- Shared note-taking during session
- Post-session summary/action items
- Rescheduling (only cancellation supported in MVP)
- Session duration tracking (actual time spent)
- No-show detection and penalties

---

## Acceptance Criteria (Epic Level)

1. Dashboard displays all user's bookings (upcoming and past)
2. Upcoming sessions are sorted by date (nearest first)
3. Past sessions are sorted by date (most recent first)
4. Mentors can configure their available communication channels
5. Mentees can select preferred communication channel during booking
6. Session dashboard shows agreed communication channel(s) and contact details
7. Mentors can add/update session-specific meeting links
8. Users can cancel sessions >24 hours before start time
9. Cancellation within 24 hours shows error message (not allowed)
10. Cancelled sessions trigger automatic refund (EPIC-005)
11. Both parties receive cancellation email within 5 minutes
12. Session status updates automatically based on time
13. Dashboard loads in <2 seconds with 100+ sessions

---

## Related Functional Requirements

- **FR-012:** El sistema debe permitir a los usuarios coordinar la comunicación para las sesiones

**Note:** This epic introduces additional requirements:
- **FR-SM-001:** El sistema debe permitir a los usuarios visualizar sus sesiones programadas
- **FR-SM-002:** El sistema debe permitir a los usuarios cancelar sesiones con >24h de anticipación
- **FR-SM-003:** El sistema debe actualizar automáticamente el estado de las sesiones
- **FR-SM-004:** El sistema debe permitir a mentores configurar sus canales de comunicación preferidos
- **FR-SM-005:** El sistema debe permitir a mentees seleccionar canal de comunicación durante el booking

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Communication Channel System

**Philosophy: User-Defined Communication**

Rather than building or integrating video infrastructure, we let users coordinate their own communication methods. This approach:
- Reduces platform complexity and costs
- Respects user preferences and existing workflows
- Avoids vendor lock-in with video SaaS providers
- Scales without per-minute video costs

**Implementation:**

```typescript
// Communication channel types
type CommunicationChannelType =
  | 'whatsapp'
  | 'slack'
  | 'email'
  | 'google_meet'
  | 'zoom'
  | 'discord'
  | 'teams'
  | 'skype'
  | 'telegram'

interface CommunicationChannel {
  type: CommunicationChannelType
  handle?: string  // Phone, username, link, etc.
  isActive: boolean
}

// When booking is confirmed, store agreed channels
interface BookingCommunication {
  selectedChannels: CommunicationChannelType[]
  sessionMeetingLink?: string  // Mentor can add specific link
}
```

### Database Schema Extensions

**New Table: `communication_channels`**
```sql
CREATE TABLE communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  handle TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_type)
);

-- RLS policies
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;

-- Users can read any mentor's active channels (for booking)
CREATE POLICY "Public can view active mentor channels"
  ON communication_channels FOR SELECT
  USING (is_active = true);

-- Users can manage their own channels
CREATE POLICY "Users can manage own channels"
  ON communication_channels FOR ALL
  USING (auth.uid() = user_id);
```

**Extend `bookings` Table:**
```sql
ALTER TABLE bookings ADD COLUMN communication_channels JSONB DEFAULT '[]';
-- Example: [{"type": "google_meet", "handle": "mentor@gmail.com"}]

ALTER TABLE bookings ADD COLUMN session_meeting_link TEXT;
-- Mentor can add the specific meeting link for this session

ALTER TABLE bookings ADD COLUMN cancelled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN cancelled_by UUID REFERENCES profiles(id);
ALTER TABLE bookings ADD COLUMN cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN refund_issued BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN refund_amount NUMERIC;
```

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

```typescript
// Cancellation validation
function canCancel(booking: Booking): boolean {
  const now = new Date()
  const sessionStart = new Date(booking.session_datetime)
  const hoursUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60)

  return hoursUntilSession > 24 && booking.status === 'confirmed'
}

// Cancellation flow
async function cancelBooking(bookingId: string, userId: string) {
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

**Session Management:**
- `GET /api/bookings` - List user's bookings
  - Query params: `?status=upcoming|past&limit=20`
  - Response: Array of bookings with mentor/mentee details and communication info

- `GET /api/bookings/:id` - Get booking details
  - Includes communication channels and meeting link

- `POST /api/bookings/:id/cancel` - Cancel a booking
  - Validates 24-hour rule
  - Returns: Updated booking with refund details

**Communication Channels:**
- `GET /api/users/:id/communication-channels` - Get user's configured channels
  - Public endpoint for viewing mentor's available channels

- `PUT /api/users/me/communication-channels` - Update current user's channels
  - Requires authentication
  - Body: Array of channel configurations

- `GET /api/bookings/:id/communication` - Get session communication details
  - Returns agreed channels and any meeting link

- `PATCH /api/bookings/:id/meeting-link` - Mentor adds/updates session link
  - Only mentor of the booking can update
  - Sends notification to mentee when link is added

---

## Dependencies

### External Dependencies
- Email service for cancellation and communication notifications
- ~~Video call service (Daily.co, Whereby, or Jitsi)~~ **REMOVED - User-defined communication**

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
- >95% sessions have communication channel configured
- <1% cancelled sessions due to communication issues
- <5% cancellations (indicates booking confidence)
- 0 invalid refunds (proper validation)

### Business Metrics
- 85% session completion rate (booked → completed)
- <10% no-show rate
- 60% users access dashboard at least once per week
- 40% users leave review after session (indicates engagement)

### UX Metrics
- Average time to find communication details: <10 seconds
- <2% support tickets about "can't find how to connect"
- Dashboard engagement: 3+ page views per user per month

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User doesn't provide meeting link in time | High | Medium | Reminder email 24h before session; in-platform messaging to coordinate |
| Invalid/broken meeting links | Medium | Medium | UI shows warning if link format is incorrect; support contact visible |
| Abuse of cancellation policy (repeated cancellations) | Medium | Medium | Track cancellation rate per user, flag frequent cancellers |
| Refund processing failures | High | Low | Robust error handling, manual refund dashboard for admins |
| Timezone confusion on dashboard | Medium | Medium | Always display user's local time, show timezone label |
| Communication channel confusion | Low | Medium | Clear icons and labels; email reminder includes all details |

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-MYM-28-session-management/feature-test-plan.md`

### Test Coverage Requirements
- **Unit Tests:** Cancellation validation logic, status transitions (>90% coverage)
- **Integration Tests:** Channel configuration, booking with channels
- **E2E Tests:** Full dashboard navigation, communication channel setup
- **Load Tests:** Dashboard performance with 1000+ bookings

### Critical Test Scenarios

1. **Communication Channel Configuration:**
   - Mentor adds multiple channels → Saved correctly
   - Mentor with no channels tries to go live → Error message

2. **Booking with Channel Selection:**
   - Mentee selects channel during booking → Stored in booking
   - Mentor adds meeting link → Visible to mentee

3. **24-Hour Cancellation Rule:**
   - Attempt to cancel session 25 hours before → Success
   - Attempt to cancel session 23 hours before → Fail with error

4. **Dashboard Display:**
   - Session shows correct communication channel
   - Meeting link is clickable when provided
   - Missing link shows appropriate message

---

## Implementation Plan

See: `.context/PBI/epics/EPIC-MYM-28-session-management/feature-implementation-plan.md`

### Recommended Story Order
1. MYM-29 (Session dashboard) - Foundation, booking list
2. MYM-30 (Communication channels) - Core coordination feature
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

📹 Communication: Google Meet
   [Join via Google Meet] ← Clickable if link provided
   or "Waiting for mentor to share link"

[Cancel Session]
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

### Communication Channel Selection (Booking Flow)
```
╔═══════════════════════════════════════════════════╗
║ How would you like to communicate?                ║
║                                                   ║
║ Carlos is available on:                           ║
║                                                   ║
║ [ ] 📹 Google Meet                                ║
║ [ ] 📹 Zoom                                       ║
║ [✓] 💬 Slack (preferred)                          ║
║                                                   ║
║ Select one or more options. The mentor will       ║
║ share the meeting details before the session.     ║
║                                                   ║
║ [Back]                    [Continue to Payment]   ║
╚═══════════════════════════════════════════════════╝
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

---

## Notes

- User-defined communication reduces platform complexity and costs
- Email reminders should include all communication details (channel + link if available)
- Consider adding "Remind mentor to share link" button if 24h before and no link
- Future: Add calendar export (.ics download) from dashboard with communication details
- In-platform messaging (EPIC-MYM-55) can be used for coordination if needed

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-13 | PO | Major refactoring: Replaced video call integration (Daily.co) with user-defined communication channels. Updated MYM-30, scope, technical considerations, and all related sections. |
| 2025-11-XX | AI | Original epic created with Daily.co video integration |

---

## Related Documentation

- **PRD:** `.context/PRD/user-journeys.md` (Post-booking journey)
- **SRS:** `.context/SRS/functional-specs.md` (FR-012)
- **SRS:** `.context/SRS/non-functional-specs.md` (NFR-003: Performance)
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API:** `.context/SRS/api-contracts.yaml`
