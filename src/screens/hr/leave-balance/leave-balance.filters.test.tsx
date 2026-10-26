import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';

import { render } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import { matchesTableRowFilters } from 'src/components/customizabaleTable/hooks/table-row-filter';

import { LeaveBalanceLedger } from './leave-balance';

import type { LeaveBucketBreakdown } from '../leave-request/leave-overview.utils';

const captured = vi.hoisted(() => ({ props: undefined as ICustomizableTableProps | undefined }));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: ICustomizableTableProps) => {
    captured.props = props;
    return null;
  },
}));

const rows: LeaveBucketBreakdown[] = [
  {
    bucketId: 'exhausted',
    bucketName: 'Exhausted',
    total: 2,
    used: 2,
    pendingDays: 0,
    remaining: 0,
    isUnlimited: false,
  },
  {
    bucketId: 'fractional',
    bucketName: 'Fractional',
    total: 2,
    used: 1.5,
    pendingDays: 0.5,
    remaining: 0.5,
    isUnlimited: false,
  },
  {
    bucketId: 'unlimited',
    bucketName: 'Unlimited',
    total: 0,
    used: 3,
    pendingDays: 1,
    remaining: 0,
    isUnlimited: true,
  },
];

describe('leave ledger finite availability filters', () => {
  it.each([
    { type: 'equals', value: 0, expected: ['exhausted'] },
    { type: 'equals', value: 0.5, expected: ['fractional'] },
    { type: 'lessThan', value: 1, expected: ['exhausted', 'fractional'] },
    { type: 'between', value: { min: 0, max: 0.5 }, expected: ['exhausted', 'fractional'] },
  ])('keeps unlimited leave out of $type finite criteria', ({ type, value, expected }) => {
    render(<LeaveBalanceLedger rows={rows} isLoading={false} />);
    const { data, columns } = captured.props!;
    const matching = data.filter((row) =>
      matchesTableRowFilters(
        row,
        [{ column: 'remaining', type, value, valueType: 'number' }],
        columns
      )
    );
    expect(matching.map((row) => row.id)).toEqual(expected);
    expect(rows[2].remaining).toBe(0);
  });

  it('keeps Unlimited in the display and export without changing its stored arithmetic value', () => {
    render(<LeaveBalanceLedger rows={rows} isLoading={false} />);
    const { data, columns } = captured.props!;
    const unlimited = data.find((row) => row.id === 'unlimited')!;
    const column = columns.find((item) => item.id === 'remaining')!;
    expect(unlimited.remaining).toBe(0);
    expect(column.exportValue!(unlimited.remaining, unlimited)).toBe('Unlimited');
    expect(column.filterValue!(unlimited.remaining, unlimited)).toBeNull();
    expect(column.sortValue!(unlimited.remaining, unlimited)).toBe(Infinity);
    expect(column.render!(unlimited.remaining, unlimited)).toMatchObject({
      props: { label: 'Unlimited' },
    });
  });

  it('uses the pendingDays dataset field for display, fractional filters and export', () => {
    render(<LeaveBalanceLedger rows={rows} isLoading={false} />);
    const { data, columns } = captured.props!;
    const column = columns.find((item) => item.label === 'Pending')!;
    const fractional = data[1];
    expect(column.id).toBe('pendingDays');
    expect(column.render!(fractional[column.id], fractional)).toBe('0.5');
    expect(
      matchesTableRowFilters(
        fractional,
        [{ column: column.id, type: 'equals', value: 0.5, valueType: 'number' }],
        columns
      )
    ).toBe(true);
  });
});
