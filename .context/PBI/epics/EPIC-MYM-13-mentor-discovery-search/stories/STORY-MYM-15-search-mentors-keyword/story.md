# STORY-MYM-15: Search Mentors by Keyword

**Jira Key:** MYM-15
**Epic:** MYM-13 - Mentor Discovery & Search
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a Mentee, I want to search for mentors by keyword so that I can find relevant experts

---

## Description

To quickly find relevant mentors, a mentee should be able to type a keyword (like a programming language, tool, or concept) into a search bar and see a list of matching mentors.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentee performs a successful search

* **Given:** A mentee is on the mentor gallery page.
* **When:** They type "React" into the search bar and press Enter.
* **Then:** The gallery updates to show only mentors who have "React" in their profile (e.g., in their bio or skills).

### Scenario 2: Search yields no results

* **Given:** A mentee is on the mentor gallery page.
* **When:** They type a keyword that matches no mentors, like "Cobol".
* **Then:** The gallery displays a message indicating that no mentors were found.

---

## Technical Notes

* The search input will be a controlled component in the frontend.
* The backend API endpoint for listing mentors will be updated to accept a `search_query` parameter.
* The SQL query will use `LIKE` or full-text search (`tsvector`) on the `profiles` table to find matches in fields like `bio`, `full_name`, and `skills`.
* Sanitize all search inputs to prevent security vulnerabilities.

---

## Definition of Done

* [ ] Code implemented for the search bar and API integration.
* [ ] Unit tests for the search component and API logic achieve > 80% coverage.
* [ ] Integration tests verify the search query correctly filters the results.
* [ ] E2E tests (Playwright) cover successful searches and no-result scenarios.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-15-search-mentors-keyword/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-13-mentor-discovery-search/stories/STORY-MYM-15-search-mentors-keyword/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-15
