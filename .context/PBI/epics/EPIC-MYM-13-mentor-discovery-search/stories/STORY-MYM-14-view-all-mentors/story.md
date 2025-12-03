# STORY-MYM-14: View All Available Mentors

**Jira Key:** MYM-14
**Epic:** MYM-13 - Mentor Discovery & Search
**Status:** In Progress
**Priority:** Medium

---

## User Story

As a Mentee, I want to see a gallery of all available mentors so that I can browse my options

---

## Description

A mentee needs a primary page where they can see all the mentors who are available on the platform. This serves as the main entry point for discovering talent.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Viewing the mentor gallery

* **Given:** A user (mentee or visitor) navigates to the "Find a Mentor" page.
* **When:** The page loads.
* **Then:** They see a paginated grid or list of mentor cards.
* **And:** Each card displays the mentor's name, title, and key skills.
* **And:** Only mentors with an 'approved' vetting status are shown.

---

## Technical Notes

* Create a publicly accessible page.
* The backend will provide a paginated API endpoint that fetches all profiles where `role = 'mentor'` and `vetting_status = 'approved'`.
* The frontend will display the data in a user-friendly card layout.

---

## Definition of Done

* [ ] Code implemented for the mentor gallery page.
* [ ] Unit tests for the page and components achieve > 80% coverage.
* [ ] Integration tests verify that only approved mentors are fetched and displayed.
* [ ] E2E tests (Playwright) cover navigating to the gallery and viewing mentors.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-14-view-all-mentors/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-14-view-all-mentors/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-14
