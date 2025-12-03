# STORY-MYM-12: Email Notification on Application Status

**Jira Key:** MYM-12
**Epic:** MYM-8 - Mentor Vetting & Onboarding
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a Mentor, I want to receive an email notification about the status of my application so that I know if I've been accepted

---

## Description

To ensure a good user experience, mentors should be automatically informed via email whether their application has been approved or rejected.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentor application is approved

* **Given:** An admin has just approved a mentor's application.
* **When:** The `vetting_status` is updated to 'approved'.
* **Then:** The system automatically sends an email to the mentor congratulating them on their approval.

### Scenario 2: Mentor application is rejected

* **Given:** An admin has just rejected a mentor's application.
* **When:** The `vetting_status` is updated to 'rejected'.
* **Then:** The system automatically sends a polite email to the mentor informing them that their application was not successful at this time.

---

## Technical Notes

* Use a Supabase Database Function to listen for changes to the `profiles` table.
* When the `vetting_status` of a mentor changes, the trigger will invoke a Supabase Edge Function.
* The Edge Function will use a transactional email service (e.g., Supabase default, SendGrid) to send the appropriate email template.

---

## Definition of Done

* [ ] Supabase trigger and Edge Function are implemented.
* [ ] Email templates for approval and rejection are created.
* [ ] Integration tests verify that the email function is called upon status change.
* [ ] Manual testing confirms emails are being sent and received correctly.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/STORY-MYM-12-email-notification-status/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-8-mentor-vetting-onboarding/stories/STORY-MYM-12-email-notification-status/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-12
