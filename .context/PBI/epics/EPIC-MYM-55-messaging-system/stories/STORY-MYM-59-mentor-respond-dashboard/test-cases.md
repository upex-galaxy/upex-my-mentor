# Test Cases: STORY-MYM-59 - Mentor Respond to Messages from Dashboard

**Fecha:** 2025-12-02
**QA Engineer:** AI-Generated
**Story Jira Key:** MYM-59
**Epic:** EPIC-MYM-55 - Messaging System
**Status:** Draft - Pending PO/Dev Review

---

## 📋 FASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
*   **Primary:** Carlos (Arquitecto Senior) - Como mentor, necesita gestionar eficientemente las consultas de múltiples estudiantes potenciales.
*   **Business Value:** "Improves mentor response rates". Una respuesta rápida es el factor #1 para convertir una consulta en una reserva pagada. El widget en el dashboard reduce la fricción de tener que navegar a una bandeja de entrada separada solo para verificar si hay mensajes nuevos.

**Related User Journey:**
*   Journey: Mentor Daily Routine.
*   Step: Mentor logs in -> Checks Dashboard -> Sees new message -> Replies immediately -> Mentee books session.

### Technical Context of This Story

**Architecture Components:**
*   **Frontend:** `RecentMessagesWidget` (React component), `QuickReplyModal` (or inline expansion).
*   **Backend:** API endpoint or Server Action `sendMessage`.
*   **Database:** `conversations` table (needs efficient querying by `last_message_at` for sorting), `messages` table.
*   **Realtime:** Supabase Realtime subscription to `messages` table (filtered by `recipient_id`) to update the widget instantly.

**Integration Points:**
*   **Dashboard Page:** The widget must load asynchronously without blocking the main dashboard stats.
*   **Notification System:** Sending a reply should trigger a notification to the mentee (handled by MYM-58 logic, but triggered here).

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**
*   **UI/UX:** Handling text truncation, empty states, and "optimistic UI" updates for instant feedback.
*   **Real-time:** Updating the list order when a new message arrives requires managing local state carefully.
*   **Data Fetching:** Efficiently fetching the "last message" for the top 5 conversations without N+1 queries.

---

## 🚨 FASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Quick Reply Interface**
*   **Question:** How does the "Quick Reply" UI look? Is it a modal popping over the dashboard, or does the widget expand?
*   **Impact:** Affects E2E test selectors and user flow steps.
*   **Suggested Clarification:** Assume a modal/drawer for MVP to reuse the full conversation view component easily.

**Ambiguity 2: "View full conversation" behavior**
*   **Question:** AC2 says "view the full conversation". Does this mean navigating to the inbox, or viewing it *within* the widget/modal?
*   **Impact:** If navigation, it breaks the "stay on dashboard" goal.
*   **Suggested Clarification:** It opens a modal with the conversation thread *overlaying* the dashboard.

### Missing Information / Gaps

**Gap 1: Error Handling**
*   **Type:** Edge Case
*   **Detail:** What happens if the message fails to send?
*   **Suggestion:** Show a toast error and allow retry. Do not clear the typed text.

**Gap 2: Long Messages**
*   **Type:** UI
*   **Detail:** How to display a very long last message in a small widget row?
*   **Suggestion:** Truncate with ellipsis (...) after 1-2 lines.

---

## ✅ FASE 3: Refined Acceptance Criteria

See Jira Issue description for the updated Acceptance Criteria and Scenarios.

---

## 🧪 FASE 4: Test Design

### Test Cases

#### **TC-MYM59-01: View Recent Messages Widget (Happy Path)**
**Type:** Positive | **Priority:** Critical
**Preconditions:** Mentor has 3 active conversations.
**Steps:**
1. Login as Mentor.
2. Navigate to Dashboard.
3. Observe "Recent Messages" widget.
**Expected Result:**
*   Widget displays 3 items.
*   Each item shows Mentee Name, Avatar, Last Message Preview (truncated), Relative Time (e.g. "2h ago").
*   Items sorted by date descending.

#### **TC-MYM59-02: Quick Reply from Dashboard**
**Type:** Positive | **Priority:** Critical
**Preconditions:** Mentor has an unread message.
**Steps:**
1. Click on the unread conversation in the widget.
2. Verify "Quick Reply" modal/drawer opens.
3. Type "Sure, let's meet!" and click Send.
4. Verify modal closes or shows success state.
5. Verify message appears in conversation immediately.
**Expected Result:**
*   Message sent successfully.
*   Unread indicator disappears from that conversation in the widget.

#### **TC-MYM59-03: Empty State (Boundary)**
**Type:** Boundary | **Priority:** Medium
**Preconditions:** Mentor has 0 conversations.
**Steps:**
1. View Dashboard.
**Expected Result:**
*   Widget shows friendly empty state message: "No inquiries yet. Complete your profile to attract mentees."
*   No broken layout or infinite loading spinner.

#### **TC-MYM59-04: Real-time Incoming Message (Integration)**
**Type:** Integration | **Priority:** High
**Preconditions:** Mentor is viewing Dashboard. Mentee sends message from another device.
**Steps:**
1. Have Mentee send "Hello?" to Mentor.
2. Observe Mentor's dashboard WITHOUT refreshing.
**Expected Result:**
*   Widget updates automatically within <2 seconds.
*   New message appears at top of list.
*   Unread badge appears/increments.

#### **TC-MYM59-05: Truncation of Long Messages (UI)**
**Type:** UI | **Priority:** Low
**Preconditions:** Last message has 500 characters.
**Steps:**
1. View widget.
**Expected Result:**
*   Message text is truncated (e.g. after 50 chars) with "...".
*   Layout does not break/overflow.

#### **TC-MYM59-06: Network Error on Reply (Negative)**
**Type:** Negative | **Priority:** Medium
**Preconditions:** Network is disconnected (offline mode).
**Steps:**
1. Open Quick Reply.
2. Type message and click Send.
**Expected Result:**
*   Error toast displayed: "Failed to send message. Please check your connection."
*   Typed text is NOT lost (user can retry).

#### **TC-MYM59-07: Navigate to Full Inbox**
**Type:** Positive | **Priority:** Medium
**Steps:**
1. Click "View All Messages" link at bottom of widget.
**Expected Result:**
*   Redirects to `/dashboard/messages`.

#### **TC-MYM59-08: Mentee Deleted Account (Edge Case)**
**Type:** Edge Case | **Priority:** Low
**Preconditions:** Mentee deleted their account, but conversation exists.
**Steps:**
1. View widget.
**Expected Result:**
*   Conversation still visible.
*   Mentee name shows as "Deleted User" (or similar placeholder).
*   Clicking allows viewing history but Reply is disabled.

---

## 🗂️ Test Data Requirements

**Dynamic Test Data (using Faker.js):**
*   `createTestConversation({ mentorId, menteeId, messageCount: 5, lastMessageTime: 'now' })`
*   `createTestMessage({ senderId: menteeId, content: faker.lorem.sentence() })`

**Test Data Cleanup:**
*   Delete created conversations/messages after test execution.

---

## 📝 FASE 5: Jira Integration & Local Mirroring

**Jira Updates:**
*   ✅ Story refined in Jira with QA Refinements section.
*   ✅ Label `shift-left-reviewed` added.
*   ✅ Test cases added as comment in Jira story.

**Local Files:**
*   ✅ `test-cases.md` created at: `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-59-mentor-respond-dashboard/`

---

## 📢 Final QA Feedback Report

### 📊 Summary for PO/Dev
**Story Quality Assessment:** ✅ Good (with refinements)
**Key Findings:**
1.  The story is critical for mentor engagement.
2.  Real-time updates are a key technical requirement to ensure the dashboard feels "alive".
3.  Empty states and error handling need to be explicitly designed.

### 🚨 Critical Questions for PO
**Question 1:** Is the limit strictly 5 items?
*   **Context:** Performance optimization.
*   **Suggested Answer:** Yes, hard limit 5. "View All" for the rest.

**Question 2:** Should "Quick Reply" be a modal or inline?
*   **Context:** UX complexity.
*   **Suggested Answer:** Modal is easier to implement reusing existing components.

### 💡 Suggested Story Improvements
**Improvement 1:** Add "Mark as Read" explicitly when opening quick reply.
**Improvement 2:** Ensure "Deleted User" handling is consistent across the platform.

---
