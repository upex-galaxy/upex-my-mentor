# STORY-MYM-19: Set Mentor Weekly Availability

**Jira Key:** MYM-19
**Epic:** MYM-18 - Scheduling & Booking
**Status:** RESOLVED
**Priority:** Medium

---

## User Story

As a Mentor, I want to set my weekly availability on a calendar so that mentees know when I am available to book

---

## Description

Mentors need a simple interface to specify the days and times they are available for sessions. This availability will be used to show open slots to potential mentees.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentor sets their availability for the first time

* **Given:** A logged-in mentor is on their "Availability" settings page.
* **When:** They select "Mondays from 9:00 AM to 11:00 AM" and "Wednesdays from 2:00 PM to 5:00 PM" and save.
* **Then:** The system stores these recurring weekly time slots in the `availability` table.

### Scenario 2: Mentor updates their availability

* **Given:** A mentor has existing availability set.
* **When:** They remove the Monday slot and add a "Fridays from 10:00 AM to 12:00 PM" slot and save.
* **Then:** The system deletes their old availability and saves the new set.

---

## Technical Notes

* The UI should provide a weekly calendar view where mentors can click and drag to create blocks of time.
* The backend will receive an array of availability objects (e.g., `{day_of_week: 1, start_time: '09:00', end_time: '11:00'}`).
* The operation should be atomic: delete all existing availability for the mentor and insert the new set.
* All times should be stored in UTC in the database, based on the mentor's specified timezone during setup.

---

## Definition of Done

* [ ] Code implemented for the mentor availability calendar interface.
* [ ] Unit tests for the availability management logic achieve > 80% coverage.
* [ ] Integration tests verify that availability is correctly stored in the database.
* [ ] E2E tests (Playwright) cover a mentor creating, updating, and clearing their availability.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/stories/STORY-MYM-19-set-mentor-availability/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/stories/STORY-MYM-19-set-mentor-availability/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-19
