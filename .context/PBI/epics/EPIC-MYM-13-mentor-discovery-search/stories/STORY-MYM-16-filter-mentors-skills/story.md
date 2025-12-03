# STORY-MYM-16: Filter Mentors by Skills

**Jira Key:** MYM-16
**Epic:** MYM-13 - Mentor Discovery & Search
**Status:** BLOCKED
**Priority:** Medium

---

## User Story

As a Mentee, I want to filter mentors by their skills or technologies so that I can narrow down my search

---

## Description

In addition to a free-text search, mentees need a more structured way to find mentors by selecting from a predefined list of skills or technologies.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentee applies a skill filter

* **Given:** A mentee is on the mentor gallery page.
* **When:** They select the "Python" and "Django" skill tags from the filter options.
* **Then:** The gallery updates to show only mentors who have both "Python" and "Django" listed as skills.

### Scenario 2: Combining filters and search

* **Given:** A mentee has filtered for mentors with the "JavaScript" skill.
* **When:** They then type "Node.js" into the search bar.
* **Then:** The gallery updates to show mentors who have the "JavaScript" skill AND have "Node.js" in their profile.

---

## Technical Notes

* The filter UI could be a multi-select dropdown or a list of checkboxes.
* The API endpoint will be updated to accept a `skill_filter` parameter (an array of strings).
* The backend query will join `profiles` with `mentor_skills` and use an `IN` clause or array containment (`@>`) to filter by skills.

---

## Definition of Done

* [ ] Code implemented for the filter UI and API integration.
* [ ] Unit tests for the filter components and API logic achieve > 80% coverage.
* [ ] Integration tests verify that skill filters work correctly, including in combination with search.
* [ ] E2E tests (Playwright) cover applying and clearing filters.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-16-filter-mentors-skills/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-16-filter-mentors-skills/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-16
