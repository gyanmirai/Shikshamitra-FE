import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { DashboardFocusView } from './dashboard-focus-view';

import type { DashboardFocus } from './dashboard-focus-types';

vi.mock('src/components/chart', () => ({ Chart: () => <div>Chart</div>, useChart: (v: unknown) => v }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

const focus: DashboardFocus = {
  kind: 'payroll', widgetId: 'payroll', title: 'Saved Payroll Evidence',
  description: 'Latest saved payroll validation.', status: 'ready', series: [], items: [],
  metrics: [{ key: 'blocked', label: 'Blocking checks', value: 0, unit: 'count' }],
  accessMode: 'staff', requiredPermissions: [],
};

describe('Dashboard focus states', () => {
  it('makes missing focus unavailable without inventing ready data', () => {
    render(<DashboardFocusView focus={undefined} />);
    expect(screen.getByText('Focus data is unavailable.')).toBeVisible();
    expect(screen.queryByText(/healthy|ready/i)).not.toBeInTheDocument();
  });

  it('preserves the section identity while initially loading', () => {
    render(<DashboardFocusView focus={focus} isLoading />);
    expect(screen.getByRole('heading', { name: focus.title })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Loading focus data');
    expect(screen.queryByText('Blocking checks')).not.toBeInTheDocument();
  });

  it.each(['error', 'unavailable', 'empty'] as const)('hides stale data for %s', (status) => {
    render(<DashboardFocusView focus={{ ...focus, status, message: 'Saved evidence cannot be read.' }} />);
    expect(screen.getByText('Saved evidence cannot be read.')).toBeVisible();
    expect(screen.queryByText('Blocking checks')).not.toBeInTheDocument();
  });

  it('offers keyboard retry for an error', async () => {
    const onRetry = vi.fn();
    render(<DashboardFocusView focus={{ ...focus, status: 'error' }} onRetry={onRetry} />);
    screen.getByRole('button', { name: 'Retry' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('keeps zero distinct from missing values and does not infer payroll readiness', () => {
    render(<DashboardFocusView focus={{ ...focus, metrics: [...focus.metrics,
      { key: 'amount', label: 'Net pay', value: null, unit: 'INR' }] }} />);
    expect(screen.getByText('0')).toBeVisible();
    expect(screen.getByText('Unavailable')).toBeVisible();
    expect(screen.queryByText(/healthy|ready|100%/i)).not.toBeInTheDocument();
    expect(screen.getByText('Snapshot time unavailable')).toBeVisible();
    expect(screen.getByText('Period unavailable')).toBeVisible();
  });

  it('shows the saved period and actual evidence timestamp', () => {
    render(<DashboardFocusView focus={{ ...focus, periodLabel: 'October 2026',
      asOfUtc: '2026-10-28T08:00:00Z' }} isRefreshing />);
    expect(screen.getByText('October 2026')).toBeVisible();
    expect(screen.getByText(/^As of .*28 Oct 2026/)).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing focus data');
    expect(screen.getByText('Blocking checks')).toBeVisible();
  });

  it('suppresses all workflow links in personal focus even for safe supplied paths', () => {
    render(<DashboardFocusView focus={{ ...focus, kind: 'timetable', accessMode: 'personal',
      items: [{ id: 'lesson', title: 'Mathematics', time: '09:00', endTime: '09:45',
        drilldownUrl: '/academic/timetable' }] }} />);
    expect(screen.getByText('Mathematics')).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText(/today|substitution/i)).not.toBeInTheDocument();
  });

  it('renders safe staff links and rejects external paths', () => {
    render(<DashboardFocusView focus={{ ...focus, kind: 'timetable', items: [
      { id: 'safe', title: 'Published timetable', drilldownUrl: '/academic/timetable' },
      { id: 'bad', title: 'Unsafe route', drilldownUrl: '//outside.example' },
    ] }} />);
    expect(screen.getByRole('link', { name: 'View details: Published timetable' }))
      .toHaveAttribute('href', '/academic/timetable');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
