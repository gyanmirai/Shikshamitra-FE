import { fireEvent, render, screen } from '@testing-library/react';
import { FeeCollectionStatusType, FeeMonth } from 'src/enums/fee-collection-type';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import FeeHeadRefundTable from './FeeHeadRefundTable';

const mocks = vi.hoisted(() => ({
  eligibility: {} as any,
  adjustment: {} as any,
  setFieldValue: vi.fn(),
  summary: vi.fn(),
  group: vi.fn(),
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
  default: ({ feeHead }: any) => {
    mocks.group(feeHead);
    return <span>{feeHead.feeHeadName}</span>;
  },
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

  it('preserves all full-refund sources for the canonical server policy calculation', () => {
    const values = formik();
    values.values.feeHeadRefunds[0].months.forEach((month: any) => {
      month.amount = 20;
    });
    render(<FeeHeadRefundTable formik={values} compact />);
    const updated = mocks.setFieldValue.mock.calls.find(
      ([field]) => field === 'feeHeadRefunds'
    )?.[1];
    expect(updated[0].months.map((month: any) => month.amount)).toEqual([60, 60]);
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

it('passes pending and overdue amounts and statuses to the existing adjustment selector', () => {
  mocks.adjustment = {
    currentData: {
      totalAdjustable: 125,
      feeHeads: [{
        feeHeadId: 'transport', feeHeadName: 'Transport',
        months: [
          { dueFeeId: 'due-1', month: FeeMonth.August, year: 2026,
            total: 100, paid: 0, adjusted: 0, adjustable: 50,
            status: FeeCollectionStatusType.Pending },
          { dueFeeId: 'due-2', month: FeeMonth.September, year: 2026,
            total: 100, paid: 0, adjusted: 0, adjustable: 75,
            status: FeeCollectionStatusType.Overdue },
        ],
      }],
    },
    isLoading: false, isFetching: false, refetch: vi.fn(),
  };
  render(<FeeHeadRefundTable formik={formik()} mode="adjustment" compact />);
  const items = mocks.group.mock.lastCall?.[0].items;
  expect(items.map((item: any) => [item.refundable, item.status])).toEqual([
    [50, FeeCollectionStatusType.Pending],
    [75, FeeCollectionStatusType.Overdue],
  ]);
});

it('auto-distributes a total into an unchecked eligible fee head', () => {
  mocks.setFieldValue.mockClear();
  mocks.adjustment = {
    currentData: {
      totalAdjustable: 20450,
      feeHeads: [
        { feeHeadId: 'project', feeHeadName: 'Project Fee', months: [
          { dueFeeId: 'project-due', month: FeeMonth.December, year: 2026,
            total: 250, paid: 0, adjusted: 0, adjustable: 250, kind: 1 },
        ] },
        { feeHeadId: 'school', feeHeadName: 'School Fee', months: [
          { dueFeeId: 'school-due', month: FeeMonth.December, year: 2026,
            total: 20000, paid: 0, adjusted: 0, adjustable: 20000, kind: 1 },
        ] },
        { feeHeadId: 'destination', feeHeadName: 'Destination Fee', months: [
          { dueFeeId: 'destination-due', month: FeeMonth.December, year: 2026,
            total: 200, paid: 0, adjusted: 0, adjustable: 200, kind: 1 },
        ] },
      ],
    },
    isLoading: false, isFetching: false, refetch: vi.fn(),
  };
  const values = formik();
  values.values.refundType = undefined;
  values.values.feeHeadRefunds = [{ feeHeadId: 'project', months: [
    { month: 'December 2026', dueFeeId: 'project-due', amount: '' },
  ] }];
  render(<FeeHeadRefundTable formik={values} mode="adjustment" compact />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Total adjustment amount' }),
    { target: { value: '10000' } });
  fireEvent.click(screen.getByRole('button', { name: 'Auto-distribute equal' }));
  expect(mocks.setFieldValue).toHaveBeenLastCalledWith('feeHeadRefunds', [
    { feeHeadId: 'project', months: [expect.objectContaining({ dueFeeId: 'project-due', amount: '250' })] },
    { feeHeadId: 'school', months: [expect.objectContaining({ dueFeeId: 'school-due', amount: '9750' })] },
  ]);
});

it('applies per-installment and overall amounts in the existing adjustment fee selector', () => {
  mocks.setFieldValue.mockClear();
  mocks.adjustment = {
    currentData: {
      totalAdjustable: 120,
      feeHeads: [{
        feeHeadId: 'transport', feeHeadName: 'Transport',
        months: [
          { dueFeeId: 'due-1', month: FeeMonth.August, year: 2026,
            total: 100, paid: 100, refunded: 0, adjusted: 0, adjustable: 60 },
          { dueFeeId: 'due-2', month: FeeMonth.September, year: 2026,
            total: 100, paid: 100, refunded: 0, adjusted: 0, adjustable: 60 },
        ],
      }],
    },
    isLoading: false, isFetching: false, refetch: vi.fn(),
  };
  render(<FeeHeadRefundTable formik={formik()} mode="adjustment" compact />);

  fireEvent.change(screen.getByRole('textbox', { name: 'Amount per installment' }),
    { target: { value: '40' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply to all installments' }));
  expect(mocks.setFieldValue).toHaveBeenLastCalledWith('feeHeadRefunds', [
    { feeHeadId: 'transport', months: [
      expect.objectContaining({ dueFeeId: 'due-1', amount: '40' }),
      expect.objectContaining({ dueFeeId: 'due-2', amount: '40' }),
    ] },
  ]);

  fireEvent.change(screen.getByRole('textbox', { name: 'Total adjustment amount' }),
    { target: { value: '100' } });
  fireEvent.click(screen.getByRole('button', { name: 'Auto-distribute equal' }));
  expect(mocks.setFieldValue).toHaveBeenLastCalledWith('feeHeadRefunds', [
    { feeHeadId: 'transport', months: [
      expect.objectContaining({ dueFeeId: 'due-1', amount: '50' }),
      expect.objectContaining({ dueFeeId: 'due-2', amount: '50' }),
    ] },
  ]);
});
