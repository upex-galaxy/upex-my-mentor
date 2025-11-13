# STORY-MYM-3: User Sign Up

**Jira Key:** MYM-3
**Epic:** MYM-2 - User Authentication & Profiles
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a new user, I want to sign up with my email and password so that I can create an account

---

## Description

The user must be able to create a new account on the platform using their email address and a secure password. The system should differentiate between 'mentor' and 'mentee' roles during this process.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Successful Mentee Registration

* **Given:** A new user is on the registration page.
* **When:** They enter a valid, unique email, a secure password (8+ characters), and select the 'mentee' role.
* **Then:** The system creates their account, logs them in, and creates a basic profile entry.

### Scenario 2: Successful Mentor Registration

* **Given:** A new user is on the registration page.
* **When:** They enter a valid, unique email, a secure password, and select the 'mentor' role.
* **Then:** The system creates their account, logs them in, and creates a profile entry with a 'pending' vetting status.

### Scenario 3: Email Already Exists

* **Given:** A user is on the registration page.
* **When:** They enter an email address that is already registered.
* **Then:** The system displays a clear error message: "This email address is already in use."

### Scenario 4: Invalid Password

* **Given:** A user is on the registration page.
* **When:** They enter a password with fewer than 8 characters.
* **Then:** The system displays a validation error: "Password must be at least 8 characters long."

---

## Technical Notes

* Use Supabase Auth `signUp` method.
* The client will pass the selected `role` ('mentor' or 'mentee') in the metadata.
* A new record will be created in the `public.profiles` table linked to the `auth.users` UUID.
* Passwords are automatically hashed by Supabase.

---

## Definition of Done

* [ ] Code implemented and functioning for registration flow.
* [ ] Unit tests for the registration logic achieve > 80% coverage.
* [ ] Integration tests verify user creation in Supabase Auth and `profiles` table.
* [ ] E2E tests (Playwright) cover successful registration and error scenarios.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-3-user-signup/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-3-user-signup/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-3
