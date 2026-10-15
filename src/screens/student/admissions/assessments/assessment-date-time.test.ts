import { it, expect, describe } from 'vitest';

import { formatAssessmentSchedule, normalizeAssessmentDateTime } from './assessment-date-time';

describe('normalizeAssessmentDateTime', () => {
  it('treats timezone-free assessment timestamps from the API as UTC', () => {
    expect(normalizeAssessmentDateTime('2026-09-21T05:00:00')).toBe('2026-09-21T05:00:00Z');
  });

  it.each(['2026-09-21T05:00:00Z', '2026-09-21T10:30:00+05:30'])(
    'preserves an explicit timezone in %s',
    (value) => {
      expect(normalizeAssessmentDateTime(value)).toBe(value);
    }
  );
});

describe('formatAssessmentSchedule', () => {
  it.each(['2026-10-15T09:40:00Z', '2026-10-15T09:40:00', '2026-10-15T15:10:00+05:30'])(
    'formats school time consistently for %s',
    (start) => {
      expect(formatAssessmentSchedule(start, '2026-10-15T09:45:00Z')).toEqual({
        date: '15 Oct 2026',
        time: '3:10 PM–3:15 PM IST',
      });
    }
  );
  it('uses the school calendar date across the UTC day boundary', () => {
    expect(formatAssessmentSchedule('2026-10-14T20:00:00Z')?.date).toBe('15 Oct 2026');
  });
  it.each([null, undefined, '', 'invalid'])('omits an unavailable start %s', (value) => {
    expect(formatAssessmentSchedule(value)).toBeNull();
  });
  it('omits a malformed end without rendering Invalid Date', () => {
    expect(formatAssessmentSchedule('2026-10-15T09:40:00Z', 'invalid')).toBeNull();
  });
});
