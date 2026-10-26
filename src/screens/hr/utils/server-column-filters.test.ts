import { describe, expect, it, vi } from 'vitest';

import { nameContains, serverColumnFilters } from './server-column-filters';

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status' },
  { id: 'netPay', label: 'Net pay' },
];
const bindings = [
  nameContains(),
  {
    column: 'status',
    query: 'status',
    options: [
      { label: 'Pending', value: 0 },
      { label: 'Approved', value: 1 },
    ],
    emptyValue: '',
  },
];

describe('HR endpoint-owned column criteria', () => {
  it('preserves zero and false enum values and limits operators to the actual contract', () => {
    const table = serverColumnFilters(columns, bindings, { search: 'Alpha', status: 0 }, vi.fn());
    expect(table.filters.map(({ value }) => value)).toEqual(['Alpha', 0]);
    expect(table.columns[0].filterOperators).toEqual(['contains']);
    expect(table.columns[2].isFilter).toBe(false);
    const booleanTable = serverColumnFilters(
      columns,
      [{ column: 'status', query: 'active', options: [{ label: 'Inactive', value: false }] }],
      { active: false },
      vi.fn()
    );
    expect(booleanTable.filters[0]).toMatchObject({ value: false, displayValue: 'Inactive' });
  });

  it('replaces scalar choices, clears removed criteria, and rejects unsupported operators/values', () => {
    const change = vi.fn();
    const table = serverColumnFilters(columns, bindings, { status: 0 }, change);
    table.onServerFilter([
      { column: 'status', type: 'equals', value: 0, valueType: 'enum' },
      { column: 'status', type: 'equals', value: 1, valueType: 'enum' },
    ]);
    expect(change).toHaveBeenLastCalledWith({ search: '', status: 1 });
    table.onServerFilter([
      { column: 'name', type: 'equals', value: 'Alpha', valueType: 'string' },
      { column: 'status', type: 'equals', value: 'Unknown', valueType: 'enum' },
    ]);
    expect(change).toHaveBeenLastCalledWith({ search: '', status: '' });
    table.onServerFilter([]);
    expect(change).toHaveBeenLastCalledWith({ search: '', status: '' });
  });
});
