import { describe, expect, it } from 'vitest';

import { normalizeAssessmentDateTime } from './assessment-date-time';

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
