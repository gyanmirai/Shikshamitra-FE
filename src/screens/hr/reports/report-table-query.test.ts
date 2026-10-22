import { it, expect } from 'vitest';

import { reportFieldColumn, reportTableCriteria, readReportTableState } from './report-table-query';

it('restores filters and sort order from the URL while ignoring malformed state', () => {
  const query = new URLSearchParams();
  query.set('search', 'staff');
  query.set(
    'filters',
    JSON.stringify([{ column: 'active', type: 'equals', value: false, valueType: 'enum' }])
  );
  query.set('sorts', JSON.stringify([{ column: 'name', direction: 'desc' }]));
  const state = readReportTableState(query);
  expect(reportTableCriteria(state.searchTerm, state.filters, state.sorts)).toEqual({
    search: 'staff',
    filters: [{ column: 'active', type: 'equals', value: false }],
    sorts: [{ column: 'name', direction: 'desc' }],
  });
  expect(readReportTableState(new URLSearchParams('filters=broken&sorts={}'))).toEqual({
    searchTerm: '',
    filters: [],
    sorts: [],
  });
});

it('maps numeric, date, timestamp and boolean metadata to shared column controls', () => {
  const field = {
    id: 'value',
    label: 'Value',
    options: [],
    operators: [],
    filterable: false,
    sortable: false,
    groupable: false,
    summarizable: false,
  };
  expect(reportFieldColumn({ ...field, type: 'money' }).filterType).toBe('number');
  expect(reportFieldColumn({ ...field, type: 'date' }).filterType).toBe('date');
  expect(reportFieldColumn({ ...field, type: 'datetime' }).filterType).toBe('dateTime');
  expect(reportFieldColumn({ ...field, type: 'boolean' }).enumOptions).toEqual([
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ]);
});

it('rejects malformed URL filter values and strips non-text display metadata', () => {
  const query = new URLSearchParams();
  query.set(
    'filters',
    JSON.stringify([
      { column: 'name', type: 'equals', value: { unexpected: 'object' }, valueType: 'string' },
      {
        column: 'name',
        type: 'equals',
        value: 'Staff',
        valueType: 'string',
        label: { unexpected: 'node' },
      },
    ])
  );
  expect(readReportTableState(query).filters).toEqual([
    {
      column: 'name',
      type: 'equals',
      value: 'Staff',
      valueType: 'string',
      label: 'name',
      displayValue: undefined,
    },
  ]);
});
