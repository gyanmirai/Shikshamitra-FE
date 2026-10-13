import { render, screen } from '@testing-library/react';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import FeeHeadRefundTable from './FeeHeadRefundTable';

const mocks = vi.hoisted(() => ({
  eligibility: {} as any,
  setFieldValue: vi.fn(),
  summary: vi.fn(),
}));

vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: 'year' } }) }));
vi.mock('src/redux/finance/RefundManagement/feeRefundManage', () => ({
  useGetRefundEligibilityQuery: () => mocks.eligibility,
}));
vi.mock('src/redux/finance/adjustments/adjustmentApi', () => ({
  useGetAdjustmentEligibilityQuery: () => ({}),
}));
vi.mock('./feeHeadRefundTable/OverallSummaryCard', () => ({
  default: () => {
    mocks.summary();
    return null;
  },
}));
vi.mock('./feeHeadRefundTable/RefundTableSkeleton', () => ({
  default: () => <span>Loading refundable fees</span>,
}));
vi.mock('./feeHeadRefundTable/FeeHeadGroup', () => ({
  default: ({ feeHead }: any) => <span>{feeHead.feeHeadName}</span>,
}));

const formik = () =>
  ({
    values: {
      studentId: 'student',
      refundType: 'full',
      feeHeadRefunds: [
        {
          feeHeadId: 'transport',
          months: [
            {
              month: 'August 2026',
              dueFeeId: 'due-1',
              sourceAllocationId: 'allocation-1',
              amount: 60,
            },
            {
              month: 'September 2026',
              dueFeeId: 'due-2',
              sourceAllocationId: 'allocation-2',
              amount: 60,
            },
          ],
        },
      ],
    },
    touched: {},
    setFieldValue: mocks.setFieldValue,
    setFieldTouched: vi.fn(),
  }) as any;

describe('refund allocation policy limits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.eligibility = {
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
      currentData: {
        totalPaid: 200,
        totalRefundable: 100,
        feeHeads: [
          {
            feeHeadId: 'transport',
            feeHeadName: 'Transport',
            months: [
              {
              month: FeeMonth.August,
                year: 2026,
                dueFeeId: 'due-1',
                sourceAllocationId: 'allocation-1',
                total: 100,
                paid: 100,
                refunded: 0,
                refundable: 60,
              },
              {
              month: FeeMonth.September,
                year: 2026,
                dueFeeId: 'due-2',
                sourceAllocationId: 'allocation-2',
                total: 100,
                paid: 100,
                refunded: 0,
                refundable: 60,
              },
            ],
          },
        ],
      },
    };
  });

  it('caps selected full-refund lines at the server policy limit', () => {
    render(<FeeHeadRefundTable formik={formik()} compact />);
    const updated = mocks.setFieldValue.mock.calls.find(
      ([field]) => field === 'feeHeadRefunds'
    )?.[1];
    expect(updated[0].months.map((month: any) => month.amount)).toEqual([60, 40]);
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(mocks.summary).not.toHaveBeenCalled();
    expect(screen.queryByText('How to create a refund request')).not.toBeInTheDocument();
  });

  it('preserves entered amounts while the current student eligibility is loading', () => {
    mocks.eligibility.data = mocks.eligibility.currentData;
    mocks.eligibility.currentData = undefined;
    mocks.eligibility.isFetching = true;
    render(<FeeHeadRefundTable formik={formik()} compact />);
    expect(screen.getByText('Loading refundable fees')).toBeInTheDocument();
    expect(mocks.setFieldValue).not.toHaveBeenCalled();
  });
});
