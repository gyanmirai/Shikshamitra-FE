import { it, expect, describe } from 'vitest';
import { CalendarStatus } from 'src/enums/academic-calendar';

import { resolveAcademicCalendarId } from './academic-calendar-selection';

describe('operational academic calendar selection', () => {
  const range = { startDate: '2026-06-01T00:00:00+05:30', endDate: '2027-05-31T00:00:00+05:30' };

  it('uses the published calendar ahead of a newer default draft', () => {
    expect(resolveAcademicCalendarId([
      { id: 'draft', status: CalendarStatus.Draft, isDefault: true, ...range },
      { id: 'published', status: CalendarStatus.Published, ...range },
    ], '2026-10-29')).toBe('published');
  });

  it('uses the default draft ahead of a newer non-default draft', () => {
    expect(resolveAcademicCalendarId([
      { id: 'new-draft', status: CalendarStatus.Draft, ...range },
      { id: 'default', status: CalendarStatus.Draft, isDefault: true, ...range },
    ], '2026-10-29')).toBe('default');
  });

  it('excludes archived and out-of-range calendars and preserves school date boundaries', () => {
    const calendars = [
      { id: 'archived', status: CalendarStatus.Archived, isDefault: true, ...range },
      { id: 'old', status: CalendarStatus.Published, startDate: '2025-06-01', endDate: '2026-05-31' },
      { id: 'current', status: CalendarStatus.Published, ...range },
    ];
    expect(resolveAcademicCalendarId(calendars, '2026-06-01')).toBe('current');
    expect(resolveAcademicCalendarId(calendars, '2027-05-31')).toBe('current');
    expect(resolveAcademicCalendarId(calendars, '2027-06-01')).toBe('');
  });
});
