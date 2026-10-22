import { describe, expect, it } from 'vitest';
import { orderSelectedCollectionItems } from './collectionAllocationOrder';
import { allocatePayment } from './preview/paymentAllocationUtils';
import type { SelectedItem } from '../Components/type';

const tuition1: SelectedItem = {
  dueFeeId: 'tuition-1',
  feeHeadId: 'tuition',
  period: '2026-04',
  dueAmount: 4000,
};
const transport1: SelectedItem = {
  dueFeeId: 'transport-1',
  feeHeadId: 'transport',
  period: '2026-04',
  dueAmount: 1800,
};
const tuition2: SelectedItem = {
  dueFeeId: 'tuition-2',
  feeHeadId: 'tuition',
  period: '2026-07',
  dueAmount: 4000,
};

describe('allocation follows the collection screen', () => {
  it.each([
    { order: ['tuition-1', 'transport-1', 'tuition-2'], funded: ['tuition-1', 'transport-1'] },
    { order: ['tuition-1', 'tuition-2', 'transport-1'], funded: ['tuition-1', 'tuition-2'] },
    { order: ['transport-1', 'tuition-1', 'tuition-2'], funded: ['transport-1', 'tuition-1'] },
  ])('allocates the same amount by the supplied screen order $order', ({ order, funded }) => {
    const clicked = [tuition2, transport1, tuition1];
    const ordered = orderSelectedCollectionItems(clicked, order);
    const result = allocatePayment(ordered, [], {}, 5000);
    expect(result.allocatedRows.filter((row) => row.paidAmount > 0).map((row) => row.key)).toEqual(
      funded
    );
    expect(result.allocatedAmount).toBe(5000);
    expect(clicked[0]).toBe(tuition2);
  });

  it('keeps decimal allocation exact across fees and late fees', () => {
    const result = allocatePayment(
      [
        { ...tuition1, dueAmount: 1, lateFeeAmount: 0.1 },
        { ...tuition2, dueAmount: 1 },
      ],
      [],
      {},
      1.3
    );
    expect(result.allocatedAmount).toBe(1.3);
    expect(result.allocatedRows[1].paidAmount).toBe(0.2);
    expect(result.unallocatedAmount).toBe(0);
  });

  it('does not fund a previously cleared principal from its old amount', () => {
    const result = allocatePayment(
      [{ ...tuition1, dueAmount: 0, originalDueAmount: 4000 }],
      [],
      {},
      10
    );
    expect(result.allocatedAmount).toBe(0);
    expect(result.unallocatedAmount).toBe(10);
  });
});
