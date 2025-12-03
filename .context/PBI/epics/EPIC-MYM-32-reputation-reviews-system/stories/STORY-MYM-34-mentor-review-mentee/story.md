# STORY-MYM-34: Mentor Reviews Mentee

**Jira Key:** MYM-34
**Epic:** MYM-32 - Reputation & Reviews System
**Status:** ASSIGNED
**Priority:** Medium

---

## User Story

As a Mentor, I want to rate and leave a comment about my mentee after a session so that I can provide feedback and build trust

---

## Description

Mentors should also have the ability to provide feedback on their mentees. This reciprocal review system helps maintain a quality community and provides accountability for all participants.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentor submits a review

* **Given:** A mentor has completed a session.
* **When:** They navigate to that past session and click "Leave a Review".
* **Then:** They are shown a form with a 1-5 star rating and a text field for comments.
* **And:** After they submit, the review is saved and associated with the mentee's profile.

### Scenario 2: Both mentor and mentee review each other

* **Given:** Both a mentor and a mentee have left reviews for the same session.
* **When:** Either of them views the session details.
* **Then:** They can see each other's reviews (mutual visibility).

---

## Technical Notes

* The review flow is the same as for mentees but with the roles reversed.
* The same `reviews` table will store reviews from both mentors and mentees.
* The UI should make it clear who is reviewing whom based on the logged-in user's role in the session.

---

## Definition of Done

* [ ] Code implemented for mentors to leave reviews.
* [ ] Unit tests for the mentor review logic achieve > 80% coverage.
* [ ] Integration tests verify the review is correctly stored in the database.
* [ ] E2E tests (Playwright) cover a mentor leaving a review.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/STORY-MYM-34-mentor-review-mentee/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/STORY-MYM-34-mentor-review-mentee/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-34
