# STORY-MYM-33: Mentee Reviews Mentor

**Jira Key:** MYM-33
**Epic:** MYM-32 - Reputation & Reviews System
**Status:** ASSIGNED
**Priority:** Medium

---

## User Story

As a Mentee, I want to rate and leave a comment about my mentor after a session so that I can share my experience

---

## Description

After completing a session with a mentor, mentees should be encouraged to provide feedback by rating their experience and optionally leaving a written review. This feedback helps future mentees make informed decisions.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentee submits a review

* **Given:** A mentee has completed a session.
* **When:** They navigate to that past session and click "Leave a Review".
* **Then:** They are shown a form with a 1-5 star rating and a text field for comments.
* **And:** After they submit, the review is saved and associated with the mentor's profile.

### Scenario 2: Mentee tries to review the same session twice

* **Given:** A mentee has already left a review for a specific session.
* **When:** They try to review that session again.
* **Then:** The system prevents duplicate reviews and shows an appropriate message.

---

## Technical Notes

* Create a reviews interface that can be accessed from the session dashboard.
* The backend will store the review in a `reviews` table with fields for `session_id`, `reviewer_id`, `reviewee_id`, `rating`, `comment`, and timestamps.
* Apply validation rules to ensure a review is only submitted once per session.

---

## Definition of Done

* [ ] Code implemented for the review form and submission logic.
* [ ] Unit tests for the review submission logic achieve > 80% coverage.
* [ ] Integration tests verify the review is correctly stored in the database.
* [ ] E2E tests (Playwright) cover a mentee leaving a review.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/STORY-MYM-33-mentee-review-mentor/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-32-reputation-reviews-system/stories/STORY-MYM-33-mentee-review-mentor/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-33
