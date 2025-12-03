# STORY-MYM-6: Mentor Detailed Profile Creation

**Jira Key:** MYM-6
**Epic:** MYM-2 - User Authentication & Profiles
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a Mentor, I want to create a detailed profile including my skills, experience, hourly rate, and a bio so that I can attract mentees

---

## Description

A mentor needs a comprehensive profile to showcase their expertise and attract potential mentees. This includes their name, bio, a list of skills, years of experience, and their hourly rate.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentor completes their profile successfully

* **Given:** A logged-in mentor with a 'pending' or 'approved' status is on their profile settings page.
* **When:** They fill in their full name, bio, skills, experience, and a valid hourly rate, and click "Save".
* **Then:** The system saves this information to their profile.
* **And:** Their public profile page is updated with the new details.

### Scenario 2: Mentor provides an invalid hourly rate

* **Given:** A mentor is editing their profile.
* **When:** They enter a non-numeric or negative value for the hourly rate.
* **Then:** The system displays a validation error: "Hourly rate must be a positive number."

### Scenario 3: Mentor provides no skills

* **Given:** A mentor is editing their profile.
* **When:** They attempt to save the profile without adding any skills.
* **Then:** The system displays a validation error: "At least one skill must be added."

---

## Technical Notes

* Perform an `UPSERT` on the `profiles` table.
* Skills should be stored in a related table (`mentor_skills`) or as a JSONB array in the `profiles` table. The functional spec suggests `mentor_skills`.
* The form should handle adding/removing skills dynamically.

---

## Definition of Done

* [ ] Code implemented for the detailed mentor profile form.
* [ ] Unit tests for the profile update logic achieve > 80% coverage.
* [ ] Integration tests verify data is correctly saved to the `profiles` and `mentor_skills` tables.
* [ ] E2E tests (Playwright) cover a mentor successfully updating their profile and error scenarios.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-6-mentor-profile/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-6-mentor-profile/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-6
