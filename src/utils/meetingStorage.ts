import { MeetingRecord, CalendarEvent } from '../types';

export const DEMO_MEETING_IDS = new Set(['meet-1', 'meet-2', 'meet-3', 'meet-4']);
export const DEMO_CALENDAR_IDS = new Set(['cal-1', 'cal-2', 'cal-3']);

/**
 * Filter out any hardcoded legacy demo meetings from an array
 */
export function filterOutDemoMeetings(meetings: MeetingRecord[]): MeetingRecord[] {
  if (!Array.isArray(meetings)) return [];
  return meetings.filter((m) => m && m.id && !DEMO_MEETING_IDS.has(m.id));
}

/**
 * Filter out any hardcoded legacy calendar events
 */
export function filterOutDemoCalendarEvents(events: CalendarEvent[]): CalendarEvent[] {
  if (!Array.isArray(events)) return [];
  return events.filter((e) => e && e.id && !DEMO_CALENDAR_IDS.has(e.id));
}

/**
 * Clean up legacy un-scoped localStorage keys
 */
export function purgeLegacyDemoData(): void {
  try {
    // Check if legacy actionscribe_meetings contains demo meetings
    const legacyMeetings = localStorage.getItem('actionscribe_meetings');
    if (legacyMeetings) {
      const parsed = JSON.parse(legacyMeetings);
      if (Array.isArray(parsed)) {
        const cleaned = filterOutDemoMeetings(parsed);
        if (cleaned.length === 0) {
          localStorage.removeItem('actionscribe_meetings');
        } else {
          localStorage.setItem('actionscribe_meetings', JSON.stringify(cleaned));
        }
      } else {
        localStorage.removeItem('actionscribe_meetings');
      }
    }

    // Check if legacy calendar schedule contains demo meetings
    const legacyCalendar = localStorage.getItem('actionscribe_calendar_schedule');
    if (legacyCalendar) {
      const parsed = JSON.parse(legacyCalendar);
      if (Array.isArray(parsed)) {
        const cleaned = filterOutDemoCalendarEvents(parsed);
        if (cleaned.length === 0) {
          localStorage.removeItem('actionscribe_calendar_schedule');
        } else {
          localStorage.setItem('actionscribe_calendar_schedule', JSON.stringify(cleaned));
        }
      } else {
        localStorage.removeItem('actionscribe_calendar_schedule');
      }
    }
  } catch (e) {
    console.error('Failed to purge legacy demo data:', e);
  }
}

/**
 * Load meetings for a specific user ID
 */
export function getUserMeetings(userId?: string | null): MeetingRecord[] {
  purgeLegacyDemoData();
  if (!userId) return [];
  
  try {
    const key = `actionscribe_meetings_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return filterOutDemoMeetings(parsed);
      }
    }
    // Also check fallback key if user-specific key is not set yet
    const fallback = localStorage.getItem('actionscribe_meetings');
    if (fallback) {
      const parsed = JSON.parse(fallback);
      if (Array.isArray(parsed)) {
        const cleaned = filterOutDemoMeetings(parsed);
        // Only return if user actually created their own meetings
        if (cleaned.length > 0) {
          return cleaned;
        }
      }
    }
  } catch (e) {
    console.error('Failed to load user meetings:', e);
  }
  return [];
}

/**
 * Persist meetings for a specific user ID
 */
export function saveUserMeetings(userId: string | null | undefined, meetings: MeetingRecord[]): void {
  const cleaned = filterOutDemoMeetings(meetings);
  try {
    if (userId) {
      localStorage.setItem(`actionscribe_meetings_${userId}`, JSON.stringify(cleaned));
    }
    if (cleaned.length === 0) {
      localStorage.removeItem('actionscribe_meetings');
    } else {
      localStorage.setItem('actionscribe_meetings', JSON.stringify(cleaned));
    }
  } catch (e) {
    console.error('Failed to save user meetings:', e);
  }
}

/**
 * Load calendar events for a specific user ID
 */
export function getUserCalendarEvents(userId?: string | null): CalendarEvent[] {
  purgeLegacyDemoData();
  if (!userId) return [];

  try {
    const key = `actionscribe_calendar_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return filterOutDemoCalendarEvents(parsed);
      }
    }
  } catch (e) {
    console.error('Failed to load user calendar events:', e);
  }
  return [];
}

/**
 * Save calendar events for a specific user ID
 */
export function saveUserCalendarEvents(userId: string | null | undefined, events: CalendarEvent[]): void {
  const cleaned = filterOutDemoCalendarEvents(events);
  try {
    if (userId) {
      localStorage.setItem(`actionscribe_calendar_${userId}`, JSON.stringify(cleaned));
    }
    if (cleaned.length === 0) {
      localStorage.removeItem('actionscribe_calendar_schedule');
    } else {
      localStorage.setItem('actionscribe_calendar_schedule', JSON.stringify(cleaned));
    }
  } catch (e) {
    console.error('Failed to save user calendar events:', e);
  }
}
