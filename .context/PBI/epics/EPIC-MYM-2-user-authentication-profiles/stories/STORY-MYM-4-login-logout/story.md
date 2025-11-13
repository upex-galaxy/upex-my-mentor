# STORY-MYM-4: User Login and Logout

**Jira Key:** MYM-4
**Epic:** MYM-2 - User Authentication & Profiles
**Status:** RESOLVED
**Priority:** Medium

---

## User Story

As a user, I want to log in and log out so that I can securely access my account

---

## Description

A registered user must be able to log in with their email and password to access their dashboard and features. They must also be able to log out to end their session securely.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Successful Login

* **Given:** A registered user is on the login page.
* **When:** They enter their correct email and password.
* **Then:** The system authenticates them and redirects them to their dashboard.

### Scenario 2: Incorrect Credentials

* **Given:** A user is on the login page.
* **When:** They enter an incorrect email or password.
* **Then:** The system displays a clear error message: "Invalid login credentials."

### Scenario 3: Successful Logout

* **Given:** An authenticated user is on the platform.
* **When:** They click the "Logout" button.
* **Then:** The system terminates their session and redirects them to the homepage.

---

## Technical Notes

* Use Supabase Auth `signInWithPassword` for logging in.
* Use Supabase Auth `signOut` for logging out.
* Manage JWT session client-side.

---

## Definition of Done

* [ ] Code implemented and functioning for login/logout flows.
* [ ] Unit tests for the authentication logic achieve > 80% coverage.
* [ ] Integration tests verify session creation and termination.
* [ ] E2E tests (Playwright) cover successful login, failed login, and logout.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-4-login-logout/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-2-user-authentication-profiles/stories/STORY-MYM-4-login-logout/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-4
