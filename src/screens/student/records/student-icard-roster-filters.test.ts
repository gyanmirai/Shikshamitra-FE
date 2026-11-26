import { it, expect } from 'vitest';
import { studentDirectoryQueryParams } from 'src/redux/student/records/student-directory-query';

import {
  readRosterFilters,
  rosterTableFilters,
  serializeRosterFilters,
} from './student-icard-roster-filters';

it('round-trips search criteria and preserves false as an explicit pending-card filter', () => {
  const criteria = readRosterFilters(
    JSON.stringify([
      { column: 'studentName', operator: 'startsWith', value: 'Asha' },
      { column: 'rollNumber', operator: 'between', min: 1, max: 30 },
      { column: 'hasValidIssuedCard', operator: 'equals', value: 'false' },
    ])
  );
  expect(criteria).toHaveLength(3);
  const tableFilters = rosterTableFilters(criteria);
  expect(tableFilters[2]).toMatchObject({ value: false, displayValue: 'Pending' });
  expect(serializeRosterFilters(tableFilters)).toBe(JSON.stringify(criteria));
  const params = studentDirectoryQueryParams({ divisionId: 'division-1', columnFilters: criteria });
  expect(params.get('columnFilters[1].max')).toBe('30');
  expect(params.get('columnFilters[2].value')).toBe('false');
  expect(params.get('divisionId')).toBe('division-1');
});

it('drops invalid and unsupported values from a saved URL', () => {
  expect(
    readRosterFilters(
      JSON.stringify([
        { column: 'templateName', operator: 'contains', value: 'Blue' },
        { column: 'hasValidIssuedCard', operator: 'contains', value: 'false' },
        { column: 'rollNumber', operator: 'between', min: 18, max: 12 },
        { column: 'rollNumber', operator: 'equals', value: 'Infinity' },
        { column: 'grNumber', operator: 'contains', value: '  ' },
      ])
    )
  ).toEqual([]);
});
