# STORY-MYM-20: Timezone Conversion for Availability

**Jira Key:** MYM-20
**Epic:** MYM-18 - Scheduling & Booking
**Status:** RESOLVED
**Priority:** Medium

---

## User Story

As a Mentee, I want to see a mentor's availability in my own timezone so that I can avoid confusion

---

## Description

To prevent booking errors and confusion, the system must automatically convert the mentor's stored availability into the viewing mentee's local timezone.

---

## Acceptance Criteria (Gherkin)

### Scenario 1: Mentee in a different timezone views availability

* **Given:** A mentor in London (GMT) has set availability for 9:00 AM.
* **And:** A mentee in New York (EST, GMT-5) is viewing that mentor's profile.
* **When:** The mentee looks at the mentor's booking calendar.
* **Then:** The system displays the 9:00 AM GMT slot as 4:00 AM EST to the mentee.

---

## Technical Notes

* The frontend will detect the user's browser timezone.
* When fetching availability data, the backend can either send UTC times and have the client convert them, or the client can send its timezone in the request header and the server can perform the conversion.
* Client-side conversion is generally preferred to offload the server.
* Libraries like `date-fns-tz` or `moment-timezone` are essential for this.

---

## Definition of Done

* [ ] Code implemented for timezone detection and conversion on the booking calendar.
* [ ] Unit tests for the timezone conversion logic are comprehensive.
* [ ] E2E tests (Playwright) could simulate different browser timezones to verify correct display.
* [ ] Code review has been completed and approved.
* [ ] All related documentation is updated.
* [ ] Deployed to the staging environment.

---

## Related Documentation

* **Epic:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/epic.md`
* **Test Cases:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/stories/STORY-MYM-20-timezone-conversion/test-cases.md`
* **Implementation Plan:** `.context/PBI/epics/EPIC-MYM-18-scheduling-booking/stories/STORY-MYM-20-timezone-conversion/implementation-plan.md`
* **Jira:** https://upexgalaxy61.atlassian.net/browse/MYM-20
