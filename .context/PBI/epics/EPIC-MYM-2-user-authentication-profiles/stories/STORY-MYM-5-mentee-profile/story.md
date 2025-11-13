# STORY-MYM-5: Mentee Basic Profile Creation

**Jira Key:** MYM-5
**Epic:** MYM-2 - User Authentication & Profiles
**Status:** RESOLVED
**Priority:** Medium

---

## User Story

As a Mentee, I want to create a basic profile with my name and a short bio so that mentors know who I am

---

## Description

After registering, a mentee should be able to add their full name and a short biography to their profile. This information helps provide context to mentors they interact with.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentee updates their profile

* **Given:** A logged-in mentee is on their profile settings page.
* **When:** They enter their full name and a bio, and click "Save".
* **Then:** The system saves the information to their profile.
* **And:** The updated information is displayed on their profile page.

---

## Technical Notes

* Perform an `UPSERT` operation on the `profiles` table for the authenticated user's ID.
* The profile form should be pre-populated with existing data.

---

## Definition of Done

* [ ] Code implemented for the mentee profile form.
* [ ] Unit tests for the profile update logic achieve > 80% coverage.
* [ ] Integration tests verify data is correctly saved to the `profiles` table.
* [ ] E2E tests (Playwright) cover a mentee successfully updating their profile.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-5-mentee-profile/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-5-mentee-profile/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-5
