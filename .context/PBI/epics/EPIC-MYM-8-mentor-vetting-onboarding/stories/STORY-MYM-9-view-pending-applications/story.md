# STORY-MYM-9: View Pending Mentor Applications

**Jira Key:** MYM-9
**Epic:** MYM-8 - Mentor Vetting & Onboarding
**Status:** RESOLVED
**Priority:** Medium

---

## User Story

As an Admin, I want to view a list of pending mentor applications so that I can manage the vetting pipeline

---

## Description

Administrators need a centralized place to see all mentor applications that are awaiting review. This allows them to efficiently manage the queue of potential mentors.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Admin views pending applications

* **Given:** An administrator is logged into the admin dashboard.
* **When:** They navigate to the "Mentor Applications" section.
* **Then:** They see a list of all users with the role 'mentor' and a `vetting_status` of 'pending'.
* **And:** The list includes the mentor's name, email, and application date.

---

## Technical Notes

* Create an admin-only page/section.
* The backend must have an endpoint protected by RLS that only allows users with an 'admin' role to access it.
* The endpoint will query the `profiles` table for `role = 'mentor'` and `vetting_status = 'pending'`.

---

## Definition of Done

* [ ] Code implemented for the admin view of pending mentors.
* [ ] Unit tests for the data fetching logic achieve > 80% coverage.
* [ ] Integration tests verify that the RLS policy correctly restricts access.
* [ ] E2E tests (Playwright) cover an admin logging in and viewing the list.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/STORY-MYM-9-view-pending-applications/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/STORY-MYM-9-view-pending-applications/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-9
