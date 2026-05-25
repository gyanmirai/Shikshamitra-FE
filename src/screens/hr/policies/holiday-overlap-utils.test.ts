import type { WorkCalendarHoliday } from 'src/redux/hr/hr-policy-api';

import { it, expect, describe } from 'vitest';

import {
  findIncludedHolidayOverlap,
  mergeNonOverlappingHolidayRows,
} from './holiday-overlap-utils';

const holiday = (
  name: string,
  fromDate: string,
  toDate = fromDate,
  isIncluded = true
): WorkCalendarHoliday => ({
  academicYearId: 'academic-year-1',
  date: fromDate,
  fromDate,
  toDate,
  holidayName: name,
  source: 'manual',
  calendarHolidayId: null,
  isIncluded,
});

describe('holiday overlap utils', () => {
  it('detects same-day overlap', () => {
    const conflict = findIncludedHolidayOverlap([holiday('Diwali', '2026-10-20')], {
      fromDate: '2026-10-20',
      toDate: '2026-10-20',
    });

    expect(conflict?.holiday.holidayName).toBe('Diwali');
    expect(conflict?.overlapFrom).toBe('2026-10-20');
    expect(conflict?.overlapTo).toBe('2026-10-20');
  });

  it('detects partial multi-day overlap', () => {
    const conflict = findIncludedHolidayOverlap(
      [holiday('Winter Break', '2026-12-24', '2026-12-27')],
      { fromDate: '2026-12-27', toDate: '2026-12-29' }
    );

    expect(conflict?.holiday.holidayName).toBe('Winter Break');
    expect(conflict?.overlapFrom).toBe('2026-12-27');
    expect(conflict?.overlapTo).toBe('2026-12-27');
  });

  it('ignores the edited row', () => {
    const conflict = findIncludedHolidayOverlap(
      [holiday('Manual Holiday', '2026-05-01')],
      { fromDate: '2026-05-01', toDate: '2026-05-01' },
      0
    );

    expect(conflict).toBeNull();
  });

  it('does not treat removed holidays as blockers', () => {
    const conflict = findIncludedHolidayOverlap(
      [holiday('Removed Central Holiday', '2026-08-15', '2026-08-15', false)],
      { fromDate: '2026-08-15', toDate: '2026-08-15' }
    );

    expect(conflict).toBeNull();
  });

  it('allows adjacent non-overlapping ranges', () => {
    const conflict = findIncludedHolidayOverlap(
      [holiday('First Break', '2026-09-01', '2026-09-02')],
      { fromDate: '2026-09-03', toDate: '2026-09-04' }
    );

    expect(conflict).toBeNull();
  });

  it('skips overlapping imported included holidays', () => {
    const result = mergeNonOverlappingHolidayRows(
      [holiday('Manual Holiday', '2026-05-10')],
      [holiday('Central Holiday', '2026-05-10', '2026-05-10')],
      (item) => `${item.holidayName}-${item.fromDate}-${item.toDate}`
    );

    expect(result.rows).toHaveLength(1);
    expect(result.addedCount).toBe(0);
    expect(result.skippedOverlapCount).toBe(1);
  });
});
