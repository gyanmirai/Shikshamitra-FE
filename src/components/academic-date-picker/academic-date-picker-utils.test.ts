import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { toDateKey } from './academic-date-picker-utils';

describe('academic calendar date keys', () => {
  it.each([
    '2026-09-14',
    '2026-09-14T00:00:00',
    '2026-09-14T00:00:00Z',
    '2026-09-14T00:00:00+05:30',
  ])('preserves date-only calendar records regardless of browser timezone: %s', (date) => {
    expect(toDateKey(date)).toBe('2026-09-14');
  });

  it('uses the selected picker date', () => {
    expect(toDateKey(dayjs('2026-09-14'))).toBe('2026-09-14');
  });
});
