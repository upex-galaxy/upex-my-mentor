# Test Cases: STORY-MYM-57 - View Conversation History

**Date:** 2025-12-03
**QA Engineer:** Gemini AI
**Story Jira Key:** MYM-57
**Epic:** EPIC-MYM-55 - Messaging System
**Status:** Draft

---

## 📋 PHASE 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**
- **Primary:** Laura (Junior Developer) - Needs to review past conversations with her mentor to recall technical advice before a new session.
- **Primary:** Carlos (Senior Architect) - Needs to access the history to prepare for a follow-up session and remember a student's previous issues.
- **Primary:** Sofía (Career Changer) - Uses the history to review concepts and maintain the context of her mentoring discussions.

**Business Value:**
- **Value Proposition:** Fosters the creation of long-term relationships between mentor and student, one of the key values.
- **Business Impact:** Increases user retention by making the platform "stickier." It reduces friction for second and third sessions, as context is preserved. A good conversation history is a standard feature in any communication platform, and its absence would be a major detractor.

**Related User Journey:**
- **Journey:** This is an implicit post-booking journey. "Laura, after her first session, reviews the conversation to apply Carlos's advice. A week later, she returns to the conversation to ask a follow-up question, which leads to a new booking."

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**
- **Components:** `ConversationList`, `ConversationListItem`, `ConversationThread`, `MessageBubble`, `EmptyState`, `Avatar`.
- **Pages/Routes:** `/dashboard/messages`, `/dashboard/messages/[conversationId]`.
- **State Management:** A `MessagesContext` to manage the state of unread messages and notifications.

**Backend:**
- **API Endpoints:**
    - `GET /api/conversations`: Already defined in `epic.md`.
    - `GET /api/conversations/:id`: Already defined in `epic.md`.
    - `PATCH /api/messages/:id/read`: Not defined in `epic.md` but implied by the need to mark messages as read.
- **Database:**
    - **Tables:** `conversations`, `messages`, `profiles`.
    - **Critical Queries:** The query to get the conversation list with the last message and unread count is the most complex and performance-sensitive.

**External Services:**
- **Supabase Realtime:** For real-time updates to the conversation list when a new message arrives.

**Integration Points:**
- **Frontend ↔ Backend API:** The frontend consumes the endpoints to list and display conversations.
- **Backend ↔ Database:** The backend performs complex queries with `JOINs` to get the required data.
- **Notifications (MYM-58) ↔ Conversation History (MYM-57):** Clicking a notification should navigate to the correct conversation, and the "unread" status must be updated.

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**
- **Business logic:** Medium - The logic for "mark as read" and sorting by recent activity has subtleties.
- **Integration:** Medium - Requires strong integration with the real-time notification system (MYM-58).
- **Data validation:** Low - Mainly read operations.
- **UI complexity:** Medium - Multiple states (list, detail, empty, loading, error) and the need for a responsive and clear design for the "message bubbles."

**Estimated Test Effort:** Medium
**Rationale:** The complexity lies in testing the different UI states, the correct updating of the "read/unread" status, and performance with large volumes of conversations/messages.

---

### Epic-Level Context (From Feature Test Plan in Jira)

(Assumed based on the epic.md for MYM-55)

**Critical Risks Already Identified at Epic Level:**
- **Risk 1:** Real-time not working reliably.
  - **Relevance:** The conversation history must reflect new messages in real-time to be useful.
- **Risk 2:** Performance with many messages.
  - **Relevance:** This story is directly responsible for implementing pagination/infinite scroll to mitigate this risk.

**Integration Points from Epic Analysis:**
- **Integration Point 1:** `MessageButton` on `MentorProfile` (MYM-56) creates the conversation that this story (MYM-57) must display.
- **Integration Point 2:** Notifications (MYM-58) must update the "unread" status that this story displays.

---

## 🚨 PHASE 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: What constitutes "viewing" a conversation to mark it as read?**
- **Location:** AC5: "The indicator should disappear when I view the conversation."
- **Question for PO/Dev:** Are all messages marked as read as soon as the conversation thread is opened, or only when the user scrolls to the end?
- **Impact:** Direct impact on the implementation of `PATCH /api/messages/:id/read`. If on open, it's a single API call. If on scroll, it requires an observer and multiple calls.
- **Suggested Clarification:** For MVP, all messages in a conversation are marked as read as soon as the user opens the thread (`/dashboard/messages/[id]`).

**Ambiguity 2: What is a "message preview"?**
- **Location:** AC1: "each conversation should show the last message preview."
- **Question for PO:** What is the maximum length of the message preview? Is it truncated with "..."? Does it show `[Image]` if the last message is an image (even if out of scope)?
- **Impact:** Affects UI design and the backend query.
- **Suggested Clarification:** The preview is a maximum of 100 characters, truncated with "...", and shows only text.

**Ambiguity 3: "Timestamp" format.**
- **Location:** AC1, AC2.
- **Question for PO/Dev:** Should the timestamp be relative (e.g., "2 min ago", "yesterday") or absolute (e.g., "12/03/2025 15:30")?
- **Impact:** Affects data formatting and the date library to be used.
- **Suggested Clarification:** Relative for recent dates (today, yesterday) and absolute for older dates.

---

### Missing Information / Gaps

**Gap 1: Behavior of pagination/infinite scroll.**
- **Type:** Technical Details.
- **Why It's Critical:** The story mentions "infinite scroll or pagination" but doesn't define the behavior.
- **Suggested Addition:** "Infinite scroll will be implemented. When scrolling up in a conversation thread, the previous 20 messages will be loaded."

**Gap 2: Loading and error states.**
- **Type:** Acceptance Criteria.
- **Why It's Critical:** The user gets no feedback if loading messages is slow or fails.
- **Suggested Addition:** "Given the conversation list is loading, Then a UI skeleton (skeleton loader) should be displayed. Given the load fails, Then an error message with a retry button should be displayed."

**Gap 3: Visibility of the other user's profile.**
- **Type:** Acceptance Criteria.
- **Why It's Critical:** From a conversation, the user should be able to easily navigate to the other participant's profile.
- **Suggested Addition:** "When I am viewing a conversation, Then I should see a clickable avatar and name of the other participant that navigates to their profile."

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Conversation with a user who has deleted their account.
- **Expected Behavior:** The name should change to "Deleted User" and the avatar to a generic one. The conversation and messages remain. **(Needs PO confirmation)**.

**Edge Case 2:** The last message was sent by the user themselves.
- **Expected Behavior:** The message preview should indicate that I sent it (e.g., "You: Hi, are you available?").

**Edge Case 3:** A user with hundreds of conversations.
- **Expected Behavior:** The conversation list must have pagination or infinite scroll to avoid crashing the browser.

---

## ✅ PHASE 3: Refined Acceptance Criteria

### Scenario 1: Accessing the conversation list
- **Then:** Each conversation in the list shows a clickable avatar, clickable name, a preview of the last message (truncated to 100 characters), and a relative timestamp (e.g., "5m ago", "Yesterday").
- **And:** If there are unread messages, the conversation shows a blue dot indicator.

### Scenario 2: Viewing a conversation thread
- **Then:** Upon opening the thread, ALL unread messages in that conversation are marked as read, and the blue dot disappears from the list.
- **And:** Messages are displayed in "bubbles," aligned to the right for my messages and to the left for the other user's, with different background colors.

### Scenario 3: Conversation order
- **Then:** Conversations in the list are sorted by the date of the last message (most recent first), not by the conversation's creation date.

### Scenario 4: Empty State
- **Then:** The page shows a friendly message: "You don't have any conversations yet. Find a mentor and break the ice!" with a button that leads to `/mentors`.

---

## 🧪 PHASE 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 25

- **Positive:** 10
- **Negative:** 5
- **Boundary:** 5
- **Integration:** 5

**Rationale:** The story has medium complexity, with several UI states (list, detail, empty, unread), business logic (sorting, "mark as read"), and integration with real-time notifications and user profiles. Solid coverage of these aspects is needed.

---

### Test Cases

#### **TC-MYM57-01: View the conversation list with read and unread messages**
- **Type:** Positive, **Priority:** Critical, **Level:** E2E
- **Steps:**
    1.  Log in as a user with 3 conversations.
        - Conversation A: 1 unread message.
        - Conversation B: 0 unread messages.
        - Conversation C: 5 unread messages.
    2.  Navigate to `/dashboard/messages`.
- **Expected:**
    - 3 conversations are displayed.
    - Conversation C appears first, followed by A, then B (sorted by last message).
    - Conversations A and C show a blue dot. B does not.
    - Each item shows an avatar, name, last message preview, and timestamp.

#### **TC-MYM57-02: Mark a conversation as read**
- **Type:** Positive, **Priority:** Critical, **Level:** E2E
- **Preconditions:** TC-MYM57-01
- **Steps:**
    1. Click on Conversation A (which has 1 unread message).
- **Expected:**
    - Navigates to `/dashboard/messages/[conversationId_A]`.
    - Upon returning to `/dashboard/messages`, the blue dot for Conversation A has disappeared.
    - The global notification counter (from MYM-58) is reduced by 1.

#### **TC-MYM57-03: View conversation thread and infinite scroll**
- **Type:** Positive, **Priority:** High, **Level:** E2E
- **Preconditions:** User has a conversation with 50 messages.
- **Steps:**
    1.  Open the conversation.
    2.  Verify that the last 20 messages are displayed.
    3.  Scroll to the top.
- **Expected:**
    - While scrolling, a loading indicator appears, and the previous 20 messages are loaded (messages 21 to 40).
    - Own messages are on the right, the other user's messages are on the left.

#### **TC-MYM57-08: View a conversation with a deleted user**
- **Type:** Edge Case, **Priority:** Medium, **Level:** Integration
- **Preconditions:** A conversation exists with a user whose profile has been deleted from the `profiles` table.
- **Steps:**
    1.  Open the conversation list.
    2.  Locate the conversation with the deleted user.
- **Expected:**
    - The user's name is displayed as "Deleted User".
    - The avatar is displayed as a generic avatar.
    - The conversation thread is still visible.

---

## 📝 PHASE 5: Jira Integration & Local Mirroring

### PHASE 5a: Update Story in Jira
- **Action:** Update the description of **MYM-57** in Jira with the "Refined Acceptance Criteria" and identified "Edge Cases". Add the `shift-left-reviewed` label.

### PHASE 5b: Add Test Cases Comment in Jira
- **Action:** Add this entire document as a comment on the **MYM-57** Jira issue, mentioning the PO and Dev Lead for their review.

### PHASE 5c: Generate Local `test-cases.md`
- **Action:** Create the file `.context/PBI/epics/EPIC-MYM-55-messaging-system/stories/STORY-MYM-57-conversation-history/test-cases.md` with the content from this analysis.

### PHASE 5d: Final QA Feedback Report
- **Action:** Generate a summary for the user with the findings and critical questions.