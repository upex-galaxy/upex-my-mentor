# STORY-MYM-35: View Profile Reviews

**Jira Key:** MYM-35
**Epic:** MYM-32 - Reputation & Reviews System
**Status:** ASSIGNED
**Priority:** Medium

---

## User Story

As a user, I want to view ratings and reviews on user profiles so that I can make informed decisions

---

## Description

When viewing a user's public profile (especially mentors), users should be able to see the average rating and read reviews left by others. This transparency helps users assess the quality and reputation of mentors on the platform.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: User views a mentor's profile with reviews

* **Given:** A mentor has at least one review.
* **When:** A user views that mentor's public profile.
* **Then:** The profile displays the mentor's average rating (e.g., "4.5 stars out of 5").
* **And:** A list of recent reviews is displayed, showing the rating, comment, and date for each.

### Scenario 2: User views a profile with no reviews

* **Given:** A user profile has no reviews yet.
* **When:** Another user views that profile.
* **Then:** The profile shows "No reviews yet" or a similar message.

---

## Technical Notes

* Update the profile page to include a "Reviews" section.
* The backend will provide an endpoint to fetch all reviews for a given user, along with calculating the average rating.
* Consider pagination for the review list if there are many reviews.
* Display only public information (reviewer name, rating, comment, date), not the full session details.

---

## Definition of Done

* [ ] Code implemented to display reviews on user profiles.
* [ ] Unit tests for the review display components achieve > 80% coverage.
* [ ] Integration tests verify the correct reviews are fetched and displayed.
* [ ] E2E tests (Playwright) cover viewing profiles with and without reviews.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/STORY-MYM-35-view-profile-reviews/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/STORY-MYM-35-view-profile-reviews/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-35
