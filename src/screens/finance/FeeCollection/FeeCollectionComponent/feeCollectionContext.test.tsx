import type { FeeCollectFormDto } from 'src/redux/feeCollection/feeCollection';

import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { FeeRow } from './FeeLedgerShared';
import { collectionDisplayStudent, FeeCollectionWaiverContext } from './feeCollectionContext';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./FeeWaiverToggle', () => ({
  default: () => <button type="button">Waive fee</button>,
}));

describe('collection subject and capabilities', () => {
  it('shows applicant details from Finance without manufacturing a Student ID', () => {
    const display = collectionDisplayStudent({
      student: { studentId: null, studentName: 'Kabir Shah', standardName: 'Class 1' },
      summary: { totalFee: 2000, paidFee: 500, pendingFee: 1500 },
    } as FeeCollectFormDto);
    expect(display).toMatchObject({
      id: '',
      studentId: '',
      name: 'Kabir Shah',
      className: 'Class 1',
      totalFees: 2000,
      paidFees: 500,
      pendingFees: 1500,
    });
    expect(collectionDisplayStudent()).toBeNull();
  });

  it('preserves the existing Finance waiver action and suppresses it in applicant collection', () => {
    const row = (
      <FeeRow
        name="Charge"
        total={100}
        paid={0}
        due={100}
        isSelected={false}
        chargeId="charge-one"
        onToggle={vi.fn()}
      />
    );
    const view = render(row);
    expect(screen.getByRole('button', { name: 'Waive fee' })).toBeVisible();
    view.rerender(
      <FeeCollectionWaiverContext.Provider value={false}>{row}</FeeCollectionWaiverContext.Provider>
    );
    expect(screen.queryByRole('button', { name: 'Waive fee' })).not.toBeInTheDocument();
  });

  it('suppresses the late-fee waiver as well as charge waiver in applicant collection', () => {
    render(
      <FeeCollectionWaiverContext.Provider value={false}>
        <FeeRow
          name="Tuition"
          total={1000}
          paid={0}
          due={1000}
          lateFeeAmount={100}
          dueFeeId="due-one"
          isSelected={false}
          onToggle={vi.fn()}
        />
      </FeeCollectionWaiverContext.Provider>
    );
    expect(screen.queryByRole('button', { name: 'Waive fee' })).not.toBeInTheDocument();
  });
});
