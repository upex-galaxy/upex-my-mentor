# STORY-MYM-17: View Mentor Detailed Profile

**Jira Key:** MYM-17
**Epic:** MYM-13 - Mentor Discovery & Search
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a Mentee, I want to view a mentor's detailed public profile so that I can decide if they are a good fit for me

---

## Description

After finding a potentially interesting mentor in the gallery, a mentee needs to be able to click through to a full-page, detailed profile to learn more about them before making a decision to book.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentee views a mentor's profile

* **Given:** A mentee is on the mentor gallery page.
* **When:** They click on a mentor's card.
* **Then:** They are navigated to a new page dedicated to that mentor.
* **And:** The page displays the mentor's full name, bio, list of skills, years of experience, and hourly rate.

---

## Technical Notes

* Create a dynamic route for public mentor profiles (e.g., `/mentors/[mentor_id]`).
* The page will fetch the specific mentor's data from the `profiles` table based on the ID in the URL.
* This page should be server-side rendered (SSR) or statically generated (SSG) for SEO benefits.

---

## Definition of Done

* [ ] Code implemented for the detailed mentor profile page.
* [ ] Unit tests for the profile page components achieve > 80% coverage.
* [ ] Integration tests verify that the correct mentor data is fetched and displayed.
* [ ] E2E tests (Playwright) cover navigating from the gallery to a profile page.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-17-view-mentor-profile/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-17-view-mentor-profile/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-17
