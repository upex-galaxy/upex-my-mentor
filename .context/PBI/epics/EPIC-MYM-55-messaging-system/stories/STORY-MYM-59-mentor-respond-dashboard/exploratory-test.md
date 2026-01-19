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
- **Scenarios Tested:** 2 of 10
- **Issues Found:** 2

---

## Scenarios Tested

### 1. Real-time Message Sync (Smoke Test Re-run) - [FAILED]

- **Details:** Verifying the widget's automatic refresh after a student sends a message.
- **Result:** Widget does not update (Student 21:10 vs Mentor 21:03). Confirmed after clearing cache/cookies.

### 9. Multitasking Scenario (Simultaneous Reception) - [PENDING]

- **Details:** Receiving a message in a conversation that is NOT active in the modal.
- **Objective:** Validate if the notification dot updates correctly for background conversations.

### 10. Network Resilience (Offline Simulation) - [FAILED]

- **Details:** Disconnected network via DevTools and attempted to send a message.
- **Result:** The application crashed (White Screen) with "Application error: a client-side exception has occurred (see the browser console for more information)". The user must refresh to recover.

---

## Issues Found

### Issue 1: Persistent Notification Indicator (Zombie Dot)

- **Severity:** Medium
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
- **Steps to Reproduce:**
  1. Open the Messaging widget on the Dashboard.
  2. Set browser network to "Offline" via DevTools.
  3. Type a message and click "Send".
- **Expected:** The system should show a friendly error message and keep the text.
- **Actual:** UI crashes into a white screen (Client-side exception).

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
