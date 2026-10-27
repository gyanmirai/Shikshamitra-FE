import { it, expect } from 'vitest';

import { roomServerFilters } from './room-table-filters';

it('maps numeric input strings and range fields from the shared table to typed server predicates', () => {
  expect(
    roomServerFilters([
      { column: 'capacity', type: 'greaterThan', value: '20', valueType: 'number' },
      {
        column: 'totalBenches',
        type: 'between',
        value: { min: '4', max: '10' },
        valueType: 'number',
      },
      { column: 'buildingName', type: 'startsWith', value: 'Main', valueType: 'string' },
    ])
  ).toEqual([
    { column: 'capacity', type: 'greaterThan', value: 20 },
    { column: 'totalBenches', type: 'between', value: { min: 4, max: 10 } },
    { column: 'buildingName', type: 'startsWith', value: 'Main' },
  ]);
});

it('rejects unsupported columns, operators, invalid ranges and excessive filters', () => {
  expect(() =>
    roomServerFilters([{ column: 'creatorId', type: 'equals', value: 'x', valueType: 'string' }])
  ).toThrow();
  expect(() =>
    roomServerFilters([{ column: 'capacity', type: 'contains', value: '2', valueType: 'number' }])
  ).toThrow();
  expect(() =>
    roomServerFilters([
      { column: 'capacity', type: 'between', value: { min: 10, max: 5 }, valueType: 'number' },
    ])
  ).toThrow();
  expect(() =>
    roomServerFilters(
      Array.from({ length: 11 }, () => ({
        column: 'roomName',
        type: 'contains',
        value: 'A',
        valueType: 'string',
      }))
    )
  ).toThrow();
});
