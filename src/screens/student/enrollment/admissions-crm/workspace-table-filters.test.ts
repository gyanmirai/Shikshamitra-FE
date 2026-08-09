import { it, expect, describe } from 'vitest';

import {
  getDateFilterBounds,
  getLatestEnumFilter,
  getLatestStringFilter,
} from './workspace-table-filters';

const filter = (column: string, value: string | number, type = 'equals', valueType = 'string') => ({
  column,
  value,
  type,
  valueType,
});

describe('Enrollment workspace table filters', () => {
  it('uses the latest filter for a column', () => {
    const filters = [
      filter('priority', 1, 'equals', 'enum'),
      filter('priority', 3, 'equals', 'enum'),
    ];

    expect(getLatestEnumFilter(filters, 'priority')).toBe(3);
    expect(getLatestStringFilter([filter('applicant', 'Aarav')], 'applicant')).toBe('Aarav');
  });

  it('maps inclusive and directional date filters to API bounds', () => {
    expect(
      getDateFilterBounds([filter('lastActivityTime', '08-08-2026')], 'lastActivityTime')
    ).toEqual({
      from: '2026-08-08T00:00:00.000Z',
      until: '2026-08-08T00:00:00.000Z',
    });
    expect(
      getDateFilterBounds([filter('lastActivityTime', '08-08-2026', 'after')], 'lastActivityTime')
    ).toEqual({ from: '2026-08-09T00:00:00.000Z' });
    expect(
      getDateFilterBounds([filter('lastActivityTime', '08-08-2026', 'before')], 'lastActivityTime')
    ).toEqual({ until: '2026-08-07T00:00:00.000Z' });
  });

  it('ignores missing and malformed values safely', () => {
    expect(getLatestEnumFilter([], 'priority')).toBeUndefined();
    expect(getLatestStringFilter([filter('applicant', '')], 'applicant')).toBeUndefined();
    expect(
      getDateFilterBounds([filter('lastActivityTime', 'not-a-date')], 'lastActivityTime')
    ).toEqual({});
    expect(
      getDateFilterBounds([filter('lastActivityTime', '31-02-2026')], 'lastActivityTime')
    ).toEqual({});
  });
});
