# STORY-MYM-29: Session Dashboard

**Jira Key:** MYM-29
**Epic:** MYM-28 - Session Management
**Status:** RESOLVED
**Priority:** Medium

---

## User Story

As a user, I want a simple dashboard where I can see my upcoming and past sessions so that I can manage my schedule

---

## Description

Both mentees and mentors need a centralized dashboard to easily see their upcoming appointments and review their session history.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: User views their dashboard

* **Given:** A logged-in user has at least one upcoming and one past session.
* **When:** They navigate to their "My Sessions" dashboard.
* **Then:** They see two distinct lists: "Upcoming Sessions" and "Past Sessions".
* **And:** Each item in the lists shows the other participant's name, the date, and the time of the session.

---

## Technical Notes

* Create a new page for the user dashboard.
* The backend will provide an endpoint that fetches all sessions where the `mentee_id` or `mentor_id` matches the authenticated user's ID.
* The endpoint should return the data partitioned into upcoming and past sessions based on the current time.

---

## Definition of Done

* [ ] Code implemented for the session dashboard page.
* [ ] Unit tests for the dashboard components achieve > 80% coverage.
* [ ] Integration tests verify the correct sessions are fetched and displayed for the user.
* [ ] E2E tests (Playwright) cover a user viewing their upcoming and past sessions.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-28-session-management/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-28-session-management/stories/STORY-MYM-29-session-dashboard/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-28-session-management/stories/STORY-MYM-29-session-dashboard/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-29
