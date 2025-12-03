# STORY-MYM-21: Book a Session

**Jira Key:** MYM-21
**Epic:** MYM-18 - Scheduling & Booking
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a Mentee, I want to select an open time slot and book a one-hour session so that I can schedule my mentorship

---

## Description

This is the critical action where a mentee finalizes their choice. They need to be able to select an available one-hour slot from a mentor's calendar and initiate the booking process, which will lead to payment.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentee successfully books a session

* **Given:** A mentee is viewing an approved mentor's profile with available time slots.
* **When:** They click on an available one-hour slot, for example, "4:00 PM on October 28th".
* **And:** They confirm the booking.
* **Then:** The system creates a new record in the `sessions` table with a 'pending_payment' status.
* **And:** The system redirects the mentee to the Stripe checkout page.

### Scenario 2: Mentee tries to book a taken slot

* **Given:** A time slot was just booked by another mentee.
* **When:** A different mentee who still sees the slot as open tries to book it.
* **Then:** The system shows an error message: "Sorry, this time slot is no longer available."

---

## Technical Notes

* The booking calendar should display available slots based on the mentor's `availability` and existing `sessions`.
* Clicking a slot will trigger a function to create a session record.
* This function must perform a final check to ensure the slot hasn't been taken (to handle race conditions).
* The function will then call the payment creation logic (see EPIC-MYM-23).

---

## Definition of Done

* [ ] Code implemented for the booking calendar and session creation logic.
* [ ] Unit tests for the booking logic, including conflict detection, achieve > 80% coverage.
* [ ] Integration tests verify the creation of the `sessions` record and the handoff to the payment system.
* [ ] E2E tests (Playwright) cover a mentee successfully selecting a time and starting the checkout process.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/stories/STORY-MYM-21-book-session/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/stories/STORY-MYM-21-book-session/implementation-plan.md`
* **Jira:** https://upexgalaxy62.atlassian.net/browse/MYM-21
