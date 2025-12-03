# STORY-MYM-30: Join Video Call

**Jira Key:** MYM-30
**Epic:** MYM-28 - Session Management
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a user, I want to be able to join a video call for my session (via a provided link) so that we can communicate

---

## Description

For the MVP, sessions will be conducted on an external video conferencing service. Users need a clear and easy way to access the link for their scheduled session.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: User joins a video call

* **Given:** A user is on their session dashboard and it is near the time of an upcoming session.
* **When:** They click the "Join Call" button for that session.
* **Then:** They are opened in a new tab to a pre-generated Google Meet or similar video call link.

---

## Technical Notes

* A unique meeting link needs to be generated for each session. This could be done when the session is confirmed.
* For the MVP, a simple solution might be to store a static link or have a convention, but a more robust solution would generate links via an API (e.g., Google Calendar API).
* The link will be stored in the `sessions` table.
* The "Join Call" button should ideally become active only 10-15 minutes before the session starts.

---

## Definition of Done

* [ ] Code implemented to display the "Join Call" link on the session dashboard.
* [ ] Logic to generate and store the video call link is in place.
* [ ] E2E tests (Playwright) verify that clicking the button opens the correct link.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-28-session-management/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-28-session-management/stories/STORY-MYM-30-join-video-call/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-28-session-management/stories/STORY-MYM-30-join-video-call/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-30
