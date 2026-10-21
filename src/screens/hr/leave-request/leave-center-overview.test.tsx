import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, within, waitFor } from '@testing-library/react';

import { EMPTY_LEAVE_OVERVIEW } from './leave-overview.utils';
import { LeaveCenterOverviewPanel } from './leave-center-overview';

import type { LeaveOverviewData } from './leave-overview.utils';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

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
    {
      bucketId: 'Unpaid',
      bucketName: 'Unpaid',
      total: 0,
      used: 2,
      pendingDays: 0.5,
      remaining: 0,
      isUnlimited: true,
    },
  ],
};
const renderPanel = (props: React.ComponentProps<typeof LeaveCenterOverviewPanel>) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LeaveCenterOverviewPanel {...props} />
    </ThemeProvider>
  );

describe('LeaveCenterOverviewPanel', () => {
  it('shows loading before deciding the allocation is empty', () => {
    renderPanel({ overview: EMPTY_LEAVE_OVERVIEW, isLoading: true });
    expect(screen.getByRole('status', { name: 'Loading leave balances' })).toBeInTheDocument();
    expect(screen.queryByText(/hasn't been set up/)).not.toBeInTheDocument();
  });

  it('shows each finite and unlimited type with its own usage and pending days', () => {
    renderPanel({ overview, isLoading: false });
    const paid = within(screen.getByRole('region', { name: 'Paid leave balance' }));
    expect(paid.getByText('6')).toBeInTheDocument();
    expect(paid.getByText('Used')).toBeInTheDocument();
    expect(paid.getByText('4')).toBeInTheDocument();
    expect(paid.getByText('Pending')).toBeInTheDocument();
    expect(paid.getByText('1.5')).toBeInTheDocument();
    const unpaid = within(screen.getByRole('region', { name: 'Unpaid leave balance' }));
    expect(unpaid.getByText('Unlimited')).toBeInTheDocument();
    expect(unpaid.getByText('2')).toBeInTheDocument();
    expect(unpaid.getByText('0.5')).toBeInTheDocument();
    expect(unpaid.getByText('No fixed entitlement limit')).toBeInTheDocument();
    expect(unpaid.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('reveals accrued days and finite usage through a disclosure', async () => {
    const user = userEvent.setup();
    renderPanel({ overview, isLoading: false });
    const paid = within(screen.getByRole('region', { name: 'Paid leave balance' }));
    const summary = paid.getByRole('button', { name: 'Balance details' });
    expect(summary).toHaveAttribute('aria-expanded', 'false');
    await user.click(summary);
    expect(summary).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(paid.getByText('10 days')).toBeVisible());
    expect(paid.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
  });

  it('shows one allocation message without unused metrics or table tools', () => {
    renderPanel({ overview: EMPTY_LEAVE_OVERVIEW, isLoading: false });
    expect(
      screen.getAllByText("Your leave allocation hasn't been set up for this year.")
    ).toHaveLength(1);
    expect(screen.getByText(/Contact HR for assistance/)).toBeInTheDocument();
    expect(screen.queryByText('Utilization')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
  });

  it('preserves negative and fractional balances instead of rounding or clamping them', () => {
    renderPanel({
      overview: {
        ...overview,
        bucketBreakdown: [{ ...overview.bucketBreakdown[0], remaining: -1.5, total: 0 }],
      },
      isLoading: false,
    });
    expect(screen.getByText('-1.5')).toBeInTheDocument();
    expect(screen.queryByText(/% used/)).not.toBeInTheDocument();
  });

  it('retains visible cards while refreshing the same balance', () => {
    renderPanel({ overview, isLoading: true });
    expect(screen.getByRole('region', { name: 'Paid leave balance' })).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Refreshing leave balances' })
    ).toBeInTheDocument();
  });

  it('shows a retryable read error instead of reporting a missing allocation', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderPanel({
      overview: EMPTY_LEAVE_OVERVIEW,
      isLoading: false,
      error: { status: 503 },
      onRetry,
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load leave balances');
    expect(screen.queryByText(/hasn't been set up/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
