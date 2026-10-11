import { describe, expect, it } from 'vitest';

import { parseLeaveTableFilters, serializeLeaveTableFiltersForApi } from './leave-request-table-filters';

describe('Leave request column filters', () => {
  it('sends local calendar-day bounds and numeric ranges to the paged API', () => {
    const filters = parseLeaveTableFilters(JSON.stringify([
      { column: 'formattedLeaveDate', type: 'equals', value: '09-10-2026', valueType: 'date' },
      { column: 'totalDays', type: 'between', value: { min: 1, max: 3 }, valueType: 'number' },
    ]));
    const query = JSON.parse(serializeLeaveTableFiltersForApi(filters) ?? '[]');

    expect(query).toEqual([
      {
        column: 'formattedLeaveDate',
        type: 'equals',
        value: '09-10-2026',
        min: new Date(2026, 9, 9).toISOString(),
        max: new Date(2026, 9, 10).toISOString(),
      },
      { column: 'totalDays', type: 'between', min: '1', max: '3' },
    ]);
  });

  it('ignores malformed saved filter state', () => {
    expect(parseLeaveTableFilters('{bad json')).toEqual([]);
  });
});
