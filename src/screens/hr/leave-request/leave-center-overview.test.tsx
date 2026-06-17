import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { EMPTY_LEAVE_OVERVIEW } from './leave-overview.utils';
import { LeaveCenterOverviewPanel, getLeaveUtilizationPercent } from './leave-center-overview';

import type { LeaveOverviewData } from './leave-overview.utils';

vi.mock('src/components/chart', () => ({
  Chart: ({ series }: { series: number[] }) => (
    <div data-testid="leave-utilization-chart">{series.join(' / ')}</div>
  ),
  useChart: (options: unknown) => options,
}));

const overview: LeaveOverviewData = {
  totalLeaves: 10,
  usedLeaves: 4,
  remainingLeaves: 6,
  pendingLeaveDays: 1.5,
  bucketBreakdown: [
    {
      bucketId: 'Paid',
      bucketName: 'Paid',
      total: 10,
      used: 4,
      pendingDays: 1.5,
      remaining: 6,
      isUnlimited: false,
    },
  ],
};

describe('LeaveCenterOverviewPanel', () => {
  it('shows loading placeholders for metrics and utilization', () => {
    render(<LeaveCenterOverviewPanel overview={EMPTY_LEAVE_OVERVIEW} isLoading />);

    expect(screen.getByTestId('leave-overview-available-loading')).toBeInTheDocument();
    expect(screen.getByTestId('leave-overview-accrued-loading')).toBeInTheDocument();
    expect(screen.getByTestId('leave-overview-used-loading')).toBeInTheDocument();
    expect(screen.getByTestId('leave-overview-chart-loading')).toBeInTheDocument();
  });

  it('renders primary metrics and the utilization chart for finite balances', () => {
    render(<LeaveCenterOverviewPanel overview={overview} isLoading={false} />);

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Accrued')).toBeInTheDocument();
    expect(screen.getByText('Used')).toBeInTheDocument();
    expect(screen.getByText('40% used')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('1.5')).toBeInTheDocument();
    expect(screen.getByTestId('leave-utilization-chart')).toHaveTextContent('4 / 6');
  });

  it('shows a clean empty state when no finite balance is allocated', () => {
    render(<LeaveCenterOverviewPanel overview={EMPTY_LEAVE_OVERVIEW} isLoading={false} />);

    expect(screen.getByText('No finite leave entitlement')).toBeInTheDocument();
    expect(screen.getByText('Balance will appear after allocation.')).toBeInTheDocument();
    expect(screen.queryByTestId('leave-utilization-chart')).not.toBeInTheDocument();
  });

  it('handles unlimited or zero-balance buckets without drawing a finite chart', () => {
    const unlimitedOverview: LeaveOverviewData = {
      ...EMPTY_LEAVE_OVERVIEW,
      usedLeaves: 2,
      bucketBreakdown: [
        {
          bucketId: 'Unpaid',
          bucketName: 'Unpaid',
          total: 0,
          used: 2,
          pendingDays: 0,
          remaining: 0,
          isUnlimited: true,
        },
      ],
    };

    render(<LeaveCenterOverviewPanel overview={unlimitedOverview} isLoading={false} />);

    expect(screen.getByText('No finite leave entitlement')).toBeInTheDocument();
    expect(screen.getByText('Unlimited unpaid leave is tracked in history.')).toBeInTheDocument();
    expect(screen.queryByTestId('leave-utilization-chart')).not.toBeInTheDocument();
  });

  it('calculates utilization without dividing by zero', () => {
    expect(getLeaveUtilizationPercent(overview)).toBe(40);
    expect(getLeaveUtilizationPercent(EMPTY_LEAVE_OVERVIEW)).toBe(0);
  });
});
