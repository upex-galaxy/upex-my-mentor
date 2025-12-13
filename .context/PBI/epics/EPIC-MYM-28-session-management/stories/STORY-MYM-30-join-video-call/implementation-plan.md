# Implementation Plan: STORY-MYM-30 - Communication Channel Agreement

**Fecha:** 2025-12-13
**Developer:** AI-Generated
**Story Jira Key:** MYM-30
**Epic:** EPIC-MYM-28 - Session Management
**Status:** Ready for Implementation

---

## Overview

Implement the "Communication Channel Agreement" feature that allows mentors to configure their preferred communication channels and mentees to select their preference during booking. This replaces the previous video call integration approach (Daily.co) with a user-defined communication system.

**Acceptance Criteria to fulfill:**
- Mentors can configure available communication channels in profile settings
- Mentees can see and select from mentor's channels during booking
- Session dashboard displays agreed communication channel(s)
- Mentors can add session-specific meeting links
- Both parties can access communication details from the dashboard

---

## Technical Approach

**Chosen approach:** Multi-channel configuration with booking-time selection

**Alternatives considered:**
- **Fixed platform integration (Daily.co):** More control but costly, vendor lock-in, complex
- **Single channel per mentor:** Too restrictive, doesn't match user preferences
- **Free-text communication field:** No structure, hard to display consistently

**Why this approach:**
- Flexibility for users to choose familiar tools
- No external dependencies or costs
- Clear UX with structured channel options
- Scalable without per-minute video costs

---

## Database Schema

### Step 1: Create `communication_channels` Table

```sql
-- Migration: create_communication_channels_table
CREATE TABLE communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL CHECK (channel_type IN (
    'whatsapp', 'slack', 'email', 'google_meet',
    'zoom', 'discord', 'teams', 'skype', 'telegram'
  )),
  handle TEXT, -- Optional: phone, username, meeting link, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_type)
);

-- RLS Policies
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;

-- Anyone can view active channels (needed for booking flow)
CREATE POLICY "Anyone can view active channels"
  ON communication_channels FOR SELECT
  USING (is_active = true);

-- Users can manage their own channels
CREATE POLICY "Users can manage own channels"
  ON communication_channels FOR ALL
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_communication_channels_user_id ON communication_channels(user_id);
CREATE INDEX idx_communication_channels_active ON communication_channels(user_id, is_active) WHERE is_active = true;
```

### Step 2: Extend `bookings` Table

```sql
-- Migration: add_communication_to_bookings
ALTER TABLE bookings
  ADD COLUMN communication_channels JSONB DEFAULT '[]',
  ADD COLUMN session_meeting_link TEXT;

-- Example communication_channels value:
-- [{"type": "google_meet", "handle": "mentor@gmail.com"}, {"type": "slack"}]

COMMENT ON COLUMN bookings.communication_channels IS 'JSON array of agreed communication channels for the session';
COMMENT ON COLUMN bookings.session_meeting_link IS 'Mentor-provided meeting link for the specific session';
```

---

## UI/UX Design

### Communication Preferences Page (Mentor Settings)

**Location:** `/dashboard/settings/communication` or `/settings/communication`

```
┌─────────────────────────────────────────────────────────────┐
│  Communication Preferences                                   │
│                                                             │
│  Select how you'd like to communicate with your mentees.    │
│  You can enable multiple channels.                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] 📹 Google Meet                                   │   │
│  │     Personal meeting link (optional):                │   │
│  │     [https://meet.google.com/xxx-xxxx-xxx_________]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] 📹 Zoom                                          │   │
│  │     Personal meeting ID (optional):                  │   │
│  │     [https://zoom.us/j/1234567890________________]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [ ] 💬 Slack                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] 💬 WhatsApp                                      │   │
│  │     Phone number (optional):                         │   │
│  │     [+1 234 567 8900_____________________________]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ... (more channels)                                        │
│                                                             │
│  ⚠️ Select at least one channel to receive bookings.        │
│                                                             │
│  [Save Preferences]                                         │
└─────────────────────────────────────────────────────────────┘
```

### Channel Selection (Booking Flow Step)

**Location:** Step in `/mentors/[id]/book` flow

```
┌─────────────────────────────────────────────────────────────┐
│  How would you like to communicate?                         │
│                                                             │
│  Carlos is available on:                                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [ ] 📹 Google Meet                                     │ │
│  │     Carlos will share the meeting link before session  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [✓] 📹 Zoom                                            │ │
│  │     Carlos will share the meeting link before session  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [ ] 💬 WhatsApp                                        │ │
│  │     You'll receive Carlos's contact after booking      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  💡 Select one or more options. You can use multiple       │
│     channels (e.g., Slack for chat + Zoom for video).      │
│                                                             │
│  [← Back]                           [Continue to Payment →] │
└─────────────────────────────────────────────────────────────┘
```

### Session Card (Dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│  Upcoming Session                                           │
│                                                             │
│  ┌──────┐  Carlos Rodriguez                                 │
│  │ 👤   │  Senior Full-Stack Architect                      │
│  └──────┘                                                   │
│                                                             │
│  📅 Friday, Dec 20, 2025 at 10:00 AM (your time)           │
│  ⏱️  60 minutes                                             │
│                                                             │
│  ────────────────────────────────────────────────────────── │
│  📹 Communication: Zoom                                     │
│  [Join via Zoom] ← if link provided                         │
│  or "Waiting for mentor to share link"                      │
│  ────────────────────────────────────────────────────────── │
│                                                             │
│  [Cancel Session]                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Types & Type Safety

```typescript
// src/types/communication.ts

export type CommunicationChannelType =
  | 'whatsapp'
  | 'slack'
  | 'email'
  | 'google_meet'
  | 'zoom'
  | 'discord'
  | 'teams'
  | 'skype'
  | 'telegram'

export interface CommunicationChannel {
  id: string
  userId: string
  channelType: CommunicationChannelType
  handle: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BookingCommunication {
  type: CommunicationChannelType
  handle?: string
}

// Channel metadata for UI
export const CHANNEL_CONFIG: Record<CommunicationChannelType, {
  label: string
  icon: string // Lucide icon name
  handleLabel: string
  handlePlaceholder: string
  requiresLink: boolean // If true, mentor should provide link
}> = {
  whatsapp: {
    label: 'WhatsApp',
    icon: 'MessageCircle',
    handleLabel: 'Phone number',
    handlePlaceholder: '+1 234 567 8900',
    requiresLink: false
  },
  slack: {
    label: 'Slack',
    icon: 'Hash',
    handleLabel: 'Workspace/Channel',
    handlePlaceholder: 'team.slack.com or #channel',
    requiresLink: false
  },
  email: {
    label: 'Email',
    icon: 'Mail',
    handleLabel: 'Email address',
    handlePlaceholder: 'Provided from profile',
    requiresLink: false
  },
  google_meet: {
    label: 'Google Meet',
    icon: 'Video',
    handleLabel: 'Personal meeting link',
    handlePlaceholder: 'https://meet.google.com/xxx-xxxx-xxx',
    requiresLink: true
  },
  zoom: {
    label: 'Zoom',
    icon: 'Video',
    handleLabel: 'Personal meeting ID/link',
    handlePlaceholder: 'https://zoom.us/j/1234567890',
    requiresLink: true
  },
  discord: {
    label: 'Discord',
    icon: 'Headphones',
    handleLabel: 'Server/Username',
    handlePlaceholder: 'username#1234 or server invite',
    requiresLink: false
  },
  teams: {
    label: 'Microsoft Teams',
    icon: 'Users',
    handleLabel: 'Meeting link',
    handlePlaceholder: 'https://teams.microsoft.com/...',
    requiresLink: true
  },
  skype: {
    label: 'Skype',
    icon: 'Phone',
    handleLabel: 'Skype username',
    handlePlaceholder: 'username',
    requiresLink: false
  },
  telegram: {
    label: 'Telegram',
    icon: 'Send',
    handleLabel: 'Username',
    handlePlaceholder: '@username',
    requiresLink: false
  }
}
```

---

## Implementation Steps

### **Step 1: Database Migrations**

**Task:** Create migration for communication_channels table and bookings extension

**File:** `supabase/migrations/YYYYMMDDHHMMSS_add_communication_channels.sql`

**Estimated time:** 30 min

---

### **Step 2: Create Types and Constants**

**Task:** Add TypeScript types for communication channels

**File:** `src/types/communication.ts`

**Details:**
- Define CommunicationChannelType enum
- Create CHANNEL_CONFIG with UI metadata
- Add BookingCommunication interface

**Estimated time:** 20 min

---

### **Step 3: Create Communication Preferences API**

**Task:** API routes for mentor channel configuration

**Files:**
- `src/app/api/users/[id]/communication-channels/route.ts` (GET)
- `src/app/api/users/me/communication-channels/route.ts` (PUT)

**Details:**
```typescript
// GET /api/users/:id/communication-channels
// Returns active channels for a user (public for booking flow)

// PUT /api/users/me/communication-channels
// Updates authenticated user's channel configuration
// Body: { channels: [{ type: 'zoom', handle: '...', isActive: true }] }
```

**Estimated time:** 45 min

---

### **Step 4: Create Communication Preferences UI**

**Task:** Settings page for mentors to configure channels

**Files:**
- `src/app/(dashboard)/settings/communication/page.tsx`
- `src/components/settings/communication-preferences.tsx`
- `src/components/settings/channel-checkbox.tsx`

**Details:**
- Fetch current channels on mount
- Checkbox + optional handle input for each channel
- Validation: at least one channel required
- Save button with loading state

**Estimated time:** 1.5 hours

---

### **Step 5: Create Channel Selector for Booking Flow**

**Task:** Multi-select component for mentee to choose channels

**Files:**
- `src/components/booking/channel-selector.tsx`

**Details:**
- Receive mentor's active channels as props
- Multi-select checkboxes
- At least one required to proceed
- Pass selected channels to booking creation

**Estimated time:** 1 hour

---

### **Step 6: Update Booking Creation**

**Task:** Store communication_channels when creating booking

**File:** `src/app/api/bookings/route.ts` (update POST)

**Details:**
- Accept `communicationChannels` in request body
- Validate channels exist in mentor's active channels
- Store as JSONB in bookings table

**Estimated time:** 30 min

---

### **Step 7: Create Meeting Link API**

**Task:** API for mentor to add session-specific meeting link

**File:** `src/app/api/bookings/[id]/meeting-link/route.ts`

**Details:**
```typescript
// PATCH /api/bookings/:id/meeting-link
// Only mentor can update
// Body: { meetingLink: 'https://...' }
// Triggers notification to mentee
```

**Estimated time:** 30 min

---

### **Step 8: Update Session Dashboard**

**Task:** Display communication details in session cards

**File:** Update `src/components/sessions/session-card.tsx`

**Details:**
- Show channel icon and label
- If `session_meeting_link` exists, show clickable button
- If no link and channel requires one, show "Waiting for mentor..."
- For mentor view: show "Add Meeting Link" button if not set

**Estimated time:** 1 hour

---

### **Step 9: Create Add Meeting Link Modal**

**Task:** Modal for mentor to add meeting link

**File:** `src/components/sessions/add-meeting-link-modal.tsx`

**Details:**
- Text input for URL
- Optional URL format validation (warning only)
- Save button calls PATCH API
- Success refreshes session card

**Estimated time:** 45 min

---

### **Step 10: Testing**

**Task:** Unit, integration, and E2E tests

**Files:**
- `tests/unit/communication-channels.test.ts`
- `tests/integration/booking-with-channels.test.ts`
- `tests/e2e/communication-preferences.spec.ts`

**Estimated time:** 2 hours

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/:id/communication-channels` | Get user's active channels | Public |
| PUT | `/api/users/me/communication-channels` | Update user's channels | Required |
| GET | `/api/bookings/:id/communication` | Get booking's communication details | Participant only |
| PATCH | `/api/bookings/:id/meeting-link` | Add/update session meeting link | Mentor only |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mentor doesn't provide link in time | High | Reminder email 24h before; in-platform messaging |
| Invalid/broken meeting links | Medium | URL format warning; trust-based system |
| User confusion about multiple channels | Low | Clear UI labels; help text |
| Migration affects existing bookings | Low | Add columns as nullable; no breaking changes |

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. Database migrations | 30 min |
| 2. Types and constants | 20 min |
| 3. Communication Preferences API | 45 min |
| 4. Communication Preferences UI | 1.5 hours |
| 5. Channel Selector component | 1 hour |
| 6. Update Booking creation | 30 min |
| 7. Meeting Link API | 30 min |
| 8. Update Session Dashboard | 1 hour |
| 9. Add Meeting Link Modal | 45 min |
| 10. Testing | 2 hours |
| **Total** | **~9 hours** |

**Story points:** 5 (Medium-High complexity, multiple components)

---

## Definition of Done Checklist

- [ ] Database migration applied successfully
- [ ] All API endpoints implemented and tested
- [ ] Communication Preferences page functional
- [ ] Channel Selector integrated in booking flow
- [ ] Session Dashboard shows communication details
- [ ] Mentor can add meeting links
- [ ] All Acceptance Criteria passing
- [ ] Unit tests >80% coverage
- [ ] E2E tests cover critical flows
- [ ] Code review approved
- [ ] `bun run lint` passes
- [ ] `bun run build` passes
- [ ] Deployed to staging
- [ ] Manual smoke test passed

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-13 | PO | Complete rewrite: From Daily.co video integration to user-defined communication channels |
| 2025-12-08 | AI | Original implementation plan for video call integration |
