import { render, screen } from '@testing-library/react';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import FeeHeadRefundTable from './FeeHeadRefundTable';

const mocks = vi.hoisted(() => ({
  eligibility: {} as any,
  adjustment: {} as any,
  setFieldValue: vi.fn(),
  summary: vi.fn(),
}));

vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: 'year' } }) }));
vi.mock('../../components/FinancePrerequisiteState', () => ({
  default: ({ requirements }: any) => (
    <div>{requirements.map((item: any) => item.key).join(',')}</div>
  ),
}));
vi.mock('src/redux/finance/RefundManagement/feeRefundManage', () => ({
  useGetRefundEligibilityQuery: () => mocks.eligibility,
}));
vi.mock('src/redux/finance/adjustments/adjustmentApi', () => ({
  useGetAdjustmentEligibilityQuery: () => mocks.adjustment,
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
    mocks.adjustment = {};
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

  it('shows the shared review state when a resolved student has no eligible paid balance', () => {
    mocks.eligibility.currentData = { totalPaid: 0, totalRefundable: 0, feeHeads: [] };
    render(<FeeHeadRefundTable formik={formik()} compact />);
    expect(screen.getByText('paid-receipt')).toBeInTheDocument();
    expect(mocks.summary).not.toHaveBeenCalled();
  });

  it('offers policy setup only for the exact server missing-policy response', () => {
    mocks.eligibility.currentData = undefined;
    mocks.eligibility.error = { data: { errorCode: 'Finance:FeeRefund:010010' } };
    render(<FeeHeadRefundTable formik={formik()} compact />);
    expect(screen.getByText('refund-policy-assignment')).toBeInTheDocument();
  });

  it('shows receipt verification only when the server identifies an unsettled payment', () => {
    mocks.eligibility = { error: { data: { errorCode: 'Finance:FeeRefund:010025' } } };
    render(<FeeHeadRefundTable formik={formik()} compact />);
    expect(screen.getByText('receipt-verification')).toBeInTheDocument();
  });

  it('keeps denied eligibility as an error instead of offering setup', () => {
    mocks.eligibility = { error: { status: 403 }, refetch: vi.fn() };
    render(<FeeHeadRefundTable formik={formik()} compact />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('paid-receipt')).not.toBeInTheDocument();
    expect(screen.queryByText('refund-policy-assignment')).not.toBeInTheDocument();
  });

  it('does not describe a policy input error as missing paid fees', () => {
    mocks.eligibility = {
      error: {
        data: {
          errorCode: 'Finance:RefundPolicy:010016',
          detail: 'The entered refund amount is not allowed.',
        },
      },
      refetch: vi.fn(),
    };
    render(<FeeHeadRefundTable formik={formik()} compact />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The entered refund amount is not allowed.'
    );
    expect(screen.queryByText('paid-receipt')).not.toBeInTheDocument();
  });

  it('reviews adjustments when only exhausted paid sources remain', () => {
    mocks.adjustment = {
      currentData: { feeHeads: [{ months: [{ adjustable: 0, paid: 100, adjusted: 100 }] }] },
      refetch: vi.fn(),
    };
    render(<FeeHeadRefundTable formik={formik()} mode="adjustment" compact />);
    expect(screen.getByText('adjustment-balance')).toBeInTheDocument();
  });
});
