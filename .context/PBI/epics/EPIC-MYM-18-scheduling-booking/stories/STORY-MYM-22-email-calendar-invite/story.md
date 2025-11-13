# STORY-MYM-22: Email Confirmation and Calendar Invite

**Jira Key:** MYM-22
**Epic:** MYM-18 - Scheduling & Booking
**Status:** REFINEMENT
**Priority:** Medium

---

## User Story

As a user, I want to receive an email confirmation and a calendar invite for my booked session so that I don't miss it

---

## Description

Once a session is successfully paid for and confirmed, both the mentor and the mentee should receive an immediate notification via email, including a calendar invite to easily add the event to their personal calendars.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Session is confirmed

* **Given:** A mentee has successfully paid for a session.
* **When:** The system confirms the payment and updates the session status to 'confirmed'.
* **Then:** The system sends a confirmation email to both the mentee and the mentor.
* **And:** The email contains the session details (date, time, participants) and an attached `.ics` file (calendar invite).
* **And:** The calendar invite includes a link to the external video call.

---

## Technical Notes

* This process will be triggered by the payment confirmation webhook (see STORY-MYM-24).
* An Edge Function will be responsible for generating the emails and the `.ics` file.
* The function will fetch the mentee and mentor details to populate the email and invite.
* The `.ics` file can be generated using a library like `ics`.

---

## Definition of Done

* [ ] Code implemented in an Edge Function to send confirmation emails and calendar invites.
* [ ] Email templates are created.
* [ ] Unit tests for the `.ics` file generation logic.
* [ ] Integration tests verify that the function is triggered correctly after payment.
* [ ] Manual testing confirms that emails and invites are correct and functional.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/stories/STORY-MYM-22-email-calendar-invite/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/stories/STORY-MYM-22-email-calendar-invite/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-22
