# STORY-MYM-25: Stripe Connect Onboarding

**Jira Key:** MYM-25
**Epic:** MYM-23 - Payments & Payouts
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a Mentor, I want to connect my bank account (via Stripe Connect) so that I can receive payouts

---

## Description

For mentors to receive their earnings, they must be able to securely provide their bank account and identity information to the payment processor.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentor successfully onboards with Stripe Connect

* **Given:** A logged-in mentor is on their "Payouts" settings page.
* **When:** They click "Connect Bank Account".
* **Then:** They are redirected to the Stripe Connect onboarding flow.
* **And:** After completing the Stripe form, they are redirected back to the platform.
* **And:** Their profile is now marked as ready for payouts.

---

## Technical Notes

* Use Stripe Connect Express accounts for mentor onboarding.
* The backend will generate a Stripe Account Link for the mentor.
* The frontend will redirect the mentor to this link.
* A webhook will listen for `account.updated` events from Stripe to track the mentor's onboarding status.
* The mentor's Stripe Account ID will be stored in the `profiles` table.

---

## Definition of Done

* [ ] Code implemented to generate Stripe Connect links and handle redirects.
* [ ] Webhook handler is set up to listen for account status updates.
* [ ] Integration tests verify the creation of Connect accounts and storage of the account ID.
* [ ] E2E tests (Playwright) cover the redirection flow to and from Stripe.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/stories/STORY-MYM-25-stripe-connect/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/stories/STORY-MYM-25-stripe-connect/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-25
