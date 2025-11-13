# STORY-MYM-26: Mentor Earnings Dashboard

**Jira Key:** MYM-26
**Epic:** MYM-23 - Payments & Payouts
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a Mentor, I want to see a record of my earnings so that I can track my income from the platform

---

## Description

Mentors need a simple dashboard to see a history of their completed sessions and the corresponding earnings, including which sessions have been paid out.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentor views their earnings

* **Given:** A logged-in mentor is on their "Earnings" dashboard.
* **When:** The page loads.
* **Then:** They see a list of all their completed sessions.
* **And:** For each session, it shows the date, mentee name, gross amount, platform fee, and net earning.
* **And:** It displays the status of the payout (e.g., 'Pending', 'Paid Out').

---

## Technical Notes

* Create a new page for the mentor's earnings dashboard.
* The backend will provide an endpoint that fetches all `sessions` for the mentor where the status is 'confirmed'.
* The endpoint should join with payment information to display the status.

---

## Definition of Done

* [ ] Code implemented for the earnings dashboard page.
* [ ] Unit tests for the data display components achieve > 80% coverage.
* [ ] Integration tests verify the correct calculation and display of earnings.
* [ ] E2E tests (Playwright) cover a mentor viewing their earnings.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/stories/STORY-MYM-26-mentor-earnings-dashboard/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-23-payments-payouts/stories/STORY-MYM-26-mentor-earnings-dashboard/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-26
