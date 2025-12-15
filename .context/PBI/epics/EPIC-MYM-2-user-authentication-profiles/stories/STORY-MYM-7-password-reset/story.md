# STORY-MYM-7: Password Reset

**Jira Key:** MYM-7
**Epic:** MYM-2 - User Authentication & Profiles
**Status:** RESOLVED
**Priority:** Medium
**Story Points:** 5

---

## User Story

As a user, I want to be able to reset my password so that I can regain access if I forget it

---

## Description

Users who have forgotten their password need a self-service way to regain access to their account securely.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: User requests a password reset link

* **Given:** A user is on the "Forgot Password" page.
* **When:** They enter their registered email address and submit the form.
* **Then:** The system sends a password reset email with a unique link to that email address.
* **And:** The user sees a confirmation message on the screen.

### Scenario 2: User successfully resets their password

* **Given:** A user has clicked the reset link from their email.
* **When:** They are on the "Reset Password" page and enter a new, secure password.
* **Then:** The system updates their password.
* **And:** They are redirected to the login page with a success message.

### Scenario 3: User enters a non-existent email

* **Given:** A user is on the "Forgot Password" page.
* **When:** They enter an email address that is not registered.
* **Then:** The system displays a confirmation message (to prevent user enumeration).

---

## Technical Notes

* Use Supabase Auth `resetPasswordForEmail` to send the magic link.
* Supabase handles the email template and the secure link generation.
* The frontend will have a specific page to handle the password update token from the URL.

---

## Definition of Done

* [ ] Code implemented for the "Forgot Password" and "Reset Password" pages.
* [ ] Unit tests for the form logic achieve > 80% coverage.
* [ ] Integration tests are not directly possible for email sending, but the API call to Supabase should be verified.
* [ ] E2E tests (Playwright) cover the flow of requesting a reset link.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/epic.md`
* **Feature Test Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/feature-test-plan.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-7-password-reset/test-cases.md`
* **QA Summary:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-7-password-reset/jira-qa-comment.md`
* **Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-7
