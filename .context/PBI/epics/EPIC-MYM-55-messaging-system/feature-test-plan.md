# Feature Test Plan: EPIC-MYM-55 - Messaging System

**Fecha:** 2025-12-05
**QA Lead:** Gemini AI
**Epic Jira Key:** MYM-55
**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

This epic is a critical **trust-building mechanism** and **engagement driver**. While out of scope for the initial MVP, it's a standard feature in successful mentorship marketplaces (MentorCruise, Clarity.fm) that directly addresses user friction.

**Key Value Proposition:**

- **Reduces Booking Friction:** Allows mentees to clarify doubts about a mentor's expertise *before* committing to a paid session, increasing booking confidence and conversion rates.
- **Builds Trust:** Direct, one-on-one communication fosters a personal connection, which is the foundation of a successful mentorship relationship.
- **Increases Platform Stickiness:** By keeping communication on-platform, it discourages users from moving to off-platform channels (like LinkedIn or email), capturing valuable interaction data and reinforcing the platform's value.

**Success Metrics (KPIs):**

This epic directly enables or impacts the following business goals:
- **Engagement KPIs:**
    - **40% of mentees send a message before first booking:** Directly measures adoption of this feature.
    - **Average 2+ messages exchanged per booking:** Indicates meaningful pre-booking interaction.
    - **Mentor response rate within 24 hours >80%:** A key indicator of mentor engagement and marketplace health.
- **Business KPIs:**
    - **30% increase in booking conversion** for sessions preceded by messaging (Target).
    - Contributes to `>80% mentor retention` by providing a channel to build relationships.

**User Impact:**

- **Laura (Junior Developer):** Can now ask Carlos, "Do you have experience with performance issues in React 19's new compiler?" before booking. This reduces her anxiety about spending money on a session that might not be relevant.
- **Carlos (Senior Architect):** Can quickly gauge a mentee's needs from their initial message, allowing him to accept or decline based on fit and to prepare more effectively for the session, optimizing his time.

**Critical User Journeys:**

This epic introduces a new, optional branch to the primary "Student Registers and Books Session" journey:

- **Journey 1 (Modified):**
  - ...
  - Step 4: Laura reviews Carlos's profile.
  - **Step 4a (NEW):** Laura clicks "Send Message" to ask a clarifying question.
  - **Step 4b (NEW):** Carlos receives a notification and responds via his dashboard.
  - **Step 4c (NEW):** After a brief exchange, Laura feels confident and proceeds to booking.
  - Step 5: Laura selects a time slot and pays.
  - ...

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**
- **New Components:**
    - `SendMessageButton` (on mentor profiles)
    - `MessageComposerModal` (for writing messages)
    - `ConversationsList` (at `/dashboard/messages`)
    - `ConversationThread` (at `/dashboard/messages/[id]`)
    - `MessageBubble` (for individual messages)
    - `NotificationBadge` (in the main navbar)
    - `MessageToast` (for real-time notifications)
- **Pages/Routes Affected:** `/mentors/[id]`, `/dashboard`, and new routes under `/dashboard/messages`.

**Backend:**
- **New API Endpoints:**
    - `POST /api/conversations` (to start a new thread)
    - `POST /api/conversations/{id}/messages` (to send a message)
    - `GET /api/conversations` (to list conversations)
    - `GET /api/conversations/{id}` (to get messages for a thread)
    - `PATCH /api/messages/{id}/read` (to update read status)
- **New Services:**
    - `MessagingService`: Handles logic for creating/sending messages.
    - `NotificationService`: Manages unread counts and triggers real-time events.

**Database:**
- **New Tables:**
    - `conversations`: Tracks conversation threads between two participants. `UNIQUE` constraint on `(participant_1_id, participant_2_id)`.
    - `messages`: Stores individual messages with FKs to `conversations` and `profiles` (sender).
- **RLS Policies:** Critical for this epic. Policies must ensure a user can only read/write to conversations they are a part of.

**External Services:**
- **Supabase Realtime:** The core technology for this epic. The frontend will subscribe to channels to receive new messages and notification updates without polling.

### Integration Points (Critical for Testing)

1.  **Frontend ↔ Supabase Realtime:** The client-side subscription to `postgres_changes` on the `messages` table. This is the most critical and complex integration point.
2.  **Backend (Message Sent) ↔ Supabase Realtime (Broadcast):** When the backend saves a new message, Supabase must correctly broadcast this event to the subscribed clients.
3.  **Mentor Profile ↔ Messaging UI:** The "Send Message" button on the mentor profile must correctly initiate a new conversation or open an existing one.
4.  **Notifications (MYM-58) ↔ Conversation View (MYM-57):** Reading a message must correctly trigger an event to decrement the unread count displayed in the navbar.

**Data Flow (New Message):**
`Mentee (Sender) → POST /api/messages → Backend saves to DB 'messages' table → Supabase broadcasts 'INSERT' event → Mentor's client (Receiver) receives event → UI updates (Toast + Badge)`

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Real-time Connection Instability (High Impact, Medium Likelihood)
-   **What could go wrong:** A user's WebSocket connection to Supabase Realtime is unstable (e.g., on mobile). They might miss incoming messages or notifications, leading to a perception that the feature is "broken."
-   **Mitigation Strategy:**
    1.  Implement a connection status indicator (optional, but good UX).
    2.  On reconnect, the client must automatically re-fetch the latest conversation state and unread count from the API to ensure consistency.
    3.  Use Supabase's built-in reconnection logic.
-   **Test Coverage Required:** E2E tests that simulate network disconnection and reconnection, verifying that the state is correctly synchronized.

#### Risk 2: RLS Policy Failure (Critical Impact, Low Likelihood)
-   **What could go wrong:** A misconfigured Row Level Security policy could allow a user to subscribe to and receive messages from conversations they are not a part of, leading to a massive privacy breach.
-   **Mitigation Strategy:**
    1.  RLS policies must be reviewed by at least two developers.
    2.  Policy: `auth.uid() = participant_1_id OR auth.uid() = participant_2_id` for `conversations`.
    3.  Policy: Check that the sender is the authenticated user for `INSERT` on `messages`.
-   **Test Coverage Required:** A dedicated suite of security tests where User C attempts to read/write to a conversation between User A and User B.

### Business Risks

#### Risk 1: Mentor Ghosting / Slow Response Times (High Impact, High Likelihood)
-   **What could go wrong:** Mentors are busy and don't check the platform frequently. Mentees send pre-booking questions but get no response for days, leading to frustration and lost sales.
-   **Mitigation Strategy:**
    1.  **Effective Notifications (MYM-58):** The real-time badge and toast notifications are the primary mitigation.
    2.  **Dashboard Widget (MYM-59):** Making messages highly visible on the mentor's main dashboard is crucial.
    3.  **(Future) Email Notifications:** If in-app notifications are insufficient, add email fallbacks.
-   **Acceptance Criteria Validation:** The success of this epic is highly dependent on MYM-58 and MYM-59 being effective.

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1 (MYM-56): What happens when a mentee messages a mentor for the first time?**
-   **Question for Dev:** Does clicking "Send Message" first create a `conversations` record and then a `messages` record in two separate steps, or does the backend handle this atomically? What if the conversation already exists?
-   **Impact if not clarified:** Potential for duplicate conversations or orphaned messages.
-   **Suggested Clarification:** The `POST /api/conversations/{id}/messages` endpoint should have "upsert" logic. If a conversation between the two users doesn't exist, it creates one first, then adds the message, all within a single database transaction.

**Ambiguity 2 (MYM-57): How is "read" status managed?**
-   **Question for PO/Dev:** When is a message marked as `is_read = true`?
    -   A) The moment the conversation thread is opened? (Simple, but a user might not scroll to the bottom).
    -   B) When the specific `MessageBubble` component scrolls into view? (More accurate, but more complex using IntersectionObserver).
-   **Impact if not clarified:** The unread count (MYM-58) could be inaccurate.
-   **Suggested Clarification:** For MVP, use Option A. Mark all messages in a conversation as read when the `ConversationThread` component mounts.

### Suggested Improvements (Before Implementation)

**Improvement 1: Add a Link to the Mentor's Profile in the Conversation View**
-   **Story Affected:** MYM-57
-   **Suggested Change:** In the header of the `ConversationThread` view, alongside the mentor's name and avatar, add a button or link "View Profile".
-   **Benefit:** Allows the mentee to easily navigate back to the mentor's profile to check their availability and book a session directly after a positive messaging exchange, reducing friction in the booking funnel.

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**
-   1-on-1 messaging between a mentee and a mentor.
-   Real-time message delivery and UI updates.
-   Real-time notification badge and toast updates.
-   Viewing conversation history and list.
-   RLS policy enforcement.
-   Message content validation (min length).

**Out of Scope (For This Epic):**
-   Group messaging, file attachments, message deletion/editing.
-   Email or browser push notifications.

### Test Levels

-   **Unit Testing:** Focus on validation logic (message length), timestamp formatting, and utility functions for creating Supabase subscriptions.
-   **Integration Testing:**
    -   API endpoints for sending/receiving messages.
    -   Database RLS policies.
    -   Mocked Supabase Realtime events to test frontend component reactions.
-   **E2E Testing (Critical for this epic):** Requires two concurrent browser sessions (e.g., two Playwright `browserContext`s) to test the real-time interaction between a sender and a receiver.

---

## 📊 Test Cases Summary by Story

### STORY-MYM-56: Send Message to Mentor
**Complexity:** High
**Estimated Test Cases:** 15
**Rationale:** This is the foundational story. It involves creating new DB tables, setting up RLS, and the core "write" path of the system.
-   Positive (5): Send first message, send subsequent message, send message with max length, etc.
-   Negative (7): Message too short, unauthenticated attempt, sending to a disabled mentor, etc.
-   Security (3): RLS checks, attempt to create conversation for other users.

### STORY-MYM-57: View Conversation History
**Complexity:** Medium
**Estimated Test Cases:** 12
**Rationale:** Focuses on the "read" path. Complexity lies in the query to fetch the conversation list with the last message preview and correct ordering.
-   Positive (6): View list, view thread, pagination/infinite scroll, empty state.
-   Negative (4): Attempt to access unauthorized conversation, handling of deleted users.
-   Boundary (2): Conversation with 1 message, conversation with 1000+ messages.

### STORY-MYM-58: Receive Notifications
**Complexity:** High
**Estimated Test Cases:** 15
**Rationale:** Real-time testing is inherently complex. Covers timing, multiple tabs, and connection state changes.
-   Positive (5): Badge increments, toast appears, click navigates, count decrements on read.
-   Negative (5): No notification for own message, no notification for active chat.
-   Edge Cases (5): Reconnect sync, multiple new messages, multi-tab sync.

### STORY-MYM-59: Mentor Respond from Dashboard
**Complexity:** Medium
**Estimated Test Cases:** 10
**Rationale:** Reuses many components from other stories, but integrates them into a new context (the dashboard).
-   Positive (4): Widget shows recent conversations, can reply from widget, navigates to full inbox.
-   Negative (3): Empty state, error on send.
-   Integration (3): Widget updates in real-time, reply triggers notification for mentee.

---

### Total Estimated Test Cases for Epic
**Total:** 52
**Breakdown:** Positive (20), Negative (19), Boundary/Edge (8), Security/Integration (5).

---

## 🗂️ Test Data Requirements

### Test Data Strategy
-   **Users:** At least 3 test users are required: `mentor-A`, `mentee-B`, `mentee-C`.
-   **Conversations:**
    -   A new conversation (no messages).
    -   An existing conversation with a few messages.
    -   A conversation with many (>50) messages to test pagination.
    -   A conversation with unread messages.
-   **Real-time Simulation:** E2E tests will use two separate, authenticated `browserContext`s in Playwright to simulate two users messaging each other in real time.

---

## ✅ Entry/Exit Criteria

### Entry Criteria
-   [ ] All user stories for **EPIC-MYM-2 (Authentication)** are complete and stable.
-   [ ] The mentor profile page (`/mentors/[id]`) is functional.
-   [ ] Supabase project has Realtime enabled for the `messages` table.

### Epic Exit Criteria
-   [ ] All 52 estimated test cases are passing.
-   [ ] E2E real-time test (two users messaging each other) is stable and passing consistently.
-   [ ] No critical or high-severity bugs related to data privacy (RLS) or real-time state synchronization are open.
-   [ ] Performance: New messages appear in <1 second; unread count updates in <1 second.
-   [ ] QA sign-off is approved.
