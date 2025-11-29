import { assert, assertEquals, assertStringIncludes } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { ical } from 'ical-generator';

Deno.test("Date formatting in different timezones", () => {
  const utcDate = new Date('2025-11-15T15:00:00Z'); // 10:00 AM EST, 7:00 AM PST

  const estTime = formatInTimeZone(utcDate, 'America/New_York', 'h:mm a zzz');
  assertEquals(estTime, '10:00 AM EST');

  const pstTime = formatInTimeZone(utcDate, 'America/Los_Angeles', 'h:mm a zzz');
  assertEquals(pstTime, '7:00 AM PST');
});

Deno.test("ICS file generation for basic event", () => {
  const sessionStart = new Date('2025-11-15T15:00:00Z');
  const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000); // 1 hour later

  const cal = ical({
    name: 'Test Calendar',
    timezone: 'America/New_York',
  });

  cal.createEvent({
    start: sessionStart,
    end: sessionEnd,
    summary: 'Mentorship Session with Test Mentor',
    description: 'Test Description',
    organizer: {
      name: 'Upex My Mentor',
      email: 'confirmations@upexmymentor.com',
    },
    attendees: [
      { name: 'Test Mentee', email: 'mentee@test.com', rsvp: true },
      { name: 'Test Mentor', email: 'mentor@test.com', rsvp: true },
    ],
  });

  const icsString = cal.toString();

  assertStringIncludes(icsString, 'BEGIN:VCALENDAR');
  assertStringIncludes(icsString, 'VERSION:2.0');
  assertStringIncludes(icsString, 'PRODID:-//ical-generator//github.com//');
  assertStringIncludes(icsString, 'SUMMARY:Mentorship Session with Test Mentor');
  assertStringIncludes(icsString, 'DTSTART;TZID=America/New_York:20251115T100000');
  assertStringIncludes(icsString, 'DTEND;TZID=America/New_York:20251115T110000');
  assertStringIncludes(icsString, 'ORGANIZER;CN="Upex My Mentor":mailto:confirmations@upexmymentor.com');
  assertStringIncludes(icsString, 'ATTENDEE;CN="Test Mentee";RSVP=TRUE:mailto:mentee@test.com');
});

Deno.test("ICS file generation across DST boundary (Fall back)", () => {
  // DST ends in America/New_York on Nov 2, 2025 at 2 AM
  const preDstChange = new Date('2025-11-02T06:00:00Z'); // 2 AM EDT (before change)
  const postDstChange = new Date('2025-11-02T07:00:00Z'); // 2 AM EST (after change)

  const cal = ical({
    name: 'DST Test Calendar',
    timezone: 'America/New_York',
  });

  cal.createEvent({
    start: preDstChange,
    end: new Date(preDstChange.getTime() + 60 * 60 * 1000),
    summary: 'Session before DST change',
  });

  cal.createEvent({
    start: postDstChange,
    end: new Date(postDstChange.getTime() + 60 * 60 * 1000),
    summary: 'Session after DST change',
  });

  const icsString = cal.toString();

  assertStringIncludes(icsString, 'TZID:America/New_York');
  assertStringIncludes(icsString, 'BEGIN:VTIMEZONE');
  assertStringIncludes(icsString, 'TZOFFSETFROM:-0400'); // EDT
  assertStringIncludes(icsString, 'TZOFFSETTO:-0500');   // EST
  assertStringIncludes(icsString, 'DTSTART;TZID=America/New_York:20251102T020000'); // Should handle the 2 AM shift
});
