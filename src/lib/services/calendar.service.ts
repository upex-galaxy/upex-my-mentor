import ical, { ICalCalendar, ICalEventData } from 'ical-generator';
import { formatInTimeZone } from 'date-fns-tz';

interface CalendarInviteData {
  sessionDatetime: Date;
  durationMinutes: number;
  mentorName: string;
  menteeName: string;
  mentorEmail: string;
  menteeEmail: string;
  videocallUrl: string;
  recipientType: 'mentor' | 'mentee';
  timezone: string;
}

export class CalendarService {
  /**
   * Generate a .ics file for a mentorship session
   * @param data - Session and participant information
   * @returns Buffer containing the .ics file
   */
  static generateICS(data: CalendarInviteData): Buffer {
    const {
      sessionDatetime,
      durationMinutes,
      mentorName,
      menteeName,
      mentorEmail,
      menteeEmail,
      videocallUrl,
      recipientType,
      timezone,
    } = data;

    // Calculate end time
    const endDatetime = new Date(sessionDatetime);
    endDatetime.setMinutes(endDatetime.getMinutes() + durationMinutes);

    // Determine the other participant's name based on recipient
    const otherParticipantName = recipientType === 'mentor' ? menteeName : mentorName;

    // Create calendar
    const calendar: ICalCalendar = ical({
      name: 'Upex My Mentor - Mentorship Session',
      prodId: '//Upex My Mentor//Booking Confirmation//EN',
      timezone: timezone,
    });

    // Create event
    const eventData: ICalEventData = {
      start: sessionDatetime,
      end: endDatetime,
      summary: `Mentorship Session with ${otherParticipantName}`,
      description: `Your mentorship session is confirmed!\n\nMentor: ${mentorName}\nMentee: ${menteeName}\n\nJoin the video call: ${videocallUrl}\n\nPowered by Upex My Mentor`,
      location: videocallUrl,
      url: videocallUrl,
      organizer: {
        name: 'Upex My Mentor',
        email: 'confirmations@upexmymentor.com',
      },
      attendees: [
        {
          name: mentorName,
          email: mentorEmail,
          rsvp: true,
          status: 'ACCEPTED',
        },
        {
          name: menteeName,
          email: menteeEmail,
          rsvp: true,
          status: 'ACCEPTED',
        },
      ],
    };

    calendar.createEvent(eventData);

    // Return as buffer
    return Buffer.from(calendar.toString(), 'utf-8');
  }

  /**
   * Format a date for display in email content
   * @param date - The date to format
   * @param timezone - The recipient's timezone
   * @returns Formatted date string
   */
  static formatDateForEmail(date: Date, timezone: string): string {
    // Format: "Monday, January 15 at 3:00 PM (America/Los_Angeles)"
    const dayOfWeek = formatInTimeZone(date, timezone, 'EEEE');
    const monthDay = formatInTimeZone(date, timezone, 'MMMM d');
    const time = formatInTimeZone(date, timezone, 'h:mm a');
    const timezoneName = formatInTimeZone(date, timezone, 'zzz');

    return `${dayOfWeek}, ${monthDay} at ${time} (${timezoneName})`;
  }
}
