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

* **Implementation:** Vercel Cron Job triggering a Next.js API route (`/api/cron/process-payouts`).
* **Schedule:** Daily at midnight UTC (`0 0 * * *`).
* The function queries the `bookings` table for completed sessions where `completed_at < NOW() - 24 hours` and transaction not yet in `payout_items`.
* For each eligible session, it uses the Stripe API to create a `Transfer` to the mentor's Stripe Connect account ID.
* Robust error handling and logging are critical.

### Constraints

* **Vercel Hobby Plan Limitation:** Cron jobs are limited to daily frequency minimum. Hourly schedules (`0 * * * *`) are not allowed on the Hobby plan - requires Pro plan ($20/month) for more frequent execution.
* If more frequent payout processing is needed in the future, options are:
  1. Upgrade to Vercel Pro
  2. Migrate to Supabase pg_cron
  3. Use an external scheduler service

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
