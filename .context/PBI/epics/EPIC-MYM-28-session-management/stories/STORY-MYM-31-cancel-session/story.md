# STORY-MYM-31: Cancel Session

**Jira Key:** MYM-31
**Epic:** MYM-28 - Session Management
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a user, I want to be able to cancel a session up to 24 hours in advance so that I have flexibility

---

## Description

Users need the ability to cancel a booked session if their plans change. To protect the mentor's time, this action is restricted to a window of more than 24 hours before the session starts, which also allows for a full refund.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: User successfully cancels a session

* **Given:** A user has an upcoming session that is more than 24 hours away.
* **When:** They click the "Cancel" button on their session dashboard for that session and confirm.
* **Then:** The session's status is updated to 'cancelled' in the database.
* **And:** A full refund is automatically issued to the mentee via the Stripe API.
* **And:** Both users receive a cancellation notification email.

### Scenario 2: User tries to cancel within the 24-hour window

* **Given:** A user has an upcoming session that is less than 24 hours away.
* **When:** They view the session on their dashboard.
* **Then:** The "Cancel" button is disabled or hidden, and a message indicates it's too late to cancel.

---

## Technical Notes

* The frontend will conditionally render the "Cancel" button based on the session's start time.
* The backend must have a secure function to process the cancellation.
* This function must re-verify the 24-hour rule before proceeding.
* It will then call the Stripe API to issue a refund for the associated payment.
* The function will also trigger notification emails.

---

## Definition of Done

* [ ] Code implemented for the cancellation button and backend function.
* [ ] Unit tests for the cancellation logic (24-hour rule) achieve > 80% coverage.
* [ ] Integration tests verify the database update, refund processing, and email notification trigger.
* [ ] E2E tests (Playwright) cover both successful cancellation and the disabled-button scenario.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-28-session-management/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-28-session-management/stories/STORY-MYM-31-cancel-session/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-28-session-management/stories/STORY-MYM-31-cancel-session/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-31
