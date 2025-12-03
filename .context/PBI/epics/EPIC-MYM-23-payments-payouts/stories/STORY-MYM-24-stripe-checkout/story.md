# STORY-MYM-24: Stripe Checkout Integration

**Jira Key:** MYM-24
**Epic:** MYM-23 - Payments & Payouts
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a Mentee, I want to securely enter my credit card details at checkout so that I can pay for a session

---

## Description

After selecting a time slot, the mentee must be able to complete the booking by paying for the session through a secure payment gateway.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Successful Payment

* **Given:** A mentee has selected a time slot and is on the checkout page.
* **When:** They enter valid credit card information into the Stripe payment form and submit.
* **Then:** Stripe processes the payment successfully.
* **And:** The system receives a `checkout.session.completed` webhook from Stripe.
* **And:** The `sessions` table record is updated from 'pending_payment' to 'confirmed'.
* **And:** The mentee is redirected to a booking confirmation page.

### Scenario 2: Failed Payment

* **Given:** A mentee is on the checkout page.
* **When:** Their payment is declined by the card issuer.
* **Then:** Stripe displays an error message to the mentee.
* **And:** The session status remains 'pending_payment'.

---

## Technical Notes

* Integrate Stripe Checkout for the payment flow.
* The backend will create a Stripe Checkout Session linked to the `session_id`.
* A Vercel or Supabase Edge Function will act as the webhook endpoint to listen for Stripe events.
* The webhook handler MUST verify the Stripe signature to ensure the request is authentic.
* Upon successful payment, the webhook handler updates the session status in the database.

---

## Definition of Done

* [ ] Code implemented for Stripe Checkout integration.
* [ ] Webhook handler function is created and deployed.
* [ ] Unit tests for the webhook logic achieve > 80% coverage.
* [ ] Integration tests verify the end-to-end flow from checkout to database update.
* [ ] E2E tests (Playwright) cover a successful payment and redirection.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/stories/STORY-MYM-24-stripe-checkout/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/stories/STORY-MYM-24-stripe-checkout/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-24
