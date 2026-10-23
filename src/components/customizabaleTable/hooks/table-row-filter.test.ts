import { describe, expect, it } from 'vitest';

import { matchesTableRowFilters } from './table-row-filter';

import type { IColumn, IParams } from '../types';

const columns: IColumn[] = [
  { id: 'version', label: 'Version', filterType: 'number', render: (value) => `v${value}` },
  { id: 'amount', label: 'Amount', filterType: 'formattedNumber' },
  { id: 'status', label: 'Status', filterType: 'enum', enumOptions: [{ label: 'Active', value: 1 }] },
];
const criterion = (column: string, type: string, value: unknown, valueType = 'number'): IParams['filters'][number] =>
  ({ column, type, value, valueType });

describe('column filter comparisons', () => {
  it('compares numeric values independently of the displayed version prefix', () => {
    expect(matchesTableRowFilters({ version: 2 }, [criterion('version', 'equals', '2')], columns)).toBe(true);
    expect(matchesTableRowFilters({ version: 12 }, [criterion('version', 'equals', '2')], columns)).toBe(false);
  });

  it.each([null, undefined, ''])('does not turn a missing value (%s) into zero', (value) => {
    expect(matchesTableRowFilters({ version: value }, [criterion('version', 'equals', 0)], columns)).toBe(false);
  });

  it('keeps real zero values and includes both numeric range boundaries', () => {
    expect(matchesTableRowFilters({ version: 0 }, [criterion('version', 'equals', 0)], columns)).toBe(true);
    for (const version of [2, 3, 4]) {
      expect(matchesTableRowFilters({ version }, [criterion('version', 'between', { min: 2, max: 4 })], columns)).toBe(true);
    }
    expect(matchesTableRowFilters({ version: 5 }, [criterion('version', 'between', { min: 2, max: 4 })], columns)).toBe(false);
  });

  it('parses formatted amounts for equality and rejects invalid numeric values', () => {
    expect(matchesTableRowFilters({ amount: '₹1,250.50' }, [criterion('amount', 'equals', 1250.5, 'formattedNumber')], columns)).toBe(true);
    expect(matchesTableRowFilters({ version: 'unavailable' }, [criterion('version', 'lessThan', 5)], columns)).toBe(false);
  });

  it('ORs alternatives in one column and ANDs criteria in different columns', () => {
    const filters = [criterion('version', 'equals', 2), criterion('version', 'equals', 4), criterion('status', 'equals', 1, 'enum')];
    expect(matchesTableRowFilters({ version: 4, status: 1 }, filters, columns)).toBe(true);
    expect(matchesTableRowFilters({ version: 3, status: 1 }, filters, columns)).toBe(false);
    expect(matchesTableRowFilters({ version: 4, status: 0 }, filters, columns)).toBe(false);
  });
});
