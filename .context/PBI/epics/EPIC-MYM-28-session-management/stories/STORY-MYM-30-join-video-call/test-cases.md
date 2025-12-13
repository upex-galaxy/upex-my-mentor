# Test Cases: STORY-MYM-30 - Communication Channel Agreement

**Fecha:** 2025-12-13
**QA Engineer:** AI-Generated (Shift-Left Testing)
**Story Jira Key:** MYM-30
**Epic:** EPIC-MYM-28 - Session Management
**Status:** Ready for Review

---

## FASE 1: Critical Analysis

### Business Context of This Story

**User Personas Affected:**

- **Primary: Laura (Desarrolladora Junior)** - As a mentee, she wants flexibility to use communication tools she's comfortable with (Google Meet, Slack).
- **Primary: Carlos (Arquitecto Senior)** - As a mentor, he prefers using his existing Zoom account or Slack for professional communication.

**Business Value:**

- **Flexibility:** Users aren't forced into a specific video platform they may not like or trust
- **Cost Reduction:** No need to pay for video SaaS integrations (Daily.co, Whereby)
- **User Experience:** Senior engineers often have preferred tools; respecting this builds trust
- **Reduced Friction:** Mentees can choose familiar communication methods

**KPI Impact:**
- Session completion rate (users more likely to show up when using familiar tools)
- User satisfaction (autonomy in communication choice)
- Reduced support tickets (no "video link not working" issues)

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**
- `CommunicationPreferences` - Mentor profile settings component
- `ChannelSelector` - Multi-select during booking flow
- `SessionCommunicationCard` - Dashboard display of agreed channels
- Pages: `/settings/communication`, `/mentors/[id]/book` (step), `/dashboard/sessions`

**Backend:**
- **New Table:** `communication_channels` for mentor preferences
- **Extended Table:** `bookings` with `communication_channels` JSONB and `session_meeting_link`
- **API Endpoints:**
  - `GET/PUT /api/users/:id/communication-channels`
  - `PATCH /api/bookings/:id/meeting-link`

**Integration Points:**
- Booking flow must fetch mentor's channels
- Dashboard must display agreed channels from booking
- Mentor must be able to update session-specific link

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**
- **Business logic complexity:** Low - Simple CRUD for channel preferences
- **Integration complexity:** Medium - Touches booking flow and dashboard
- **Data validation complexity:** Medium - Optional handle validation (URL format for meeting links)
- **UI complexity:** Medium - Multi-select UI, conditional display logic

**Estimated Test Effort:** Medium

---

## FASE 2: Story Quality Analysis

### Clarifications Needed

**Clarification 1: Minimum Channels Required**
- **Question:** Must a mentor have at least one channel configured to accept bookings?
- **Suggested Answer:** Yes - mentors must configure at least one active channel before their profile is discoverable
- **Impact on Testing:** Need to test this validation

**Clarification 2: Email Always Available?**
- **Question:** Since all users have email in their profile, is "Email" always an implicit channel?
- **Suggested Answer:** Yes - Email should always be available as a fallback communication method
- **Impact on Testing:** Email channel should be pre-selected/always available

**Clarification 3: Multiple Channel Selection by Mentee**
- **Question:** Can mentee select multiple channels (e.g., Slack for chat + Zoom for video)?
- **Suggested Answer:** Yes - multi-select is supported based on story description
- **Impact on Testing:** Test multi-select scenarios

---

### Edge Cases Identified

1. **Mentor removes all channels after having bookings** - Existing bookings should retain their agreed channels
2. **Mentor deactivates a channel** - Future bookings shouldn't show it, but current ones keep it
3. **Invalid meeting link format** - Should warn but not block (trust-based)
4. **Long meeting link** - Handle links up to 2000 characters
5. **Mentee books but mentor hasn't set channels** - Should not be possible (validation)

---

## FASE 3: Refined Acceptance Criteria

### Scenario 1: Mentor configures communication channels

- **Given:** A mentor is logged in and on their profile settings page
- **When:** They navigate to the "Communication Preferences" section
- **Then:** They see all 9 supported channels with checkboxes
- **And:** They can select one or more channels (multi-select)
- **And:** For each selected channel, an optional text field appears for handle/link
- **And:** The "Save" button is disabled if no channels are selected
- **And:** Upon saving, their preferences are persisted to the database

### Scenario 2: Mentee views and selects channels during booking

- **Given:** A mentee is booking a session with a mentor who has 3 active channels
- **When:** They reach the "Communication" step of the booking flow
- **Then:** They see only the mentor's active channels as options
- **And:** They can select one or more channels as their preference
- **And:** At least one channel must be selected to proceed
- **And:** The selected channels are stored with the booking

### Scenario 3: Session dashboard shows communication details

- **Given:** A booking exists with agreed communication channel(s)
- **When:** Either party views the session on their dashboard
- **Then:** They see the channel type with appropriate icon
- **And:** If a session meeting link exists, it's displayed as a clickable button
- **And:** If no meeting link, they see "Waiting for mentor to share link" (for link-based channels)

### Scenario 4: Mentor adds session-specific meeting link

- **Given:** A mentor has an upcoming session
- **And:** The agreed channel is Google Meet or Zoom
- **When:** They click "Add Meeting Link" on the session card
- **Then:** A modal/input appears for them to paste the link
- **And:** Upon saving, the link is stored and visible to the mentee
- **And:** The mentee receives a notification (email) that the link was added

---

## FASE 4: Test Design

### Test Coverage Summary

| Category | Count |
|----------|-------|
| Positive | 8 |
| Negative | 5 |
| Boundary | 3 |
| Security | 2 |
| **Total** | **18** |

---

### Individual Test Cases

#### **TC-001: Mentor saves multiple communication channels**

- **Type:** Positive | **Priority:** Critical | **Level:** E2E
- **Preconditions:** Mentor is logged in, on settings page
- **Steps:**
  1. Navigate to Communication Preferences
  2. Select "Google Meet", "Slack", and "WhatsApp"
  3. Add handle for Slack: "mentorteam.slack.com"
  4. Click "Save Preferences"
- **Expected Result:**
  - Success toast appears
  - Database shows 3 active channels for user
  - Handles are stored correctly

---

#### **TC-002: Mentor cannot save with zero channels selected**

- **Type:** Negative | **Priority:** High | **Level:** E2E
- **Preconditions:** Mentor is logged in, has existing channels
- **Steps:**
  1. Navigate to Communication Preferences
  2. Deselect all channels
  3. Observe Save button state
- **Expected Result:**
  - Save button is disabled
  - Helper text: "Select at least one communication channel"

---

#### **TC-003: Mentee sees only mentor's active channels during booking**

- **Type:** Positive | **Priority:** Critical | **Level:** E2E
- **Preconditions:**
  - Mentor has 2 active channels (Zoom, Slack) and 1 inactive (Discord)
  - Mentee is booking a session with this mentor
- **Steps:**
  1. Proceed to Communication step in booking flow
  2. Observe available channel options
- **Expected Result:**
  - Only Zoom and Slack appear as options
  - Discord is NOT visible

---

#### **TC-004: Mentee selects communication channel and completes booking**

- **Type:** Positive | **Priority:** Critical | **Level:** E2E
- **Preconditions:** Mentee is on booking Communication step
- **Steps:**
  1. Select "Google Meet" channel
  2. Proceed to payment
  3. Complete booking
  4. Check database
- **Expected Result:**
  - Booking is created
  - `communication_channels` field contains `[{"type": "google_meet"}]`

---

#### **TC-005: Mentee must select at least one channel**

- **Type:** Negative | **Priority:** High | **Level:** E2E
- **Preconditions:** Mentee is on booking Communication step
- **Steps:**
  1. Do not select any channel
  2. Attempt to proceed
- **Expected Result:**
  - "Continue" button is disabled
  - Error message: "Please select at least one communication method"

---

#### **TC-006: Dashboard displays agreed channel with icon**

- **Type:** Positive | **Priority:** High | **Level:** E2E
- **Preconditions:** Booking exists with `communication_channels: [{"type": "zoom"}]`
- **Steps:**
  1. Navigate to session dashboard
  2. Find the booking card
- **Expected Result:**
  - Channel shows with Zoom icon
  - Text: "Zoom" or "Video Call via Zoom"
  - No meeting link yet: "Waiting for mentor to share link"

---

#### **TC-007: Mentor adds meeting link to session**

- **Type:** Positive | **Priority:** Critical | **Level:** E2E
- **Preconditions:**
  - Mentor has upcoming session
  - Agreed channel is Google Meet
- **Steps:**
  1. Navigate to session dashboard
  2. Click "Add Meeting Link" on session card
  3. Enter: "https://meet.google.com/abc-def-ghi"
  4. Click Save
- **Expected Result:**
  - Link is saved to `session_meeting_link`
  - Dashboard shows clickable "Join via Google Meet" button
  - Mentee receives email notification

---

#### **TC-008: Meeting link is clickable and opens in new tab**

- **Type:** Positive | **Priority:** High | **Level:** E2E
- **Preconditions:** Booking has `session_meeting_link` populated
- **Steps:**
  1. Navigate to session dashboard
  2. Click the meeting link button
- **Expected Result:**
  - New tab opens with the meeting URL
  - Original dashboard remains open

---

#### **TC-009: Only mentor can add meeting link (not mentee)**

- **Type:** Security | **Priority:** Critical | **Level:** API
- **Preconditions:** Booking between Mentor A and Mentee B
- **Steps:**
  1. Authenticate as Mentee B
  2. Call `PATCH /api/bookings/:id/meeting-link` with a link
- **Expected Result:**
  - 403 Forbidden
  - Error: "Only the mentor can add the meeting link"

---

#### **TC-010: Non-participant cannot access booking communication**

- **Type:** Security | **Priority:** Critical | **Level:** API
- **Preconditions:** Booking between Mentor A and Mentee B; User C authenticated
- **Steps:**
  1. Authenticate as User C
  2. Call `GET /api/bookings/:id/communication`
- **Expected Result:**
  - 403 Forbidden
  - Error: "You are not authorized to view this booking"

---

#### **TC-011: Handle/link stored correctly for each channel type**

- **Type:** Positive | **Priority:** Medium | **Level:** Integration
- **Preconditions:** None
- **Steps:**
  1. Configure each channel type with appropriate handle:
     - WhatsApp: "+1234567890"
     - Slack: "team.slack.com"
     - Zoom: "https://zoom.us/j/123456"
     - Discord: "username#1234"
  2. Save and retrieve
- **Expected Result:**
  - All handles stored and retrieved correctly
  - No data corruption

---

#### **TC-012: Long meeting link (boundary)**

- **Type:** Boundary | **Priority:** Low | **Level:** Integration
- **Preconditions:** Mentor has session
- **Steps:**
  1. Add meeting link with 2000 characters
  2. Save
- **Expected Result:**
  - Link is saved successfully
  - Displays correctly (possibly truncated in UI but full link works)

---

#### **TC-013: Invalid URL format for meeting link (warning)**

- **Type:** Negative | **Priority:** Medium | **Level:** E2E
- **Preconditions:** Mentor adding meeting link
- **Steps:**
  1. Enter "not-a-valid-url"
  2. Click Save
- **Expected Result:**
  - Warning toast: "This doesn't look like a valid URL. Please verify."
  - Link is still saved (trust-based system)

---

#### **TC-014: Mentor deactivates channel - existing bookings unaffected**

- **Type:** Boundary | **Priority:** Medium | **Level:** Integration
- **Preconditions:**
  - Mentor has active "Zoom" channel
  - Booking exists with Zoom as agreed channel
- **Steps:**
  1. Mentor deactivates "Zoom" channel
  2. Check existing booking
- **Expected Result:**
  - Existing booking still shows Zoom as agreed channel
  - New bookings don't show Zoom as option

---

#### **TC-015: Mentee can select multiple channels**

- **Type:** Positive | **Priority:** Medium | **Level:** E2E
- **Preconditions:** Mentor has Zoom, Slack, and WhatsApp active
- **Steps:**
  1. During booking, select both "Zoom" and "Slack"
  2. Complete booking
- **Expected Result:**
  - Booking `communication_channels` contains both
  - Dashboard shows both channels

---

#### **TC-016: Email channel is always available as fallback**

- **Type:** Boundary | **Priority:** Medium | **Level:** E2E
- **Preconditions:** Mentor has only configured "Zoom"
- **Steps:**
  1. Mentee goes to book session
  2. Check available channels
- **Expected Result:**
  - Both "Zoom" AND "Email" appear as options
  - Email uses mentor's profile email

---

#### **TC-017: API validation - channel type enum**

- **Type:** Negative | **Priority:** Medium | **Level:** API
- **Preconditions:** None
- **Steps:**
  1. Call PUT channel API with invalid type: `{"type": "invalid_channel"}`
- **Expected Result:**
  - 400 Bad Request
  - Error: "Invalid channel type"

---

#### **TC-018: Dashboard handles missing meeting link gracefully**

- **Type:** Positive | **Priority:** High | **Level:** E2E
- **Preconditions:**
  - Booking with Zoom channel
  - No `session_meeting_link` yet
- **Steps:**
  1. Navigate to session dashboard as mentee
- **Expected Result:**
  - Shows Zoom icon
  - Text: "Waiting for mentor to share link"
  - No broken button or error

---

## FASE 5: Test Matrix Summary

| Test ID | Type | Priority | Level | Scenario |
|---------|------|----------|-------|----------|
| TC-001 | Positive | Critical | E2E | Mentor saves channels |
| TC-002 | Negative | High | E2E | Zero channels validation |
| TC-003 | Positive | Critical | E2E | Mentee sees active channels only |
| TC-004 | Positive | Critical | E2E | Booking stores channel |
| TC-005 | Negative | High | E2E | Mentee must select channel |
| TC-006 | Positive | High | E2E | Dashboard shows channel |
| TC-007 | Positive | Critical | E2E | Mentor adds meeting link |
| TC-008 | Positive | High | E2E | Link opens in new tab |
| TC-009 | Security | Critical | API | Only mentor can add link |
| TC-010 | Security | Critical | API | Non-participant blocked |
| TC-011 | Positive | Medium | Integration | Handle storage |
| TC-012 | Boundary | Low | Integration | Long URL handling |
| TC-013 | Negative | Medium | E2E | Invalid URL warning |
| TC-014 | Boundary | Medium | Integration | Deactivated channel |
| TC-015 | Positive | Medium | E2E | Multi-channel selection |
| TC-016 | Boundary | Medium | E2E | Email fallback |
| TC-017 | Negative | Medium | API | Invalid channel type |
| TC-018 | Positive | High | E2E | Missing link UX |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-13 | PO/QA | Complete rewrite: From video call integration tests to communication channel agreement tests |
| 2025-11-21 | AI | Original test cases for Daily.co video call integration |
