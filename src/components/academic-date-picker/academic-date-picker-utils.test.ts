import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { DayType } from 'src/enums/academic-calendar';

import { toDateKey, appliesToScope } from './academic-date-picker-utils';

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

  it('does not block an exam for a different division of the same class', () => {
    const day = { id: 'holiday', date: '2026-10-29', dayType: DayType.Vacation,
      standardId: 'class-10', divisionId: 'division-b', appliesToAll: false };
    expect(appliesToScope(day, 'class-10', null, ['division-a'])).toBe(false);
    expect(appliesToScope(day, 'class-10', null, ['division-a', 'division-b'])).toBe(true);
  });
});
