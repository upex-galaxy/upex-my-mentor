# Exploratory Testing Session

## Phase 1: Context Gathering (Exploration Plan)

**Feature:** Mentor Respond to Messages from Dashboard (Widget Stability)
**Scope:** STORY-MYM-59
**Staging URL:** https://staging.upexmymentor.com/dashboard

### Scenarios to Explore:

1.  **Dashboard Widget Rendering & Real-time Sync:** Verify correct rendering of the "Recent Messages" widget, including empty states and real-time updates when new messages arrive without page refresh.
2.  **Quick Reply Modal Functionality:** Test the end-to-end flow: opening the modal, typing, sending, and verifying visual feedback and automatic closure.
3.  **Navigation Integrity:** Check that "View all messages" links and individual profile links work correctly during data updates.
4.  **Edge Case - "The Ghost Effect":** Receive a new message while typing in the modal. Verify no visual confusion or unexpected reordering occurs.
5.  **Edge Case - "The Spammer":** Simulate receiving 10+ messages in <5 seconds. Verify the widget doesn't freeze or flicker (Debounce check).
6.  **Edge Case - "The Dead Link":** Click a profile link exactly when the widget triggers a real-time update.
7.  **Edge Case - "The Sleeping Tab":** Leave the tab backgrounded for 30 mins and verify socket reconnection and state sync upon return.
8.  **Edge Case - "The Infinite Message":** Receive a 200-char string without spaces to check CSS text-overflow and layout stability.
9.  **Multitasking Scenario:** Receive messages in a background conversation while another one is active in the modal.
10. **Network Resilience:** Verify system behavior and message delivery status when simulating a network drop (Offline Mode).

---

## Phase 2: UI Exploration (Playwright MCP)

### Scenario: [Scenario Name]

**Steps Executed:**

1. [Action] → [Result]
2. [Action] → [Result]

**Outcome:** [PASSED / ISSUE FOUND]

**Notes:**

- [Observation]

---

## Phase 3: Edge Case Testing

### Edge Case: [Description]

**Input:** [What was tested]
**Expected:** [What should happen]
**Actual:** [What happened]
**Status:** [PASSED / FAILED / OBSERVATION]

---

## Phase 4: Session Summary (Session Notes)

**Date:** 2026-01-15
**Feature:** Mentor Respond from Dashboard
**Duration:** [Time spent]

---

## Executive Summary

- **Overall Status:** [ISSUES FOUND / BLOCKED]
- **Scenarios Tested:** 10 of 10
- **Issues Found:** 4

---

## Scenarios Tested

### 1. Real-time Message Sync (Smoke Test Re-run) - [FAILED]

- **Details:** Verifying the widget's automatic refresh after a student sends a message.
- **Result:** Widget does not update (Student 21:10 vs Mentor 21:03). Confirmed after clearing cache/cookies.

### 2. Quick Reply Modal Functionality - [PASSED]

- **Details:** Tested the full flow of the Quick Reply modal: opening from the Dashboard, entering text, and clicking 'Send'.
- **Result:** The modal closed automatically upon sending, a success toast notification appeared, and the message was delivered correctly.
- **Note:** This confirms the modal's internal logic is functional, unlike the background widget's real-time sync.

### 3. Navigation Integrity - [PASSED]

- **Details:** Tested "View all messages" link and individual conversation/profile links within the widget.
- **Result:** Navigation works correctly. "View all messages" redirects to the full Messaging Inbox, and clicking on a user's name/avatar deep-links to the specific conversation/profile without errors.

### 4. Edge Case: "The Ghost Effect" (Race Condition UI) - [PASSED]

- **Details:** Started typing a draft response in the Quick Reply modal while a new message was received from the student.
- **Result:** The draft message was preserved and not deleted when the new incoming message appeared in the chat history.
- **Observation:** Focus remained in the text area, and no visual "flicker" was detected. However, this test further confirmed the background Dashboard widget sync issues (Issue 3).

### 5. Edge Case: "The Spammer" (Stress Test) - [PASSED]

- **Details:** Simulated an incoming burst of 10 messages in under 5 seconds using Playwright MCP.
- **Result:** The system handled the load without freezing. The "Recent Messages" widget correctly updated to show the final message ("Stress Test 10") and updated the notification badge to "10".
- **Observation:** Real-time sync worked as expected during this high-frequency burst, contrastingly to the failure in Scenario 1.

### 6. "The Dead Link" (Navigation vs Update) - [PASSED]

- **Details:** Attempted to click the student's name in the widget exactly when a new message was being received ("The Matrix" message from CLI).
- **Result:** Navigation remained functional. The application correctly redirected to the conversation view without any "Dead Link" errors or UI flicker, despite the underlying data update.
- **Observation:** High component stability during state re-renders.

### 7. Edge Case: "The Sleeping Tab" (Turbo Version) - [FAILED]

- **Details:** Simulated a short network disconnection (1 min) while messages were being sent by the student.
- **Result:** Upon returning to "Online" status, the widget failed to sync the missed messages automatically. A manual page refresh was required to update the message list.
- **Root Cause:** Lack of socket re-connection logic.

### 7.1. Unread Status Persistence (Extra) - [FAILED]

- **Details:** Verified if the "unread" indicator (purple dot) disappears after opening the Quick Reply modal or reading the message.
- **Result:** The purple dot persists even after the mentor interacts with the message. This confirms a mismatch between the UI notification state and the actual message read status. Logged as part of **[Issue 1]**.

### 8. Edge Case: "The Infinite Message" - [PASSED]

- **Details:** Received a 200-character string without spaces ("AAAAA...") to test layout stability and CSS text-overflow.
- **Result:** The layout remained stable. The widget correctly truncated the long string using an ellipsis (...), preventing any visual overflow or container breaking.

### 9. Multitasking Scenario (Simultaneous Reception) - [FAILED]

- **Details:** Kept the Dashboard open while receiving messages from a different account.
- **Result:** Messages do not appear in the "Recent Messages" widget in real-time. The user must manually refresh the page or exit and re-enter the conversation to see updates.
- **Evidence:** `image_07dba1.png` shows old data (2 days ago) while `image_082dbb.png` confirms the new message exists in the DB.

### 10. Network Resilience (Offline Simulation) - [FAILED]

- **Details:** Disconnected network via DevTools and attempted to send a message.
- **Result:** The application crashed (White Screen) with "Application error: a client-side exception has occurred (see the browser console for more information)". The user must refresh to recover.

---

## Issues Found

### Issue 1: Persistent Notification Indicator (Zombie Dot)

- **Severity:** Medium
- **Related Scenario:** [Scenario 7.1]
- **Description:** The purple notification dot persists even after the Mentor interacts with the message (opening the modal, reading, or replying). This behavior was previously addressed in MYM-96 but remains inconsistent.
- **Steps to Reproduce:**
  1. Receive a new message (purple dot appears).
  2. Open the "Quick Reply" modal from the Dashboard.
  3. Read and respond to the message.
  4. Close the modal.
- **Expected:** The purple notification dot should disappear once the message is read/replied to.
- **Actual:** The purple dot persists. It only clears after navigating to the full Messaging view.
- **Evidence:** Visual observation during MYM-96 fix re-test.

### Issue 2: Critical Application Crash on Network Loss [MYM-132]

- **Severity:** High / Critical
- **Related Scenario:** [Scenario 10]
- **Steps to Reproduce:**
  1. Open the Messaging widget on the Dashboard.
  2. Set browser network to "Offline" via DevTools.
  3. Type a message and click "Send".
- **Expected:** The system should show a friendly error message and keep the text.
- **Actual:** UI crashes into a white screen (Client-side exception).

### Issue 3: Dashboard Widget Fails to Sync Message Content in Real-Time

- **Severity:** High
- **Related Scenario:** [Scenario 1 & 9]
- **Steps to Reproduce:**
  1. Stay on the Dashboard page.
  2. Receive a message from another user.
- **Expected:** The "Recent Messages" widget should update the message preview text automatically to show the most recent content received.
- **Actual:** While notification indicators might trigger, the message text within the conversation item remains outdated (showing the previous message) until a manual page refresh.

---

## Observations & Recommendations

### Positive Findings:

- [To be completed tomorrow]

### Areas of Concern:

- Real-time event consistency seems lower in the Dashboard widget compared to the Inbox view.

### Recommendations for Automation:

- Automate the "Send & Close Modal" flow using Playwright.
- Create a regression test for the notification dot clearing logic.

---

## Next Steps

- [ ] Report critical bugs in Jira.
- [ ] Perform Database Testing (Supabase) to investigate the sync failure.
- [ ] Complete pending scenarios (Multitasking & Network).
