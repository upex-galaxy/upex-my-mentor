# Test Cases: STORY-MYM-58 - Receive Notifications for New Messages

**Fecha:** 2025-12-06
**QA Engineer:** Gemini AI
**Story Jira Key:** MYM-58
**Epic:** EPIC-MYM-55 - Messaging System
**Status:** Draft - Pending PO/Dev Review

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
- **Primary: Laura (Junior Developer)** - Needs immediate notifications to know if a mentor has responded to her pre-booking questions, which influences her decision to book.
- **Primary: Carlos (Senior Architect)** - Needs to be notified of new inquiries from potential mentees to respond quickly, maintain a good reputation, and convert leads into bookings.

**Business Value:**
- **Value Proposition:** Directly supports "Canal de Confianza" (Trust Channel) by facilitating prompt communication, which is key to building trust before a financial transaction.
- **Business Impact:**
    - Increases **user engagement** and **retention**. A responsive messaging system keeps users on the platform.
    - Improves **mentor response rate**, a key success metric for marketplace quality.
    - Reduces **booking friction**. Mentees who get quick answers are more likely to book.
    - Impacts **KPIs** like "100 sesiones completadas en el primer mes" by ensuring pre-session communication is effective.

**Related User Journey:**
- **Journey:** Not explicitly in a defined journey, but it's a critical sub-flow within both "Registro de Estudiante y Reserva" (Laura clarifying doubts) and "Registro de Mentor" (Carlos managing inquiries). It's the real-time feedback loop for the messaging system.

---

### Technical Context of This Story

**Architecture Components:**
**Frontend:**
- **Components:** `Navbar`, `MessagesIcon` (new), `NotificationBadge` (new), `MessageToast` (new or from shadcn/ui), `AuthContext`.
- **State Management:** A global context (likely `AuthContext` or a new `NotificationContext`) is needed to hold the unread message count and share it across components like the `Navbar`.
- **Real-time:** Supabase Realtime client subscription.

**Backend:**
- **API Endpoints:**
    - An initial endpoint to fetch the unread count on page load: `GET /api/messages/unread-count`.
    - `PATCH /api/messages/:id/read` will be called when a user views a conversation, which should then trigger an event to decrease the unread count.
- **Database:**
    - `messages` table: `is_read` column is critical.
    - `conversations` table: Used to identify which conversations a user is part of.
- **Real-time Infrastructure:** Supabase PostgreSQL's `postgres_changes` feature.

**External Services:**
- **Supabase Realtime:** The core dependency for this story.

**Integration Points:**
1.  **Frontend ↔ Supabase Realtime:** Client subscribes to database changes on the `messages` table.
2.  **Frontend State ↔ UI Components:** The global unread count state must be shared between the Realtime listener and the `NotificationBadge` component in the `Navbar`.
3.  **Conversation View (MYM-57) ↔ Backend API:** Viewing a conversation must trigger an API call to mark messages as read, which in turn updates the unread count.
4.  **Toast Notification ↔ Router:** Clicking a toast notification must navigate the user to the correct conversation thread (`/dashboard/messages/[conversationId]`).

---

### Story Complexity Analysis

**Overall Complexity:** **High**

**Complexity Factors:**
- **Business logic complexity:** Medium - Logic for counting unread messages, handling notifications only for other users' messages, and not showing notifications for the currently active conversation.
- **Integration complexity:** High - **Real-time systems are inherently complex.** Requires careful management of WebSocket connections, subscriptions, channel states, and handling of dropped connections or missed events.
- **Data validation complexity:** Low - Mostly involves simple state updates.
- **UI complexity:** Medium - Involves updating a global UI element (Navbar badge) from a background listener and managing the lifecycle of toast notifications.

**Estimated Test Effort:** **High**
**Rationale:** Real-time features are notoriously difficult to test reliably. Tests need to simulate real-time events, handle timing issues, and validate asynchronous UI updates across different parts of the application.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Definition of "Unread Message"**
- **Location in Story:** Scenario 1, Scenario 5.
- **Question for PO/Dev:** How is an "unread message" technically defined and counted? Is it a count of unread *messages* or unread *conversations*? The badge usually shows the former, but it's not specified.
- **Impact on Testing:** The logic for incrementing/decrementing the badge count depends entirely on this definition. If it's by message, reading a conversation with 5 messages should decrease the count by 5. If by conversation, it should decrease by 1.
- **Suggested Clarification:** AC1 should be: "The badge should show the count of **total unread messages** across all conversations."

**Ambiguity 2: Toast Notification Content**
- **Location in Story:** Scenario 2.
- **Question for PO/Dev:** What is the exact content of the toast? "sender's name and message preview" is vague. How long is the preview? Is it truncated? Does it show the avatar?
- **Impact on Testing:** UI snapshot tests and E2E assertions for the toast content cannot be written without a clear spec.
- **Suggested Clarification:** Specify: "Toast notification should show sender's avatar, sender's name (bold), and the first 50 characters of the message content, followed by '...' if longer."

**Ambiguity 3: Real-time Subscription Filter**
- **Location in Story:** Technical Notes.
- **Question for Dev:** The example filter `conversation_id=in.(${userConversationIds.join(',')})` requires the client to know all of its conversation IDs upfront. What if the user is added to a *new* conversation? Does the subscription handle this, or does it need to be refreshed?
- **Impact on Testing:** A critical edge case for testing is a user receiving a message from a brand new contact for the first time. The current filter might not catch this.
- **Suggested Clarification:** The subscription should probably be based on the recipient's user ID, not a static list of conversation IDs. E.g., a DB function that checks `recipient_id = auth.uid()`.

**Ambiguity 4: Toast Behavior on Multiple New Messages**
- **Location in Story:** Scenario 2.
- **Question for PO/Dev:** If a user receives 3 new messages from 3 different people while they are idle, what happens?
    - A) 3 separate toasts appear simultaneously (messy)?
    - B) 1 toast appears, and is replaced by the next, and then the next?
    - C) 1 toast appears ("You have 3 new messages") and stacks them?
- **Impact on Testing:** Affects E2E test design for high-traffic scenarios.
- **Suggested Clarification:** Define toast stacking behavior. Recommendation: Show one toast at a time. If another message arrives while a toast is visible, queue the next one to show after the first dismisses.

---

### Gaps Identified

**Gap 1: Handling Offline/Disconnected State**
- **Type:** Technical/Resilience.
- **Why It's Critical:** Users on flaky networks (mobile) will have their WebSocket connection drop. When they reconnect, the unread count must be accurate.
- **Suggested Addition:** Add a scenario: "Given I was offline and missed 3 messages, When I come back online, Then the notification badge should show a count of 3."
- **Impact if Not Added:** Unread counts will be permanently wrong for users with intermittent connectivity, defeating the purpose of the feature.

**Gap 2: Security of Real-time Subscription**
- **Type:** Security.
- **Why It's Critical:** The `postgres_changes` event needs to be secured by RLS policies. A misconfigured subscription could leak all messages on the platform to any connected client.
- **Suggested Addition:** Add a Technical Note: "RLS policy must be applied to the `messages` table to ensure the `postgres_changes` event only broadcasts to the intended recipient."
- **Impact if Not Added:** Critical data leakage vulnerability.

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1: User has the app open in multiple tabs.**
- **Scenario:** User A has the app open in Tab 1 and Tab 2. User B sends a message to User A.
- **Expected Behavior:** The notification badge should update in both tabs simultaneously. When User A reads the message in Tab 1, the badge in Tab 2 should also clear.
- **Criticality:** Medium. This requires broadcasting the "read" status change back to all of the user's connected clients.

**Edge Case 2: Sending a message to oneself.**
- **Scenario:** A user finds a way to send a message to themselves (e.g., through a UI bug or direct API call).
- **Expected Behavior:** The user should NOT receive a notification for their own message. The unread count should NOT increment.
- **Criticality:** Low, but important for correctness.

---

## ✅ FASE 3: Refined Acceptance Criteria

### Scenario 1: Notification badge shows correct unread message count
**Type:** Positive
- **Given:** I am a logged-in user with 3 unread messages in one conversation and 2 in another.
- **When:** I navigate to any page on the application.
- **Then:** I see a notification badge on the messages icon in the navbar with the number "5".

### Scenario 2: Real-time updates for new messages
**Type:** Positive
- **Given:** I am logged in and my unread message count is "5".
- **When:** I receive a new message from User A in a new or existing conversation.
- **Then:** The notification badge should immediately update to "6" without a page refresh.
- **And:** A toast notification should appear with User A's avatar, name, and the first 50 characters of the message.

### Scenario 3: Toast notification interaction
**Type:** Positive
- **Given:** I have a new message toast notification visible for a conversation with User A.
- **When:** I click anywhere on the toast.
- **Then:** I am immediately navigated to the conversation thread with User A (`/dashboard/messages/[conversationId]`).
- **And:** The toast notification is dismissed.
- **Given:** I receive a new message toast.
- **When:** I do not interact with it.
- **Then:** The toast automatically dismisses after 5 seconds.

### Scenario 4: No notifications for the active conversation
**Type:** Negative
- **Given:** I am actively viewing the conversation thread with User A.
- **When:** User A sends me a new message.
- **Then:** The message should appear in the chat history.
- **And:** A toast notification should NOT be displayed.
- **And:** The global unread message count should NOT increment.

### Scenario 5: Badge count decrements accurately after reading
**Type:** Positive
- **Given:** My unread message badge shows a count of "5".
- **And:** 3 of those messages are in a conversation with User B.
- **When:** I navigate to the conversation with User B, and the messages are marked as read.
- **Then:** The unread message badge count should update in real-time to "2".
- **When:** I read the remaining 2 messages in other conversations.
- **Then:** The notification badge should disappear completely.

### Scenario 6: Re-syncing unread count after reconnecting (NEW)
**Type:** Resilience
- **Given:** I am logged in, and my WebSocket connection is dropped.
- **And:** While I am disconnected, I receive 2 new messages.
- **When:** My connection is re-established.
- **Then:** The system should re-fetch the total unread count.
- **And:** The notification badge should display a count of "2".

---

## 🧪 FASE 4: Test Design

### Test Coverage Analysis
**Total Test Cases Needed:** 20

**Breakdown:**
- Positive: 8
- Negative: 6
- Boundary/Edge: 4
- Integration (Real-time): 2

**Rationale:** High number of test cases is justified by the asynchronous, real-time nature of the feature. We need to cover timing issues, connection state changes, and asynchronous UI updates across different parts of the application, which are more complex than standard CRUD tests.

### Test Cases

#### **TC-MYM58-01: Badge displays correct initial count on load**
**Type:** Positive, **Priority:** Critical
1.  **Given:** A user is logged out. A new message is sent to them via backend script (unread count is now 1).
2.  **When:** The user logs in and lands on the dashboard.
3.  **Then:** The notification badge in the navbar should display "1".

#### **TC-MYM58-02: Badge increments in real-time for new message**
**Type:** Positive, **Priority:** Critical
1.  **Given:** User A is logged in and on the dashboard. The badge count is "0".
2.  **When:** User B (in a separate browser/session) sends a message to User A.
3.  **Then:** User A's badge count should update to "1" within 2 seconds, without a page refresh.

#### **TC-MYM58-03: Toast notification appears with correct content**
**Type:** Positive, **Priority:** High
1.  **Given:** User A is logged in.
2.  **When:** User B sends the message "This is a test message preview".
3.  **Then:** A toast notification should appear for User A.
4.  **And:** The toast must contain User B's name, avatar, and the text "This is a test message preview".

#### **TC-MYM58-04: Clicking toast navigates to conversation**
**Type:** Positive, **Priority:** High
1.  **Given:** User A receives a toast notification for a message from User B.
2.  **When:** User A clicks the toast.
3.  **Then:** The browser should navigate to `/dashboard/messages/[conversationId_of_A_and_B]`.

#### **TC-MYM58-05: Badge count decrements after reading messages**
**Type:** Positive, **Priority:** Critical
1.  **Given:** User A has 3 unread messages from User B, and the badge shows "3".
2.  **When:** User A navigates to the conversation with User B.
3.  **Then:** The badge count should update to "0" in real-time as the messages are marked as read.

#### **TC-MYM58-06: No notification for message in active conversation**
**Type:** Negative, **Priority:** High
1.  **Given:** User A is on the page `/dashboard/messages/[conversation_id_B]`, actively chatting with User B.
2.  **When:** User B sends a new message.
3.  **Then:** No toast notification should appear for User A.
4.  **And:** The global unread badge count should not change.

#### **TC-MYM58-07: Notification appears for inactive conversation**
**Type:** Positive, **Priority:** High
1.  **Given:** User A is actively chatting with User B.
2.  **When:** User C sends a message to User A.
3.  **Then:** A toast notification for the message from User C should appear.
4.  **And:** The global unread badge count should increment.

#### **TC-MYM58-08: User does not receive notification for their own message**
**Type:** Negative, **Priority:** Medium
1.  **Given:** User A is logged in.
2.  **When:** User A sends a message to User B.
3.  **Then:** User A should NOT see a toast notification.
4.  **And:** User A's unread badge count should NOT change.

#### **TC-MYM58-09: Badge disappears when count is zero**
**Type:** Boundary, **Priority:** Medium
1.  **Given:** A user has 1 unread message and the badge shows "1".
2.  **When:** The user reads that message.
3.  **Then:** The badge component should be completely removed from the DOM, not just show "0".

#### **TC-MYM58-10: Multiple new messages stack correctly**
**Type:** Edge Case, **Priority:** Medium
1.  **Given:** User A is logged in.
2.  **When:** User B sends a message, and 1 second later User C sends a message.
3.  **Then:** A toast for User B's message should appear and dismiss after 5 seconds.
4.  **And:** Immediately after, a toast for User C's message should appear.

#### **TC-MYM58-11: Toast notification auto-dismisses**
**Type:** Positive, **Priority:** Medium
1.  **Given:** User A receives a toast notification.
2.  **When:** User A takes no action for 6 seconds.
3.  **Then:** The toast notification should automatically close and be removed from the DOM.

#### **TC-MYM58-12: Badge count aggregates from multiple conversations**
**Type:** Positive, **Priority:** High
1.  **Given:** User A has 2 unread messages from User B and 4 unread messages from User C.
2.  **When:** User A logs in or is active on the site.
3.  **Then:** The notification badge should display a count of "6".

#### **TC-MYM58-13: Unauthenticated user does not receive real-time events**
**Type:** Negative, **Priority:** Critical (Security)
1.  **Given:** A user is not logged in (is on the landing page).
2.  **When:** A message is sent to a registered user's account via a backend script.
3.  **Then:** The anonymous user's client should not receive any real-time events or data.
4.  **And:** No notifications or errors should appear in the browser console.

#### **TC-MYM58-14: Graceful handling of real-time connection error**
**Type:** Negative, **Priority:** Medium (Resilience)
1.  **Given:** A user is logged in and the real-time connection is active.
2.  **When:** The WebSocket connection to Supabase is forcibly closed (e.g., via browser dev tools or network interruption).
3.  **Then:** The application should not crash.
4.  **And:** A connection status indicator (optional) may show a "reconnecting" state.
5.  **And:** The system should attempt to re-establish the connection automatically.

#### **TC-MYM58-15: Malformed real-time payload does not crash client**
**Type:** Negative, **Priority:** Medium (Resilience)
1.  **Given:** A user is subscribed to the messages channel.
2.  **When:** A malformed payload (e.g., missing `sender_id`, incorrect data type) is broadcast (simulated via test script).
3.  **Then:** The client application should not crash or enter an error state.
4.  **And:** An error should be logged to the console for debugging, but the UI should remain stable.

#### **TC-MYM58-16: Badge count handles large numbers gracefully**
**Type:** Boundary, **Priority:** Low
1.  **Given:** A user has 150 unread messages.
2.  **When:** The user logs in.
3.  **Then:** The notification badge should display "99+" rather than "150".

#### **TC-MYM58-17: Badge count updates across multiple browser tabs**
**Type:** Edge Case, **Priority:** Medium
1.  **Given:** User A is logged in on Tab 1 and Tab 2. Both tabs show a badge count of "3".
2.  **When:** User A reads all 3 messages in Tab 1.
3.  **Then:** The badge count in Tab 2 should update to "0" or disappear within a few seconds without a page refresh.

#### **TC-MYM58-18: Full E2E notification and read-status flow**
**Type:** Integration, **Priority:** Critical
1.  **Given:** User A and User B are online in separate browsers. Both have a badge count of "0".
2.  **When:** User B sends a message to User A.
3.  **Then:** User A sees a toast notification and their badge updates to "1".
4.  **When:** User A clicks the toast, navigating to the conversation.
5.  **Then:** As the conversation loads, the badge count for User A should update back to "0".
6.  **And:** The message from User B in the conversation list should no longer be marked as "unread".

#### **TC-MYM58-19: Unread count syncs after network reconnect**
**Type:** Integration, **Priority:** High (Resilience)
1.  **Given:** User A is online with 0 unread messages.
2.  **When:** User A's network connection is disabled.
3.  **And:** User B sends 2 messages to User A.
4.  **When:** User A's network connection is re-enabled.
5.  **Then:** The badge count should update to "2" within a reasonable time (e.g., 10 seconds) after reconnection.

#### **TC-MYM58-20: RLS policy prevents subscription to unauthorized conversations**
**Type:** Negative, **Priority:** Critical (Security)
1.  **Given:** User A is authenticated. Conversation C exists between User B and User D.
2.  **When:** User A's client attempts to subscribe to real-time changes for Conversation C (simulated via script).
3.  **Then:** The Supabase Realtime server should not send any events from Conversation C to User A.
4.  **And:** User A's unread count should not be affected by messages in Conversation C.
---
## 📝 FASE 5: Jira Integration & Local Mirroring

### FASE 5a & 5b: Update Jira Story and Add Comment
- **Action:**
    1.  Update `MYM-58` description in Jira with the refined acceptance criteria and analysis from FASES 1-3. Add the `shift-left-reviewed` label.
    2.  Add the full content of this markdown file as a comment to `MYM-58` and @-mention the Product Owner and Dev Lead for review.

### FASE 5c: Generate Local `test-cases.md`
- **Action:** Create the file `test-cases.md` in the story directory with the content of this document.

### FASE 5d: Final QA Feedback Report

---
## ✅ Shift-Left Test Cases - Execution Summary
**Story:** MYM-58 - Receive Notifications for New Messages
**Analysis Date:** 2025-12-06
---
### 📊 Summary for PO/Dev
**Story Quality Assessment:** ⚠️ Needs Improvement

**Key Findings:**
1.  The core concept is clear, but lacks resilience. The current ACs don't account for network interruptions, which will lead to desynchronized notification counts.
2.  The definition of an "unread message" vs. an "unread conversation" is ambiguous and will directly impact implementation and user experience.
3.  The technical approach for Supabase Realtime subscriptions may not cover the critical edge case of receiving a message from a new contact.

---
### 🚨 Critical Questions for PO
**Question 1: Unread Count Logic**
- **Context:** Should the badge count "unread messages" or "unread conversations"?
- **Impact:** This is a fundamental product decision. Counting messages can lead to high numbers (e.g., "99+"), while counting conversations is cleaner but less granular.
- **Suggested Answer:** For MVP, count **unread conversations** as it's a simpler metric for users to understand and for us to manage. A user cares that "2 people have messaged me" more than "I have 15 total unread messages".

**Question 2: Toast Stacking Behavior**
- **Context:** If a user gets 5 messages from 5 people at once, how should toasts behave?
- **Impact:** Displaying 5 toasts at once would break the UI. We need a defined behavior.
- **Suggested Answer:** Queue them. Show one toast for 5 seconds, then the next, and so on. This provides feedback without overwhelming the user.

---
### 🔧 Technical Questions for Dev
**Question 1: Real-time Subscription Strategy**
- **Context:** The `story.md` suggests filtering by a list of known `conversation_id`s. This won't work for messages from new contacts.
- **Impact on Testing:** We cannot test the "first message from a new contact" scenario if the subscription is designed this way.
- **Suggested Answer:** The subscription should listen to all inserts on the `messages` table and the RLS policy should restrict the broadcast to only the intended recipient (`recipient_id = auth.uid()`). Please confirm this approach.

**Question 2: Offline Synchronization**
- **Context:** How will the unread count be synchronized if a user reconnects after being offline? The real-time subscription only shows *new* events, it doesn't backfill missed ones.
- **Impact on Testing:** This is a major gap. Without a sync mechanism, counts will be wrong for any user with an unstable connection.
- **Suggested Answer:** On re-establishing a WebSocket connection, the client should make a separate API call to `GET /api/messages/unread-count` to get the current source of truth.

---
### 💡 Suggested Story Improvements

**Improvement 1: Add Offline/Reconnect Resilience**
- **Current State:** Story assumes a persistent connection.
- **Suggested Change:** Add "Scenario 6: Re-syncing unread count after reconnecting" to the acceptance criteria.
- **Benefit:** Makes the feature robust and reliable for real-world use cases.

**Improvement 2: Clarify Count Logic**
- **Current State:** "unread messages" is ambiguous.
- **Suggested Change:** Change AC1 to "The badge should show the count of conversations with at least one unread message."
- **Benefit:** Removes ambiguity for development and testing.

---
### ✅ What Was Done
**Jira Updates:**
- ✅ Story `MYM-58` will be updated in Jira with refined ACs and a `shift-left-reviewed` label.
- ✅ Test cases will be added as a comment to `MYM-58` in Jira.

**Local Files:**
- ✅ This file, `test-cases.md`, will be created at `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-58-message-notifications/test-cases.md`.

**Test Coverage:**
- **Total test cases designed:** 20. This includes positive, negative, and real-time specific scenarios.
---
### 🎯 Next Steps (Team Action Required)
1.  **PO:** Please review and answer the "Critical Questions for PO".
2.  **Dev:** Please review and answer the "Technical Questions for Dev".
3.  **Team:** Discuss and decide on the "Suggested Story Improvements".

**⚠️ BLOCKER:** Development should not start until the subscription and offline-sync strategies are confirmed.
