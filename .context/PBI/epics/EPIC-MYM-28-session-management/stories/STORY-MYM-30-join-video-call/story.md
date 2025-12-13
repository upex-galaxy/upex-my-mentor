# STORY-MYM-30: Communication Channel Agreement

**Jira Key:** MYM-30
**Epic:** MYM-28 - Session Management
**Status:** REFINEMENT
**Priority:** Medium
**Last Updated:** 2025-12-13

---

## User Story

As a user (mentor or mentee), I want to agree on communication channels for my session so that we can coordinate how we'll meet without the platform enforcing a specific video tool

---

## Description

Instead of integrating a third-party video conferencing service (like Daily.co, Whereby, or Zoom SDK), the platform allows mentors and mentees to agree on their preferred communication methods. This approach:

- **Gives flexibility:** Users can choose WhatsApp, Slack, Google Meet, Zoom, or any tool they're comfortable with
- **Reduces complexity:** No need to maintain video infrastructure or pay for SaaS integrations
- **Respects preferences:** Senior engineers often have preferred tools; students may prefer free options
- **Enables multiple channels:** A session might use Slack for chat + Google Meet for video

The mentor configures their preferred/available communication channels in their profile. When a mentee books a session, they can see the mentor's available channels and select their preference. Both parties then have visibility into the agreed communication method(s) and relevant contact details.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentor configures communication channels

* **Given:** A mentor is logged in and viewing their profile settings
* **When:** They navigate to the "Communication Preferences" section
* **Then:** They see a list of available communication channels (WhatsApp, Slack, Email, Google Meet, Zoom, Discord, Microsoft Teams, Skype, Telegram)
* **And:** They can select one or more channels they're willing to use
* **And:** For each selected channel, they can optionally provide their handle/link (e.g., Zoom personal meeting link, Slack workspace invite, WhatsApp number)
* **And:** They must select at least one channel to save

### Scenario 2: Mentee sees communication options during booking

* **Given:** A mentee is booking a session with a mentor
* **And:** The mentor has configured at least one communication channel
* **When:** The mentee reaches the booking confirmation step
* **Then:** They see the mentor's available communication channels
* **And:** They can select their preferred channel(s) for the session
* **And:** The booking is created with the agreed communication method stored

### Scenario 3: Session dashboard displays communication details

* **Given:** A user (mentor or mentee) has an upcoming session
* **When:** They view the session on their dashboard
* **Then:** They see the agreed communication channel(s) for that session
* **And:** They see relevant contact information (e.g., "Google Meet - Mentor will share link" or "WhatsApp: +1234567890")
* **And:** If the mentor provided a meeting link, it's displayed as a clickable button

### Scenario 4: Mentor provides session-specific link

* **Given:** A mentor has an upcoming session
* **And:** The agreed communication channel is Google Meet or Zoom
* **When:** The mentor views the session on their dashboard
* **Then:** They can add/update the specific meeting link for that session
* **And:** The mentee can see this link once the mentor provides it

---

## Communication Channels Supported

| Channel | Icon | Requires Handle | Notes |
|---------|------|-----------------|-------|
| WhatsApp | MessageCircle | Optional (phone) | Popular for quick coordination |
| Slack | Slack icon | Optional (workspace/channel) | Common in tech teams |
| Email | Mail | Provided by profile | Already available from user profile |
| Google Meet | Video | Optional (personal meeting link) | Free, widely used |
| Zoom | Video | Optional (PMI link) | Most common for meetings |
| Discord | Headphones | Optional (server/username) | Popular in dev communities |
| Microsoft Teams | Users | Optional (meeting link) | Enterprise environments |
| Skype | Phone | Optional (username) | Legacy but still used |
| Telegram | Send | Optional (username) | Privacy-focused option |

---

## Technical Notes

### Database Schema

**New table: `communication_channels`**
```sql
CREATE TABLE communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL, -- 'whatsapp', 'slack', 'email', 'google_meet', 'zoom', 'discord', 'teams', 'skype', 'telegram'
  handle TEXT, -- Optional: phone number, username, meeting link, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_type)
);
```

**Extend `bookings` table:**
```sql
ALTER TABLE bookings ADD COLUMN communication_channels JSONB;
-- Example: [{"type": "google_meet", "handle": null, "session_link": "https://meet.google.com/abc-xyz"}]

ALTER TABLE bookings ADD COLUMN session_meeting_link TEXT;
-- Mentor can add the specific meeting link for this session
```

### API Endpoints

- `GET /api/users/:id/communication-channels` - Get user's configured channels
- `PUT /api/users/me/communication-channels` - Update mentor's channel preferences
- `GET /api/bookings/:id/communication` - Get session communication details
- `PATCH /api/bookings/:id/meeting-link` - Mentor adds/updates session meeting link

### Frontend Components

- `CommunicationPreferences` - Settings component for mentors to configure channels
- `ChannelSelector` - Booking step component to select preferred channel
- `SessionCommunicationCard` - Dashboard component showing how to connect

---

## Definition of Done

* [ ] Mentors can configure their available communication channels in profile settings
* [ ] Mentees see and select communication preference during booking
* [ ] Session dashboard shows agreed communication channel with contact details
* [ ] Mentors can add session-specific meeting links
* [ ] Unit tests for channel configuration logic (>80% coverage)
* [ ] Integration tests for booking with channel selection
* [ ] E2E tests cover mentor setup and mentee booking flow
* [ ] Code review completed and approved
* [ ] All related documentation updated
* [ ] Deployed to staging environment

---

## Out of Scope

- Automatic link generation (users provide their own links)
- In-platform video calling (embedded player)
- Verification of handles/links (trust-based system)
- Direct messaging through the platform (see EPIC-MYM-55 for messaging)

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-28-session-management/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-28-session-management/stories/STORY-MYM-30-join-video-call/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-28-session-management/stories/STORY-MYM-30-join-video-call/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-30

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-13 | PO | Complete refactoring: from "Join Video Call" (Daily.co integration) to "Communication Channel Agreement" (user-defined channels) |
| 2025-11-21 | AI | Original story created with video call integration focus |
