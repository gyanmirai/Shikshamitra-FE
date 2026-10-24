import { it, expect } from 'vitest';

import { matchesTableRowFilters } from './table-row-filter';

import type { IColumn, IParams } from '../types';

it('uses an explicit computed text filter value instead of unrelated rendered help', () => {
  const column: IColumn = {
    id: 'value',
    label: 'Value',
    render: () => 'View details',
    filterValue: (_value, row) => row.filterLabel,
  };
  const filter: IParams['filters'][number] = {
    column: 'value',
    type: 'equals',
    value: 'Active',
    valueType: 'string',
  };
  expect(matchesTableRowFilters({ value: 'raw', filterLabel: 'Active' }, [filter], [column])).toBe(
    true
  );
  expect(
    matchesTableRowFilters({ value: 'raw', filterLabel: 'Inactive' }, [filter], [column])
  ).toBe(false);
});

it('preserves the default displayed-text behavior when no filter accessor is supplied', () => {
  const column: IColumn = { id: 'value', label: 'Value', render: () => 'Active' };
  expect(
    matchesTableRowFilters(
      { value: 0 },
      [{ column: 'value', type: 'equals', value: 'Active', valueType: 'string' }],
      [column]
    )
  ).toBe(true);
});
