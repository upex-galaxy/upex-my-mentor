# STORY-MYM-27: Automated Payout Processing

**Jira Key:** MYM-27
**Epic:** MYM-23 - Payments & Payouts
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As the System, I want to automatically process a payout to the mentor after a 24-hour grace period post-session

---

## Description

This is a backend-only story. The system needs an automated process to find completed sessions that are eligible for payout and execute the transfer to the mentor's connected bank account.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: A session becomes eligible for payout

* **Given:** A session was completed more than 24 hours ago.
* **And:** The session's payout status is not 'paid_out'.
* **And:** The mentor has a valid, connected Stripe account.
* **When:** The daily payout cron job runs.
* **Then:** The system initiates a Stripe Transfer for the correct net amount to the mentor's account.
* **And:** The session's payout status is updated to 'paid_out' in the database.

### Scenario 2: Payout fails

* **Given:** A session is eligible for payout, but the mentor's Stripe account is restricted.
* **When:** The daily payout cron job runs.
* **Then:** The Stripe Transfer fails.
* **And:** The system logs the error for administrative review.
* **And:** The session's payout status remains unchanged.

---

## Technical Notes

* This will be implemented as a scheduled Supabase Function (cron job) that runs once a day.
* The function will query the `sessions` table for all records where `status = 'confirmed'`, `payout_status != 'paid_out'`, and `session_end_time < NOW() - INTERVAL '24 hours'`.
* For each eligible session, it will use the Stripe API to create a `Transfer` to the mentor's Stripe Connect account ID.
* Robust error handling and logging are critical.

---

## Definition of Done

* [ ] Supabase cron job and associated Edge Function are implemented.
* [ ] Logic for querying eligible sessions and creating Stripe Transfers is complete.
* [ ] Unit tests for the payout logic are written.
* [ ] Integration tests (in a test environment) verify that the cron job correctly identifies sessions and triggers transfers.
* [ ] Error logging is in place.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/stories/STORY-MYM-27-automated-payouts/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/stories/STORY-MYM-27-automated-payouts/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-27
