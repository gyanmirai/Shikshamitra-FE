import { it, expect } from 'vitest';

import {
  readQueueColumnFilters,
  serializeQueueColumnFilters,
} from './admission-queue-column-filters';

it('preserves only scalar supported columns and strips presentation metadata', () => {
  const filters = [
    {
      column: 'standardName',
      type: 'contains',
      value: 'Class 6',
      valueType: 'string',
      label: 'Class',
    },
    { column: 'contactPhone', type: 'contains', value: '987', valueType: 'string' },
    { column: 'currentStageName', type: 'contains', value: 'Payment', valueType: 'string' },
  ];
  expect(JSON.parse(serializeQueueColumnFilters(filters, 'applications'))).toEqual([
    {
      column: 'standardName',
      type: 'contains',
      value: 'Class 6',
      valueType: 'string',
    },
  ]);
  expect(
    readQueueColumnFilters(JSON.stringify(filters), 'pipeline').map((filter) => filter.column)
  ).toEqual(['standardName', 'contactPhone']);
});

it('sends selected local-day boundaries matching the displayed datetime calendar', () => {
  const filter = { column: 'lastSavedAt', type: 'equals', value: '26-10-2026', valueType: 'date' };
  const [actual] = JSON.parse(serializeQueueColumnFilters([filter], 'applications'));
  expect(actual).toMatchObject(filter);
  expect(actual.startOffsetMinutes).toBe(new Date(2026, 9, 26).getTimezoneOffset());
  expect(actual.endOffsetMinutes).toBe(new Date(2026, 9, 27).getTimezoneOffset());
  expect(readQueueColumnFilters(JSON.stringify([filter]), 'applications')[0]).toMatchObject(filter);
});

it('rejects malformed criteria, unknown operators and invalid calendar days', () => {
  expect(readQueueColumnFilters('{', 'applications')).toEqual([]);
  expect(
    readQueueColumnFilters(
      JSON.stringify([
        { column: 'lastSavedAt', type: 'equals', value: '31-02-2026', valueType: 'date' },
        { column: 'standardName', type: 'unsafe', value: 'Class', valueType: 'string' },
        { column: 'status', type: 'equals', value: 0, valueType: 'enum' },
      ]),
      'applications'
    )
  ).toEqual([]);
});
