import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AdjustmentPendingFeesTable from './AdjustmentPendingFeesTable';
import type { AdjustmentApplyItem } from '../types/adjustmentApply.types';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns }: any) => (
    <div>
      {data.map((row: any) => (
        <div key={row.installmentId}>
          {columns.map((column: any) => (
            <div key={column.id}>{column.render?.(row[column.id], row)}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

it('retains a decimal draft and sends raw money input without parsing currency text', () => {
  const onChange = vi.fn();
  render(
    <AdjustmentPendingFeesTable
      items={[
        {
          installmentId: 'due',
          installmentLabel: 'June 2026',
          feeHeadName: 'Tuition',
          totalFees: 100,
          paidAmount: 0,
          pendingAmount: 100,
          adjustableAmount: 100,
          appliedAmount: 0,
          finalPendingAmount: 100,
          isSelected: true,
        } as AdjustmentApplyItem,
      ]}
      onSelectRow={vi.fn()}
      onChangeAmount={onChange}
    />
  );
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '12.50' } });
  expect(onChange).toHaveBeenLastCalledWith('due', '12.50');
});
